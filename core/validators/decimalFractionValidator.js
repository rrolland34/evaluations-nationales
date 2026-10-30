// core/validators/decimalFractionValidator.js

import { normalizeAnswer }
  from "../answerParser.js";

/**
 * Vérifie que la réponse est une unique fraction décimale.
 */
export function validateDecimalFractionFormat(userInput) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  // Une décomposition n'est pas une fraction unique.
  if (normalizedAnswer.includes("+")) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL_FRACTION"
    };
  }

  // La réponse doit être uniquement de la forme numérateur/dénominateur.
  const match = normalizedAnswer.match(
    /^(\d+)\/(\d+)$/
  );

  if (!match) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL_FRACTION"
    };
  }

  const denominator = Number(match[2]);

  // Le dénominateur doit être 10, 100, 1 000, etc.
  const isPowerOfTen =
    denominator >= 10 &&
    Number.isInteger(Math.log10(denominator));

  if (!isPowerOfTen) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL_FRACTION"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}