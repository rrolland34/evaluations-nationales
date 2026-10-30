// core/validators/algebraValidator.js

/**
 * Normalise une expression algébrique
 * sans la développer ni la réduire.
 *
 * Cette étape ne doit surtout pas
 * modifier la structure mathématique
 * de l'expression saisie.
 */
function normalizeAlgebraInput(
  userInput
) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return "";
  }

  return String(userInput)
    .trim()

    // Retire les délimiteurs MathJax.
    .replace(/^\\\(/, "")
    .replace(/\\\)$/, "")

    // Fractions LaTeX simples.
    .replace(
      /\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g,
      "($1)/($2)"
    )

    // Virgule décimale française.
    .replace(/\{,\}/g, ".")
    .replace(/,/g, ".")

    // Multiplications.
    .replace(/\\times/g, "*")
    .replace(/×/g, "*")

    // Puissances usuelles.
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")

    // Espaces LaTeX.
    .replace(/\\,/g, "")
    .replace(/\\ /g, "")
    .replace(/~/g, "")

    // Espaces ordinaires.
    .replace(/\s+/g, "");
}


function tokenizeAlgebra(
  expression
) {
  const tokens = [];

  let index = 0;

  while (
    index <
    expression.length
  ) {
    const character =
      expression[index];

    // Nombre entier ou décimal.
    if (
      /[0-9.]/.test(
        character
      )
    ) {
      let number =
        character;

      index++;

      while (
        index <
          expression.length &&
        /[0-9.]/.test(
          expression[index]
        )
      ) {
        number +=
          expression[index];

        index++;
      }

      // Un nombre ne peut contenir
      // qu'un seul point décimal.
      if (
        (
          number.match(
            /\./g
          ) ?? []
        ).length > 1
      ) {
        throw new Error(
          "INVALID_NUMBER"
        );
      }

      tokens.push({
        type:
          "number",

        value:
          number
      });

      continue;
    }

    // Variable d'une seule lettre.
    if (
      /[a-zA-Z]/.test(
        character
      )
    ) {
      tokens.push({
        type:
          "variable",

        value:
          character
            .toLowerCase()
      });

      index++;

      continue;
    }

    // Opérateurs.
    if (
      "+-*/^".includes(
        character
      )
    ) {
      tokens.push({
        type:
          "operator",

        value:
          character
      });

      index++;

      continue;
    }

    // Parenthèses.
    if (
      character === "(" ||
      character === ")"
    ) {
      tokens.push({
        type:
          "parenthesis",

        value:
          character
      });

      index++;

      continue;
    }

    throw new Error(
      "INVALID_CHARACTER"
    );
  }

  return tokens;
}


export function evaluateAlgebraAst(
  node,
  variables = {}
) {
  switch (
    node.type
  ) {
    case "number":
      return node.value;


    case "variable":
      if (
        !Object.prototype.hasOwnProperty.call(
          variables,
          node.name
        )
      ) {
        throw new Error(
          "MISSING_VARIABLE_VALUE"
        );
      }

      return variables[
        node.name
      ];


    case "add":
      return (
        evaluateAlgebraAst(
          node.left,
          variables
        ) +
        evaluateAlgebraAst(
          node.right,
          variables
        )
      );


    case "subtract":
      return (
        evaluateAlgebraAst(
          node.left,
          variables
        ) -
        evaluateAlgebraAst(
          node.right,
          variables
        )
      );


    case "multiply":
      return (
        evaluateAlgebraAst(
          node.left,
          variables
        ) *
        evaluateAlgebraAst(
          node.right,
          variables
        )
      );


    case "divide":
      return (
        evaluateAlgebraAst(
          node.left,
          variables
        ) /
        evaluateAlgebraAst(
          node.right,
          variables
        )
      );


    case "power":
      return (
        evaluateAlgebraAst(
          node.base,
          variables
        ) **
        evaluateAlgebraAst(
          node.exponent,
          variables
        )
      );


    case "unaryPlus":
      return evaluateAlgebraAst(
        node.operand,
        variables
      );


    case "unaryMinus":
      return -evaluateAlgebraAst(
        node.operand,
        variables
      );


    case "parentheses":
      return evaluateAlgebraAst(
        node.expression,
        variables
      );


    default:
      throw new Error(
        "UNKNOWN_AST_NODE"
      );
  }
}


function areNumbersClose(
  value1,
  value2,
  tolerance = 1e-9
) {
  return (
    Math.abs(
      value1 - value2
    ) <= tolerance
  );
}


