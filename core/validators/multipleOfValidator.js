// core/validators/multipleOfValidator.js

import {
  parseAnswer
} from "../answerParser.js";

/**
 * Vérifie que la réponse est un multiple entier
 * du nombre de référence.
 */
export function validateMultipleOf(
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
      errorCode: "EXPECTED_MULTIPLE"
    };
  }

  const answerValue =
    parsedAnswer.value;

  if (
    !Number.isInteger(answerValue) ||
    !Number.isInteger(referenceNumber) ||
    referenceNumber === 0
  ) {
    return {
      valid: false,
      errorCode: "EXPECTED_MULTIPLE"
    };
  }

  const isMultiple =
    answerValue % referenceNumber === 0;

  return {
    valid: isMultiple,

    errorCode:
      isMultiple
        ? null
        : "EXPECTED_MULTIPLE"
  };
}