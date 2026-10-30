// core/validators/piMultipleValidator.js

import {
  parseAnswer
} from "../answerParser.js";

/**
 * Normalise les différentes écritures
 * du symbole pi.
 */
function normalizePi(value) {
  return String(value)
    .trim()
    .replace(/π/g, "pi")
    .replace(/pi/gi, "pi")
    .replace(/\s+/g, "");
}

/**
 * Analyse une expression représentant
 * un multiple numérique de pi.
 *
 * Exemples acceptés :
 * pi
 * 12,5pi
 * 12,5*pi
 * pi*12,5
 * PI*12.5
 */
export function validatePiMultiple(
  userInput
) {
  const normalizedInput =
    normalizePi(userInput);

  /*
   * Cas particulier :
   * pi seul correspond à 1 × pi.
   */
  if (normalizedInput === "pi") {
    return {
      valid: true,
      coefficient: 1,
      errorCode: null
    };
  }

  /*
   * Plusieurs symboles pi.
   *
   * Exemple :
   * 12,5*pi*pi
   */
  const piOccurrences =
    normalizedInput.match(/pi/g) ?? [];

  if (piOccurrences.length > 1) {
    return {
      valid: false,
      errorCode:
        "MULTIPLE_PI_SYMBOLS"
    };
  }

  /*
   * Cas fréquent :
   *
   * pi12,5
   *
   * Le coefficient est placé après pi
   * sans signe de multiplication.
   */
  if (
    /^pi[-+]?\d/.test(
      normalizedInput
    )
  ) {
    return {
      valid: false,
      errorCode:
        "MISSING_MULTIPLICATION_AFTER_PI"
    };
  }

  let coefficientText = null;

  /*
   * Coefficient placé avant pi :
   *
   * 12,5pi
   * 12,5*pi
   */
  const coefficientBeforePi =
    normalizedInput.match(
      /^(.+?)\*?pi$/
    );

  if (coefficientBeforePi) {
    coefficientText =
      coefficientBeforePi[1];
  }

  /*
   * Coefficient placé après pi :
   *
   * pi*12,5
   */
  if (coefficientText === null) {
    const coefficientAfterPi =
      normalizedInput.match(
        /^pi\*(.+)$/
      );

    if (coefficientAfterPi) {
      coefficientText =
        coefficientAfterPi[1];
    }
  }

  if (coefficientText === null) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_PI_MULTIPLE"
    };
  }

  const parsedCoefficient =
    parseAnswer(
      coefficientText
    );

  if (
    !parsedCoefficient.valid ||
    parsedCoefficient.unit !== ""
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_PI_COEFFICIENT"
    };
  }

  return {
    valid: true,
    coefficient:
      parsedCoefficient.value,
    errorCode: null
  };
}