export function areAlgebraExpressionsEquivalent(
  ast1,
  ast2,
  {
    tolerance = 1e-9
  } = {}
) {
  const testValues = [
    -5,
    -3,
    -1,
    0,
    1,
    2,
    4,
    7
  ];

  for (
    const value of testValues
  ) {
    const variables = {
      x: value,
      y: value + 2,
      a: value - 1,
      b: 2 * value + 1
    };

    let result1;
    let result2;

    try {
      result1 =
        evaluateAlgebraAst(
          ast1,
          variables
        );

      result2 =
        evaluateAlgebraAst(
          ast2,
          variables
        );

    } catch (
      error
    ) {
      return false;
    }


    // Une division peut produire
    // Infinity ou NaN pour certaines
    // valeurs de test.
    if (
      !Number.isFinite(
        result1
      ) ||
      !Number.isFinite(
        result2
      )
    ) {
      continue;
    }


    if (
      !areNumbersClose(
        result1,
        result2,
        tolerance
      )
    ) {
      return false;
    }
  }

  return true;
}


function createMonomialKey(
  powers
) {
  return Object.entries(
    powers
  )
    .filter(
      ([, exponent]) =>
        exponent !== 0
    )
    .sort(
      ([variable1], [variable2]) =>
        variable1.localeCompare(
          variable2
        )
    )
    .map(
      ([variable, exponent]) =>
        `${variable}^${exponent}`
    )
    .join("*");
}


function parseMonomialKey(
  key
) {
  if (
    key === ""
  ) {
    return {};
  }

  const powers = {};

  key
    .split("*")
    .forEach(
      part => {
        const [
          variable,
          exponent
        ] =
          part.split("^");

        powers[variable] =
          Number(
            exponent
          );
      }
    );

  return powers;
}


function cleanPolynomial(
  polynomial,
  tolerance = 1e-12
) {
  const result =
    new Map();

  for (
    const [
      key,
      coefficient
    ] of polynomial
  ) {
    if (
      Math.abs(
        coefficient
      ) > tolerance
    ) {
      result.set(
        key,
        coefficient
      );
    }
  }

  return result;
}


function addPolynomials(
  polynomial1,
  polynomial2
) {
  const result =
    new Map(
      polynomial1
    );

  for (
    const [
      key,
      coefficient
    ] of polynomial2
  ) {
    result.set(
      key,
      (
        result.get(
          key
        ) ?? 0
      ) + coefficient
    );
  }

  return cleanPolynomial(
    result
  );
}


function scalePolynomial(
  polynomial,
  factor
) {
  const result =
    new Map();

  for (
    const [
      key,
      coefficient
    ] of polynomial
  ) {
    result.set(
      key,
      coefficient *
      factor
    );
  }

  return cleanPolynomial(
    result
  );
}


function multiplyMonomialKeys(
  key1,
  key2
) {
  const powers1 =
    parseMonomialKey(
      key1
    );

  const powers2 =
    parseMonomialKey(
      key2
    );

  const resultPowers = {
    ...powers1
  };

  for (
    const [
      variable,
      exponent
    ] of Object.entries(
      powers2
    )
  ) {
    resultPowers[variable] =
      (
        resultPowers[
          variable
        ] ?? 0
      ) +
      exponent;
  }

  return createMonomialKey(
    resultPowers
  );
}


function multiplyPolynomials(
  polynomial1,
  polynomial2
) {
  const result =
    new Map();

  for (
    const [
      key1,
      coefficient1
    ] of polynomial1
  ) {
    for (
      const [
        key2,
        coefficient2
      ] of polynomial2
    ) {
      const key =
        multiplyMonomialKeys(
          key1,
          key2
        );

      const coefficient =
        coefficient1 *
        coefficient2;

      result.set(
        key,
        (
          result.get(
            key
          ) ?? 0
        ) + coefficient
      );
    }
  }

  return cleanPolynomial(
    result
  );
}


