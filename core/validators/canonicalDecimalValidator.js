// core/validators/canonicalDecimalValidator.js

import {
  normalizeAnswer
} from "../answerParser.js";

/**
 * Vérifie que la réponse est une écriture décimale
 * sans zéro inutile à droite.
 *
 * Exemples acceptés :
 * 1
 * 0,5
 * 0.25
 * 12,305
 *
 * Exemples refusés :
 * 1,0
 * 0,50
 * 0.010
 * 12,3050
 * 1/2
 */
export function validateCanonicalDecimalFormat(
  userInput
) {
  const normalizedAnswer =
    normalizeAnswer(userInput);

  // Un entier constitue aussi une écriture décimale.
  if (/^-?\d+$/.test(normalizedAnswer)) {
    return {
      valid: true,
      errorCode: null
    };
  }

  const decimalMatch =
    normalizedAnswer.match(
      /^-?\d+\.(\d+)$/
    );

  if (!decimalMatch) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_CANONICAL_DECIMAL"
    };
  }

  const decimalPart =
    decimalMatch[1];

  // Le dernier chiffre après la virgule
  // ne doit pas être un zéro inutile.
  if (decimalPart.endsWith("0")) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_CANONICAL_DECIMAL"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}