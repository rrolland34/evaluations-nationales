// core/validators/canonicalDecimalFractionValidator.js

import {
  normalizeAnswer
} from "../answerParser.js";

function greatestCommonDivisor(a, b) {
  let firstNumber =
    Math.abs(a);

  let secondNumber =
    Math.abs(b);

  while (secondNumber !== 0) {
    const remainder =
      firstNumber % secondNumber;

    firstNumber =
      secondNumber;

    secondNumber =
      remainder;
  }

  return firstNumber;
}

/**
 * Vérifie que la réponse est une fraction décimale
 * écrite sous sa forme canonique.
 *
 * Exemples acceptés :
 * 1/10
 * 1/100
 * 7/1000
 *
 * Exemples refusés :
 * 10/100
 * 2/20
 * 0,1
 * 1/2
 * 1/1
 */
export function validateCanonicalDecimalFractionFormat(
  userInput
) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  const match =
    normalizedAnswer.match(
      /^(-?\d+)\/(\d+)$/
    );

  if (!match) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_CANONICAL_DECIMAL_FRACTION"
    };
  }

  const numerator =
    Number(match[1]);

  const denominator =
    Number(match[2]);

  const isPowerOfTen =
    denominator >= 10 &&
    Number.isInteger(
      Math.log10(denominator)
    );

  const isIrreducible =
    greatestCommonDivisor(
      numerator,
      denominator
    ) === 1;

  const isValid =
    isPowerOfTen &&
    isIrreducible;

  return {
    valid: isValid,

    errorCode:
      isValid
        ? null
        : "EXPECTED_CANONICAL_DECIMAL_FRACTION"
  };
}