export function astToPolynomial(
  node
) {
  switch (
    node.type
  ) {
    case "number":
      return new Map([
        [
          "",
          node.value
        ]
      ]);


    case "variable":
      return new Map([
        [
          createMonomialKey({
            [node.name]: 1
          }),
          1
        ]
      ]);


    case "parentheses":
      return astToPolynomial(
        node.expression
      );


    case "unaryPlus":
      return astToPolynomial(
        node.operand
      );


    case "unaryMinus":
      return scalePolynomial(
        astToPolynomial(
          node.operand
        ),
        -1
      );


    case "add":
      return addPolynomials(
        astToPolynomial(
          node.left
        ),
        astToPolynomial(
          node.right
        )
      );


    case "subtract":
      return addPolynomials(
        astToPolynomial(
          node.left
        ),
        scalePolynomial(
          astToPolynomial(
            node.right
          ),
          -1
        )
      );


    case "multiply":
      return multiplyPolynomials(
        astToPolynomial(
          node.left
        ),
        astToPolynomial(
          node.right
        )
      );


    case "power": {
      const exponentPolynomial =
        astToPolynomial(
          node.exponent
        );

      if (
        exponentPolynomial.size !== 1 ||
        !exponentPolynomial.has("")
      ) {
        throw new Error(
          "NON_CONSTANT_EXPONENT"
        );
      }

      const exponent =
        exponentPolynomial.get("");

      if (
        !Number.isInteger(
          exponent
        ) ||
        exponent < 0
      ) {
        throw new Error(
          "INVALID_POLYNOMIAL_EXPONENT"
        );
      }

      const base =
        astToPolynomial(
          node.base
        );

      let result =
        new Map([
          [
            "",
            1
          ]
        ]);

      for (
        let index = 0;
        index < exponent;
        index++
      ) {
        result =
          multiplyPolynomials(
            result,
            base
          );
      }

      return result;
    }


    case "divide": {
      const denominator =
        astToPolynomial(
          node.right
        );

      if (
        denominator.size !== 1 ||
        !denominator.has("")
      ) {
        throw new Error(
          "NON_CONSTANT_DENOMINATOR"
        );
      }

      const divisor =
        denominator.get("");

      if (
        divisor === 0
      ) {
        throw new Error(
          "DIVISION_BY_ZERO"
        );
      }

      return scalePolynomial(
        astToPolynomial(
          node.left
        ),
        1 / divisor
      );
    }


    default:
      throw new Error(
        "UNSUPPORTED_POLYNOMIAL_NODE"
      );
  }
}


function arePolynomialsEqual(
  polynomial1,
  polynomial2,
  tolerance = 1e-9
) {
  const cleanPolynomial1 =
    cleanPolynomial(
      polynomial1,
      tolerance
    );

  const cleanPolynomial2 =
    cleanPolynomial(
      polynomial2,
      tolerance
    );

  const allKeys =
    new Set([
      ...cleanPolynomial1.keys(),
      ...cleanPolynomial2.keys()
    ]);

  for (
    const key of allKeys
  ) {
    const coefficient1 =
      cleanPolynomial1.get(
        key
      ) ?? 0;

    const coefficient2 =
      cleanPolynomial2.get(
        key
      ) ?? 0;

    if (
      Math.abs(
        coefficient1 -
        coefficient2
      ) > tolerance
    ) {
      return false;
    }
  }

  return true;
}


export function areAlgebraExpressionsSymbolicallyEquivalent(
  ast1,
  ast2,
  {
    tolerance = 1e-9
  } = {}
) {
  try {
    const polynomial1 =
      astToPolynomial(
        ast1
      );

    const polynomial2 =
      astToPolynomial(
        ast2
      );

    return arePolynomialsEqual(
      polynomial1,
      polynomial2,
      tolerance
    );

  } catch (
    error
  ) {
    return false;
  }
}


function unwrapParentheses(
  node
) {
  let currentNode =
    node;

  while (
    currentNode?.type ===
    "parentheses"
  ) {
    currentNode =
      currentNode.expression;
  }

  return currentNode;
}


function isAdditionOrSubtraction(
  node
) {
  const unwrappedNode =
    unwrapParentheses(
      node
    );

  return (
    unwrappedNode?.type ===
      "add" ||
    unwrappedNode?.type ===
      "subtract"
  );
}


export function isAlgebraDeveloped(
  node
) {
  if (!node) {
    return false;
  }

  switch (
    node.type
  ) {
    case "number":
    case "variable":
      return true;


    case "parentheses":
      return isAlgebraDeveloped(
        node.expression
      );


    case "unaryPlus":
    case "unaryMinus":
      return isAlgebraDeveloped(
        node.operand
      );


    case "add":
    case "subtract":
      return (
        isAlgebraDeveloped(
          node.left
        ) &&
        isAlgebraDeveloped(
          node.right
        )
      );


    case "multiply":
      if (
        isAdditionOrSubtraction(
          node.left
        ) ||
        isAdditionOrSubtraction(
          node.right
        )
      ) {
        return false;
      }

      return (
        isAlgebraDeveloped(
          node.left
        ) &&
        isAlgebraDeveloped(
          node.right
        )
      );


    case "divide":
      return (
        isAlgebraDeveloped(
          node.left
        ) &&
        isAlgebraDeveloped(
          node.right
        )
      );


    case "power": {
      const base =
        unwrapParentheses(
          node.base
        );

      if (
        base?.type === "add" ||
        base?.type === "subtract"
      ) {
        return false;
      }

      return (
        isAlgebraDeveloped(
          node.base
        ) &&
        isAlgebraDeveloped(
          node.exponent
        )
      );
    }


    default:
      return false;
  }
}


