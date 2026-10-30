import { parseAlgebraExpression } from "./algebraValidator.js";

/**
 * Declarative rule (JSON serializable):
 * { type: "calculationExpression", patterns: ["(2+3)/2"],
 *   equivalences: { associativeAddition: true, commutativeAddition: true,
 *     associativeMultiplication: true, commutativeMultiplication: true },
 *   allowNumberOnly: false }
 * All options default to false. Patterns, not answers, define accepted structures.
 * allowNumberOnly permits only an explicitly declared numeric pattern; it never
 * evaluates other patterns into additional accepted answers.
 * Partial calculations must be declared as additional patterns. A future
 * partialEvaluation option would need explicit allowed subtrees; no such option
 * or automatic simplification is implemented here.
 * Grammar: finite decimal numbers, explicit + - * /, unary signs, parentheses,
 * and simple LaTeX fractions. Variables, powers and implicit products are refused.
 * Limits apply equally to input and patterns (4096 characters, 128 tree levels).
 */
const optionNames = [
  "associativeAddition", "commutativeAddition",
  "associativeMultiplication", "commutativeMultiplication"
];
const failure = errorCode => ({ valid: false, errorCode });

function parse(input) {
  if (!["string", "number"].includes(typeof input)) throw new Error("INPUT");
  const text = String(input);
  if (!text.trim() || text.length > 4096) throw new Error("INPUT");
  return parseAlgebraExpression(text
    .replace(/\\div(?![a-zA-Z])/g, "/")
    .replace(/÷/g, "/"));
}

// Validate every subtree, including intermediate arithmetic, before matching.
function inspect(node, depth = 0) {
  if (!node || depth > 128) throw new Error("DEPTH");
  const child = value => inspect(value, depth + 1);
  let value;
  switch (node.type) {
    case "number": value = node.value; break;
    case "parentheses": value = child(node.expression); break;
    case "unaryPlus": value = child(node.operand); break;
    case "unaryMinus": value = -child(node.operand); break;
    case "add": value = child(node.left) + child(node.right); break;
    case "subtract": value = child(node.left) - child(node.right); break;
    case "multiply":
      if (node.implicit) throw new Error("IMPLICIT_PRODUCT");
      value = child(node.left) * child(node.right);
      break;
    case "divide": {
      const numerator = child(node.left);
      const denominator = child(node.right);
      if (denominator === 0) throw new Error("DIVISION_BY_ZERO");
      value = numerator / denominator;
      break;
    }
    default: throw new Error("UNSUPPORTED_NODE");
  }
  if (!Number.isFinite(value)) throw new Error("NON_FINITE");
  return value;
}

function unwrap(node) {
  while (node.type === "parentheses") node = node.expression;
  return node;
}

function numberOnly(node) {
  node = unwrap(node);
  if (node.type === "unaryPlus" || node.type === "unaryMinus") {
    return numberOnly(node.operand);
  }
  return node.type === "number";
}

function structure(node, options) {
  node = unwrap(node);
  if (node.type === "number") return `number(${node.value})`;
  if (node.type === "unaryPlus" || node.type === "unaryMinus") {
    return `${node.type}(${structure(node.operand, options)})`;
  }
  const family = node.type === "add" ? "Addition"
    : node.type === "multiply" ? "Multiplication" : null;
  const children = [];
  function collect(child) {
    child = unwrap(child);
    if (family && options[`associative${family}`] && child.type === node.type) {
      collect(child.left);
      collect(child.right);
    } else {
      children.push(structure(child, options));
    }
  }
  collect(node.left);
  collect(node.right);
  if (family && options[`commutative${family}`]) children.sort();
  return `${node.type}(${children.join(",")})`;
}

export function validateCalculationExpression({
  userInput, patterns, equivalences = {}, allowNumberOnly = false
} = {}) {
  let references;
  try {
    if (!Array.isArray(patterns) || !patterns.length || patterns.length > 64 ||
        !equivalences || typeof equivalences !== "object" || Array.isArray(equivalences) ||
        typeof allowNumberOnly !== "boolean" ||
        Object.entries(equivalences).some(([key, value]) =>
          !optionNames.includes(key) || typeof value !== "boolean")) {
      throw new Error("CONFIGURATION");
    }
    references = Array.from(patterns, pattern => {
      const ast = parse(pattern);
      inspect(ast);
      if (!allowNumberOnly && numberOnly(ast)) throw new Error("NUMBER_PATTERN");
      return structure(ast, equivalences);
    });
  } catch {
    return failure("INVALID_CALCULATION_CONFIGURATION");
  }
  try {
    const ast = parse(userInput);
    inspect(ast);
    if (!allowNumberOnly && numberOnly(ast)) return failure("EXPECTED_CALCULATION");
    return references.includes(structure(ast, equivalences))
      ? { valid: true, errorCode: null }
      : failure("WRONG_CALCULATION_STRUCTURE");
  } catch {
    return failure("INVALID_CALCULATION_EXPRESSION");
  }
}
