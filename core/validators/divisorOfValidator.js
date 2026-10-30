// core/validators/divisorOfValidator.js

import {
  parseAnswer
} from "../answerParser.js";

/**
 * Vérifie que la réponse est un diviseur entier
 * non nul du nombre de référence.
 */
export function validateDivisorOf(
  userInput,
  referenceNumber
) {
  const parsedAnswer =
    parseAnswer(userInput);

  if (
    !parsedAnswer.valid ||
    parsedAnswer.unit !== ""
  ) {
    return {
      valid: false,
      errorCode: "EXPECTED_DIVISOR"
    };
  }

  const answerValue =
    parsedAnswer.value;

  if (
    !Number.isInteger(answerValue) ||
    !Number.isInteger(referenceNumber) ||
    answerValue === 0
  ) {
    return {
      valid: false,
      errorCode: "EXPECTED_DIVISOR"
    };
  }

  const isDivisor =
    referenceNumber % answerValue === 0;

  return {
    valid: isDivisor,

    errorCode:
      isDivisor
        ? null
        : "EXPECTED_DIVISOR"
  };
}