function isMonomialAst(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return false;
  }

  switch (
    currentNode.type
  ) {
    case "number":
    case "variable":
      return true;


    case "unaryPlus":
    case "unaryMinus":
      return isMonomialAst(
        currentNode.operand
      );


    case "multiply":
      return (
        isMonomialAst(
          currentNode.left
        ) &&
        isMonomialAst(
          currentNode.right
        )
      );


    case "divide": {
      const denominator =
        unwrapParentheses(
          currentNode.right
        );

      return (
        isMonomialAst(
          currentNode.left
        ) &&
        denominator?.type ===
          "number"
      );
    }


    case "power": {
      const exponent =
        unwrapParentheses(
          currentNode.exponent
        );

      return (
        isMonomialAst(
          currentNode.base
        ) &&
        exponent?.type ===
          "number" &&
        Number.isInteger(
          exponent.value
        ) &&
        exponent.value >= 0
      );
    }


    default:
      return false;
  }
}


function containsReducibleNumericOperation(
  node
) {
  if (!node) {
    return false;
  }

  const currentNode =
    unwrapParentheses(
      node
    );

  switch (
    currentNode.type
  ) {
    case "number":
    case "variable":
      return false;


    case "unaryPlus":
    case "unaryMinus":
      return containsReducibleNumericOperation(
        currentNode.operand
      );


    case "add":
    case "subtract":
      return (
        containsReducibleNumericOperation(
          currentNode.left
        ) ||
        containsReducibleNumericOperation(
          currentNode.right
        )
      );


    case "multiply":
    case "divide": {
      const left =
        unwrapParentheses(
          currentNode.left
        );

      const right =
        unwrapParentheses(
          currentNode.right
        );

      if (
        left?.type ===
          "number" &&
        right?.type ===
          "number"
      ) {
        return true;
      }

      return (
        containsReducibleNumericOperation(
          currentNode.left
        ) ||
        containsReducibleNumericOperation(
          currentNode.right
        )
      );
    }


    case "power": {
      const base =
        unwrapParentheses(
          currentNode.base
        );

      const exponent =
        unwrapParentheses(
          currentNode.exponent
        );

      if (
        base?.type ===
          "number" &&
        exponent?.type ===
          "number"
      ) {
        return true;
      }

      return (
        containsReducibleNumericOperation(
          currentNode.base
        ) ||
        containsReducibleNumericOperation(
          currentNode.exponent
        )
      );
    }


    default:
      return false;
  }
}


function collectAdditiveTerms(
  node,
  terms = []
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (
    currentNode.type ===
    "add"
  ) {
    collectAdditiveTerms(
      currentNode.left,
      terms
    );

    collectAdditiveTerms(
      currentNode.right,
      terms
    );

    return terms;
  }

  if (
    currentNode.type ===
    "subtract"
  ) {
    collectAdditiveTerms(
      currentNode.left,
      terms
    );

    terms.push({
      node:
        currentNode.right,

      sign:
        -1
    });

    return terms;
  }

  terms.push({
    node:
      currentNode,

    sign:
      1
  });

  return terms;
}


function getMonomialKeyFromAst(
  node
) {
  try {
    const polynomial =
      astToPolynomial(
        node
      );

    if (
      polynomial.size !== 1
    ) {
      return null;
    }

    return (
      polynomial.keys()
        .next()
        .value ?? ""
    );

  } catch (
    error
  ) {
    return null;
  }
}


function getAstStructureKey(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return "";
  }


  switch (
    currentNode.type
  ) {
    case "number":
      return `number:${currentNode.value}`;


    case "variable":
      return `variable:${currentNode.name}`;


    case "unaryPlus":
      return getAstStructureKey(
        currentNode.operand
      );


    case "unaryMinus":
      return (
        `negative(` +
        `${getAstStructureKey(
          currentNode.operand
        )}` +
        `)`
      );


    case "add":
    case "subtract":
    case "multiply":
    case "divide":
      return (
        `${currentNode.type}(` +
        `${getAstStructureKey(
          currentNode.left
        )},` +
        `${getAstStructureKey(
          currentNode.right
        )}` +
        `)`
      );


    case "power":
      return (
        `power(` +
        `${getAstStructureKey(
          currentNode.base
        )},` +
        `${getAstStructureKey(
          currentNode.exponent
        )}` +
        `)`
      );


    default:
      return "";
  }
}


function isNonMonomialFactor(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return false;
  }

  return (
    currentNode.type === "add" ||
    currentNode.type === "subtract"
  );
}


