import { normalizeAnswer } from "../answerParser.js";

// Only simple representations: never round through Number, including at 0 and 1.
function probabilityRatio(input) {
  if (input == null || !["string", "number"].includes(typeof input)) return null;
  // The shared normalizer evaluates powers with floating point arithmetic.
  // Powers and expressions are outside this rule's deliberately limited grammar.
  if (String(input).includes("^")) return null;
  const text = normalizeAnswer(input);
  const match = text.match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?(%)?$/);
  if (!match) return null;
  const decimal = value => {
    const [whole, fraction = ""] = value.split(".");
    return [BigInt(whole + fraction), 10n ** BigInt(fraction.length)];
  };
  const [a, b] = decimal(match[1]);
  const [c, d] = decimal(match[2] ?? "1");
  if (c === 0n) return null;
  let numerator = a * d;
  let denominator = b * c * (match[3] ? 100n : 1n);
  if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
  if (numerator < 0n || numerator > denominator) return null;
  return { numerator, denominator };
}

export function validateProbability({ userInput, validAnswers }) {
  const actual = probabilityRatio(userInput);
  if (!actual) return { valid: false, errorCode: "INVALID_PROBABILITY" };
  const valid = (validAnswers ?? []).some(answer => {
    const expected = probabilityRatio(answer);
    return expected && actual.numerator * expected.denominator === expected.numerator * actual.denominator;
  });
  return { valid, errorCode: valid ? null : "WRONG_PROBABILITY_VALUE" };
}
