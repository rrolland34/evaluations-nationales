// core/validators/scientificNotationValidator.js

export function validateScientificNotation({
  userInput,
  expectedValue
}) {

  const normalized =
    String(userInput)
      .trim()
      .replace(
        /\s+/g,
        ""
      )

      // Délimiteurs MathJax.
      .replace(
        /\\\(|\\\)|\\\[|\\\]/g,
        ""
      )

      // Virgule décimale LaTeX.
      .replace(
        /\{,\}/g,
        "."
      )

      // Virgule décimale classique.
      .replace(
        ",",
        "."
      )

      // Multiplication LaTeX.
      .replace(
        /\\times/g,
        "*"
      )

      // Symbole multiplication.
      .replace(
        /×/g,
        "*"
      )

      // Exposant LaTeX.
      .replace(
        /\^\{(-?\d+)\}/g,
        "^$1"
      )

      .replace(
        /\^\((-?\d+)\)/g,
        "^$1"
      );


  const match =
    normalized.match(
      /^(-?\d+(?:\.\d+)?)\*10\^(-?\d+)$/
    );


  if (!match) {
    return {
      valid: false,

      errorCode:
        "INVALID_SCIENTIFIC_FORMAT"
    };
  }


  const coefficient =
    Number(
      match[1]
    );

  const exponent =
    Number(
      match[2]
    );


  if (
    !Number.isFinite(
      coefficient
    ) ||
    !Number.isInteger(
      exponent
    )
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_SCIENTIFIC_VALUE"
    };
  }


  if (
    Math.abs(
      coefficient
    ) < 1 ||
    Math.abs(
      coefficient
    ) >= 10
  ) {
    return {
      valid: false,

      errorCode:
        "NOT_SCIENTIFIC_NOTATION"
    };
  }


  const value =
    coefficient *
    10 ** exponent;


  const tolerance =
    1e-12 *
    Math.max(
      1,
      Math.abs(
        expectedValue
      )
    );


  const valid =
    Math.abs(
      value -
      expectedValue
    ) <= tolerance;


  return {
    valid,

    errorCode:
      valid
        ? null
        : "WRONG_SCIENTIFIC_VALUE"
  };
}