function getTermReductionKey(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return null;
  }


  const monomialKey =
    getMonomialKeyFromAst(
      currentNode
    );


  if (
    monomialKey !== null
  ) {
    return (
      `monomial:` +
      `${monomialKey}`
    );
  }


  if (
    currentNode.type ===
      "multiply"
  ) {
    const left =
      unwrapParentheses(
        currentNode.left
      );

    const right =
      unwrapParentheses(
        currentNode.right
      );


    if (
      isNonMonomialFactor(
        right
      )
    ) {
      return (
        `factor:` +
        `${getAstStructureKey(
          right
        )}`
      );
    }


    if (
      isNonMonomialFactor(
        left
      )
    ) {
      return (
        `factor:` +
        `${getAstStructureKey(
          left
        )}`
      );
    }


    const rightKey =
      getTermReductionKey(
        currentNode.right
      );

    if (
      rightKey?.startsWith(
        "factor:"
      )
    ) {
      return rightKey;
    }


    const leftKey =
      getTermReductionKey(
        currentNode.left
      );

    if (
      leftKey?.startsWith(
        "factor:"
      )
    ) {
      return leftKey;
    }
  }


  return null;
}


function containsLikeTerms(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return false;
  }


  if (
    currentNode.type === "add" ||
    currentNode.type === "subtract"
  ) {
    const terms =
      collectAdditiveTerms(
        currentNode
      );

    const encounteredKeys =
      new Set();


    for (
      const term of terms
    ) {
      const key =
        getTermReductionKey(
          term.node
        );

      if (
        key !== null
      ) {
        if (
          encounteredKeys.has(
            key
          )
        ) {
          return true;
        }

        encounteredKeys.add(
          key
        );
      }
    }
  }


  switch (
    currentNode.type
  ) {
    case "number":
    case "variable":
      return false;


    case "unaryPlus":
    case "unaryMinus":
      return containsLikeTerms(
        currentNode.operand
      );


    case "add":
    case "subtract":
    case "multiply":
    case "divide":
      return (
        containsLikeTerms(
          currentNode.left
        ) ||
        containsLikeTerms(
          currentNode.right
        )
      );


    case "power":
      return (
        containsLikeTerms(
          currentNode.base
        ) ||
        containsLikeTerms(
          currentNode.exponent
        )
      );


    default:
      return false;
  }
}


export function isAlgebraReduced(
  node
) {
  if (!node) {
    return false;
  }


  if (
    containsReducibleNumericOperation(
      node
    )
  ) {
    return false;
  }


  if (
    containsLikeTerms(
      node
    )
  ) {
    return false;
  }


  return true;
}


function containsAdditiveFactor(
  node
) {
  const currentNode =
    unwrapParentheses(
      node
    );

  if (!currentNode) {
    return false;
  }

  if (
    currentNode.type === "add" ||
    currentNode.type === "subtract"
  ) {
    return true;
  }

  return false;
}


export function isAlgebraFactorized(
  node
) {
  if (!node) {
    return false;
  }

  const currentNode =
    unwrapParentheses(
      node
    );

  switch (
    currentNode.type
  ) {
    case "multiply":
      return (
        containsAdditiveFactor(
          currentNode.left
        ) ||
        containsAdditiveFactor(
          currentNode.right
        ) ||
        isAlgebraFactorized(
          currentNode.left
        ) ||
        isAlgebraFactorized(
          currentNode.right
        )
      );


    case "power": {
      const base =
        unwrapParentheses(
          currentNode.base
        );

      const exponent =
        unwrapParentheses(
          currentNode.exponent
        );

      return (
        (
          base?.type === "add" ||
          base?.type === "subtract"
        ) &&
        exponent?.type === "number" &&
        exponent.value >= 2
      );
    }


    case "unaryPlus":
    case "unaryMinus":
      return isAlgebraFactorized(
        currentNode.operand
      );


    default:
      return false;
  }
}


function gcdIntegers(
  a,
  b
) {
  let value1 =
    Math.abs(
      Math.round(
        a
      )
    );

  let value2 =
    Math.abs(
      Math.round(
        b
      )
    );

  while (
    value2 !== 0
  ) {
    const remainder =
      value1 %
      value2;

    value1 =
      value2;

    value2 =
      remainder;
  }

  return value1;
}


