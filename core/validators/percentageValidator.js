// core/validators/percentageValidator.js

import {
  parseAnswer
} from "../answerParser.js";

/**
 * Vérifie qu'une réponse :
 * - est écrite sous forme de pourcentage ;
 * - représente la valeur attendue.
 *
 * Exemple :
 * valeur attendue : 0.2
 *
 * "20%"  -> valide
 * "0,2"  -> invalide
 * "1/5"  -> invalide
 */
export function validatePercentage({
  userInput,
  expectedValue,
  tolerance = 1e-9
}) {
  const parsedUserAnswer =
    parseAnswer(
      userInput
    );

  if (!parsedUserAnswer.valid) {
    return {
      valid: false,
      errorCode:
        "INVALID_PERCENTAGE"
    };
  }

  if (
    parsedUserAnswer.unit !==
    "%"
  ) {
    return {
      valid: false,
      errorCode:
        "NOT_PERCENTAGE"
    };
  }

  if (
    Math.abs(
      parsedUserAnswer.value -
      expectedValue
    ) >
    tolerance
  ) {
    return {
      valid: false,
      errorCode:
        "WRONG_PERCENTAGE_VALUE"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}