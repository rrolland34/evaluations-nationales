// core/validators/integerValidator.js

import {
  normalizeAnswer
} from "../answerParser.js";

/**
 * Vérifie que la réponse est écrite
 * sous la forme d’un nombre entier.
 */
export function validateIntegerFormat(
  userInput
) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  const isInteger =
    /^-?\d+$/.test(
      normalizedAnswer
    );

  if (!isInteger) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_INTEGER"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}