function getPolynomialCommonFactor(
  polynomial
) {
  const terms =
    Array.from(
      polynomial.entries()
    );

  if (
    terms.length < 2
  ) {
    return null;
  }


  let coefficientGcd =
    null;

  let commonPowers =
    null;


  for (
    const [
      key,
      coefficient
    ] of terms
  ) {
    if (
      !Number.isInteger(
        coefficient
      )
    ) {
      return null;
    }


    if (
      coefficientGcd ===
      null
    ) {
      coefficientGcd =
        Math.abs(
          coefficient
        );
    } else {
      coefficientGcd =
        gcdIntegers(
          coefficientGcd,
          coefficient
        );
    }


    const powers =
      parseMonomialKey(
        key
      );


    if (
      commonPowers ===
      null
    ) {
      commonPowers = {
        ...powers
      };

      continue;
    }


    for (
      const variable of Object.keys(
        commonPowers
      )
    ) {
      commonPowers[
        variable
      ] =
        Math.min(
          commonPowers[
            variable
          ] ?? 0,
          powers[
            variable
          ] ?? 0
        );

      if (
        commonPowers[
          variable
        ] === 0
      ) {
        delete commonPowers[
          variable
        ];
      }
    }
  }


  return {
    coefficient:
      coefficientGcd ?? 1,

    powers:
      commonPowers ?? {}
  };
}


function hasNonTrivialCommonFactor(
  node
) {
  try {
    const polynomial =
      astToPolynomial(
        node
      );

    const commonFactor =
      getPolynomialCommonFactor(
        polynomial
      );

    if (
      !commonFactor
    ) {
      return false;
    }


    if (
      commonFactor.coefficient > 1
    ) {
      return true;
    }


    if (
      Object.keys(
        commonFactor.powers
      ).length > 0
    ) {
      return true;
    }


    return false;

  } catch (
    error
  ) {
    return false;
  }
}


function isPerfectSquareNumber(
  value,
  tolerance = 1e-9
) {
  if (
    value < 0
  ) {
    return false;
  }

  const squareRoot =
    Math.sqrt(
      value
    );

  return (
    Math.abs(
      squareRoot -
      Math.round(
        squareRoot
      )
    ) <= tolerance
  );
}


function isPerfectSquareMonomial(
  key,
  coefficient
) {
  if (
    coefficient <= 0 ||
    !isPerfectSquareNumber(
      coefficient
    )
  ) {
    return false;
  }


  const powers =
    parseMonomialKey(
      key
    );


  return Object.values(
    powers
  ).every(
    exponent =>
      exponent % 2 === 0
  );
}


function getSquareRootMonomial(
  key,
  coefficient
) {
  if (
    !isPerfectSquareMonomial(
      key,
      coefficient
    )
  ) {
    return null;
  }


  const powers =
    parseMonomialKey(
      key
    );

  const squareRootPowers = {};


  for (
    const [
      variable,
      exponent
    ] of Object.entries(
      powers
    )
  ) {
    squareRootPowers[
      variable
    ] =
      exponent / 2;
  }


  return {
    coefficient:
      Math.sqrt(
        coefficient
      ),

    powers:
      squareRootPowers
  };
}


function multiplyMonomialData(
  monomial1,
  monomial2
) {
  const powers = {
    ...monomial1.powers
  };


  for (
    const [
      variable,
      exponent
    ] of Object.entries(
      monomial2.powers
    )
  ) {
    powers[
      variable
    ] =
      (
        powers[
          variable
        ] ?? 0
      ) +
      exponent;
  }


  return {
    coefficient:
      monomial1.coefficient *
      monomial2.coefficient,

    key:
      createMonomialKey(
        powers
      )
  };
}


export function isPerfectSquareTrinomial(
  node,
  tolerance = 1e-9
) {
  try {
    const polynomial =
      cleanPolynomial(
        astToPolynomial(
          node
        )
      );


    if (
      polynomial.size !== 3
    ) {
      return false;
    }


    const terms =
      Array.from(
        polynomial.entries()
      );


    for (
      let firstIndex = 0;
      firstIndex < terms.length;
      firstIndex++
    ) {
      for (
        let secondIndex =
          firstIndex + 1;
        secondIndex < terms.length;
        secondIndex++
      ) {
        const [
          firstKey,
          firstCoefficient
        ] =
          terms[
            firstIndex
          ];

        const [
          secondKey,
          secondCoefficient
        ] =
          terms[
            secondIndex
          ];


        const firstSquareRoot =
          getSquareRootMonomial(
            firstKey,
            firstCoefficient
          );

        const secondSquareRoot =
          getSquareRootMonomial(
            secondKey,
            secondCoefficient
          );


        if (
          !firstSquareRoot ||
          !secondSquareRoot
        ) {
          continue;
        }


        const product =
          multiplyMonomialData(
            firstSquareRoot,
            secondSquareRoot
          );


        const expectedMiddleCoefficient =
          2 *
          product.coefficient;


        const remainingIndex =
          [0, 1, 2].find(
            index =>
              index !== firstIndex &&
              index !== secondIndex
          );


        const [
          middleKey,
          middleCoefficient
        ] =
          terms[
            remainingIndex
          ];


        if (
          middleKey !==
          product.key
        ) {
          continue;
        }


        if (
          Math.abs(
            Math.abs(
              middleCoefficient
            ) -
            expectedMiddleCoefficient
          ) <= tolerance
        ) {
          return true;
        }
      }
    }


    return false;

  } catch (
    error
  ) {
    return false;
  }
}


