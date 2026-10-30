// core/validators/simplifiedValueValidator.js

import {
  normalizeAnswer
} from "../answerParser.js";

function greatestCommonDivisor(a, b) {
  let firstNumber = Math.abs(a);
  let secondNumber = Math.abs(b);

  while (secondNumber !== 0) {
    const remainder =
      firstNumber % secondNumber;

    firstNumber = secondNumber;
    secondNumber = remainder;
  }

  return firstNumber;
}

/**
 * Accepte :
 * - un nombre entier ;
 * - une fraction irréductible ;
 * - un nombre décimal sans zéro final inutile.
 */
export function validateSimplifiedValueFormat(
  userInput
) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  // Nombre entier
  if (/^-?\d+$/.test(normalizedAnswer)) {
    return {
      valid: true,
      errorCode: null
    };
  }

  // Fraction
  const fractionMatch =
    normalizedAnswer.match(
      /^(-?\d+)\/(\d+)$/
    );

  if (fractionMatch) {
    const numerator =
      Number(fractionMatch[1]);

    const denominator =
      Number(fractionMatch[2]);

    const isValidFraction =
      denominator > 1 &&
      greatestCommonDivisor(
        numerator,
        denominator
      ) === 1;

    return {
      valid: isValidFraction,
      errorCode:
        isValidFraction
          ? null
          : "EXPECTED_SIMPLIFIED_VALUE"
    };
  }

  // Nombre décimal
  const decimalMatch =
    normalizedAnswer.match(
      /^-?\d+\.(\d+)$/
    );

  if (decimalMatch) {
    const decimalPart =
      decimalMatch[1];

    const hasNoUselessTrailingZero =
      !decimalPart.endsWith("0");

    return {
      valid:
        hasNoUselessTrailingZero,

      errorCode:
        hasNoUselessTrailingZero
          ? null
          : "EXPECTED_SIMPLIFIED_VALUE"
    };
  }

  return {
    valid: false,
    errorCode:
      "EXPECTED_SIMPLIFIED_VALUE"
  };
}