// core/validators/decimalValidator.js

import {
  normalizeAnswer,
  parseAnswer
} from "../answerParser.js";

/**
 * Vérifie que la réponse est une écriture décimale valide.
 */
export function validateDecimalFormat(userInput) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  const parsedAnswer =
    parseAnswer(userInput);

  if (!parsedAnswer.valid) {
    return {
      valid: false,
      errorCode: "INVALID_ANSWER"
    };
  }

  if (normalizedAnswer.includes("/")) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL"
    };
  }

  if (normalizedAnswer.includes("+")) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}