export function isDifferenceOfSquares(
  node
) {
  try {
    const polynomial =
      cleanPolynomial(
        astToPolynomial(
          node
        )
      );


    if (
      polynomial.size !== 2
    ) {
      return false;
    }


    const terms =
      Array.from(
        polynomial.entries()
      );


    const positiveTerms =
      terms.filter(
        ([, coefficient]) =>
          coefficient > 0
      );

    const negativeTerms =
      terms.filter(
        ([, coefficient]) =>
          coefficient < 0
      );


    if (
      positiveTerms.length !== 1 ||
      negativeTerms.length !== 1
    ) {
      return false;
    }


    const [
      positiveKey,
      positiveCoefficient
    ] =
      positiveTerms[0];

    const [
      negativeKey,
      negativeCoefficient
    ] =
      negativeTerms[0];


    return (
      isPerfectSquareMonomial(
        positiveKey,
        positiveCoefficient
      ) &&
      isPerfectSquareMonomial(
        negativeKey,
        Math.abs(
          negativeCoefficient
        )
      )
    );

  } catch (
    error
  ) {
    return false;
  }
}


function canPolynomialBeFactorizedFurther(
  node
) {
  if (
    hasNonTrivialCommonFactor(
      node
    )
  ) {
    return true;
  }


  if (
    isDifferenceOfSquares(
      node
    )
  ) {
    return true;
  }


  if (
    isPerfectSquareTrinomial(
      node
    )
  ) {
    return true;
  }


  return false;
}


export function isAlgebraFullyFactorized(
  node
) {
  if (
    !isAlgebraFactorized(
      node
    )
  ) {
    return false;
  }


  function checkFactors(
    currentNode
  ) {
    const unwrappedNode =
      unwrapParentheses(
        currentNode
      );


    if (
      unwrappedNode.type ===
        "add" ||
      unwrappedNode.type ===
        "subtract"
    ) {
      return !canPolynomialBeFactorizedFurther(
        unwrappedNode
      );
    }


    if (
      unwrappedNode.type ===
      "multiply"
    ) {
      return (
        checkFactors(
          unwrappedNode.left
        ) &&
        checkFactors(
          unwrappedNode.right
        )
      );
    }


    if (
      unwrappedNode.type ===
      "power"
    ) {
      return checkFactors(
        unwrappedNode.base
      );
    }


    if (
      unwrappedNode.type ===
        "unaryPlus" ||
      unwrappedNode.type ===
        "unaryMinus"
    ) {
      return checkFactors(
        unwrappedNode.operand
      );
    }


    return true;
  }


  return checkFactors(
    node
  );
}


function parseAlgebraTokens(
  tokens
) {
  let position = 0;


  function currentToken() {
    return (
      tokens[position] ??
      null
    );
  }


  function consumeToken() {
    const token =
      currentToken();

    position++;

    return token;
  }


  function parsePrimary() {
    const token =
      currentToken();

    if (!token) {
      throw new Error(
        "UNEXPECTED_END"
      );
    }

    // Nombre.
    if (
      token.type ===
      "number"
    ) {
      consumeToken();

      return {
        type:
          "number",

        value:
          Number(
            token.value
          )
      };
    }


    // Variable.
    if (
      token.type ===
      "variable"
    ) {
      consumeToken();

      return {
        type:
          "variable",

        name:
          token.value
      };
    }


    // Expression entre parenthèses.
    if (
      token.type ===
        "parenthesis" &&
      token.value ===
        "("
    ) {
      consumeToken();

      const expression =
        parseExpression();

      const closingParenthesis =
        currentToken();

      if (
        !closingParenthesis ||
        closingParenthesis.type !==
          "parenthesis" ||
        closingParenthesis.value !==
          ")"
      ) {
        throw new Error(
          "MISSING_CLOSING_PARENTHESIS"
        );
      }

      consumeToken();

      return {
        type:
          "parentheses",

        expression
      };
    }


    throw new Error(
      "EXPECTED_VALUE"
    );
  }


  function parsePower() {
    let left =
      parsePrimary();

    const token =
      currentToken();

    if (
      token &&
      token.type ===
        "operator" &&
      token.value ===
        "^"
    ) {
      consumeToken();

      const right =
        parsePower();

      left = {
        type:
          "power",

        base:
          left,

        exponent:
          right
      };
    }

    return left;
  }


  function parseUnary() {
    const token =
      currentToken();

    if (
      token &&
      token.type ===
        "operator" &&
      (
        token.value === "+" ||
        token.value === "-"
      )
    ) {
      const operator =
        token.value;

      consumeToken();

      return {
        type:
          operator === "+"
            ? "unaryPlus"
            : "unaryMinus",

        operand:
          parseUnary()
      };
    }

    return parsePower();
  }


  function parseProduct() {
    let left =
      parseUnary();

    while (true) {
      const token =
        currentToken();

      if (!token) {
        break;
      }


      // Multiplication ou division
      // explicite.
      if (
        token.type ===
          "operator" &&
        (
          token.value === "*" ||
          token.value === "/"
        )
      ) {
        const operator =
          token.value;

        consumeToken();

        const right =
          parseUnary();

        left = {
          type:
            operator === "*"
              ? "multiply"
              : "divide",

          left,
          right,

          implicit:
            false
        };

        continue;
      }


      // Multiplication implicite :
      //
      // 3x
      // 2(x+3)
      // x(x+1)
      // (x+1)(x-2)
      if (
        token.type ===
          "number" ||
        token.type ===
          "variable" ||
        (
          token.type ===
            "parenthesis" &&
          token.value ===
            "("
        )
      ) {
        const right =
          parseUnary();

        left = {
          type:
            "multiply",

          left,
          right,

          implicit:
            true
        };

        continue;
      }

      break;
    }

    return left;
  }


  function parseExpression() {
    let left =
      parseProduct();

    while (true) {
      const token =
        currentToken();

      if (
        !token ||
        token.type !==
          "operator" ||
        (
          token.value !== "+" &&
          token.value !== "-"
        )
      ) {
        break;
      }

      const operator =
        token.value;

      consumeToken();

      const right =
        parseProduct();

      left = {
        type:
          operator === "+"
            ? "add"
            : "subtract",

        left,
        right
      };
    }

    return left;
  }


  const ast =
    parseExpression();


  if (
    position !==
    tokens.length
  ) {
    throw new Error(
      "UNEXPECTED_TOKEN"
    );
  }


  return ast;
}


