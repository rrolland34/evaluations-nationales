// core/validators/speedValidator.js

import {
  parseAnswer
} from "../answerParser.js";

const SPEED_UNIT_FACTORS = {
  "m/s": 1,
  "km/h": 1 / 3.6
};

/**
 * Normalise les écritures des unités
 * de vitesse.
 *
 * Exemples :
 * KM/H   → km/h
 * km / h → km/h
 * M/S    → m/s
 */
function normalizeSpeedUnit(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/**
 * Analyse une réponse constituée
 * d’un nombre suivi d’une unité
 * de vitesse.
 *
 * Exemples acceptés :
 * 72 km/h
 * 72km/h
 * 20 m / s
 * 20M/S
 */
function parseSpeedAnswer(userInput) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_SPEED_STRUCTURE"
    };
  }

  const trimmedInput =
    String(userInput).trim();

  const match =
    trimmedInput.match(
      /^(.+?)\s*((?:km\s*\/\s*h)|(?:m\s*\/\s*s))$/i
    );

  if (!match) {
    return {
      valid: false,
      errorCode:
        "INVALID_SPEED_STRUCTURE"
    };
  }

  const numericPart =
    match[1].trim();

  const unit =
    normalizeSpeedUnit(
      match[2]
    );

  const parsedNumber =
    parseAnswer(
      numericPart
    );

  if (
    !parsedNumber.valid ||
    parsedNumber.unit !== ""
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_SPEED_NUMBER"
    };
  }

  if (
    !Object.hasOwn(
      SPEED_UNIT_FACTORS,
      unit
    )
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_SPEED_UNIT"
    };
  }

  return {
    valid: true,
    value:
      parsedNumber.value,
    unit,
    errorCode: null
  };
}

/**
 * Vérifie une vitesse.
 *
 * Les vitesses sont converties
 * en m/s avant comparaison.
 */
export function validateSpeedAnswer({
  userInput,
  validAnswers,
  requiredUnit = null,
  tolerance = 1e-9
}) {
  const parsedUserAnswer =
    parseSpeedAnswer(
      userInput
    );

  if (!parsedUserAnswer.valid) {
    return {
      valid: false,
      errorCode:
        parsedUserAnswer.errorCode
    };
  }

  const normalizedRequiredUnit =
    requiredUnit
      ? normalizeSpeedUnit(
          requiredUnit
        )
      : null;

  if (
    normalizedRequiredUnit &&
    parsedUserAnswer.unit !==
      normalizedRequiredUnit
  ) {
    return {
      valid: false,
      errorCode:
        "WRONG_SPEED_UNIT"
    };
  }

  const userValueInMetersPerSecond =
    parsedUserAnswer.value *
    SPEED_UNIT_FACTORS[
      parsedUserAnswer.unit
    ];

  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedValidAnswer =
      parseSpeedAnswer(
        validAnswer
      );

    if (!parsedValidAnswer.valid) {
      continue;
    }

    const validValueInMetersPerSecond =
      parsedValidAnswer.value *
      SPEED_UNIT_FACTORS[
        parsedValidAnswer.unit
      ];

    if (
      Math.abs(
        userValueInMetersPerSecond -
        validValueInMetersPerSecond
      ) < tolerance
    ) {
      return {
        valid: true,
        errorCode: null
      };
    }
  }

  return {
    valid: false,
    errorCode:
      "INCORRECT_SPEED_VALUE"
  };
}