export function parseAlgebraExpression(
  input
) {
  const normalizedInput =
    normalizeAlgebraInput(
      input
    );

  if (
    normalizedInput === ""
  ) {
    throw new Error(
      "EMPTY_ALGEBRA_EXPRESSION"
    );
  }

  const tokens =
    tokenizeAlgebra(
      normalizedInput
    );

  return parseAlgebraTokens(
    tokens
  );
}


/**
 * Première version du validateur.
 *
 * Pour l'instant, elle expose seulement
 * la normalisation afin de pouvoir
 * tester les différentes saisies.
 */
export function validateAlgebra({
  userInput,
  validAnswers,
  form =
    "equivalent",
  tolerance =
    1e-9
}) {
  let userAst;


  try {
    userAst =
      parseAlgebraExpression(
        userInput
      );

  } catch (
    error
  ) {
    return {
      valid:
        false,

      errorCode:
        "INVALID_ALGEBRA_EXPRESSION"
    };
  }


  const referenceExpressions =
    Array.isArray(
      validAnswers
    )
      ? validAnswers
      : [
          validAnswers
        ];


  let equivalent =
    false;


  for (
    const referenceExpression
    of referenceExpressions
  ) {
    try {
      const referenceAst =
        parseAlgebraExpression(
          referenceExpression
        );


      if (
        areAlgebraExpressionsSymbolicallyEquivalent(
          userAst,
          referenceAst,
          {
            tolerance
          }
        )
      ) {
        equivalent =
          true;

        break;
      }

    } catch (
      error
    ) {
      continue;
    }
  }


  if (
    !equivalent
  ) {
    return {
      valid:
        false,

      errorCode:
        "WRONG_ALGEBRA_VALUE"
    };
  }


  switch (
    form
  ) {
    case "equivalent":
      break;


    case "developed":
      if (
        !isAlgebraDeveloped(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_DEVELOPED"
        };
      }

      break;


    case "reduced":
      if (
        !isAlgebraReduced(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_REDUCED"
        };
      }

      break;


    case "developedAndReduced":
      if (
        !isAlgebraDeveloped(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_DEVELOPED"
        };
      }


      if (
        !isAlgebraReduced(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_REDUCED"
        };
      }

      break;


    case "factorized":
      if (
        !isAlgebraFactorized(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_FACTORIZED"
        };
      }

      break;


    case "fullyFactorized":
      if (
        !isAlgebraFullyFactorized(
          userAst
        )
      ) {
        return {
          valid:
            false,

          errorCode:
            "NOT_FULLY_FACTORIZED"
        };
      }

      break;


    default:
      return {
        valid:
          false,

        errorCode:
          "UNKNOWN_ALGEBRA_FORM"
      };
  }


  return {
    valid:
      true,

    errorCode:
      null
  };
}