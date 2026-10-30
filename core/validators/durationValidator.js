// core/validators/durationValidator.js

/**
 * Normalise une saisie de durée.
 *
 * Exemples :
 * 2 H 04 MIN → 2h04min
 * 2 h 4 mn   → 2h4min
 */
function normalizeDurationInput(
  value
) {
  return String(value)
    .trim()
    .toLowerCase()

    // Normalise "mn" vers "min".
    .replace(/mn/g, "min")

    // Supprime tous les espaces.
    .replace(/\s+/g, "");
}

/**
 * Analyse une durée écrite
 * en heures et minutes.
 *
 * Exemples acceptés :
 * 2 h 4 min
 * 2h04min
 * 2 H 4 MIN
 * 2h4mn
 */
function parseDuration(
  userInput
) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_DURATION_STRUCTURE"
    };
  }

  const normalizedInput =
    normalizeDurationInput(
      userInput
    );

  // -------------------------
  // Heures + minutes
  // Exemple : 2h04min
  // -------------------------

  const hoursMinutesMatch =
    normalizedInput.match(
      /^(\d+)h(\d{1,2})min$/
    );

  if (hoursMinutesMatch) {
    const hours =
      Number(
        hoursMinutesMatch[1]
      );

    const minutes =
      Number(
        hoursMinutesMatch[2]
      );

    if (
      minutes < 0 ||
      minutes >= 60
    ) {
      return {
        valid: false,
        errorCode:
          "INVALID_DURATION_MINUTES"
      };
    }

    return {
      valid: true,

      totalMinutes:
        hours * 60 +
        minutes,

      errorCode: null
    };
  }


  // -------------------------
  // Minutes seules
  // Exemple : 30min
  // -------------------------

  const minutesMatch =
    normalizedInput.match(
      /^(\d+(?:[.,]\d+)?)min$/
    );

  if (minutesMatch) {
    const minutes =
      Number(
        minutesMatch[1]
          .replace(",", ".")
      );

    return {
      valid: true,
      totalMinutes: minutes,
      errorCode: null
    };
  }


  // -------------------------
  // Secondes seules
  // Exemple : 360s
  // -------------------------

  const secondsMatch =
    normalizedInput.match(
      /^(\d+(?:[.,]\d+)?)s$/
    );

  if (secondsMatch) {
    const seconds =
      Number(
        secondsMatch[1]
          .replace(",", ".")
      );

    return {
      valid: true,

      totalMinutes:
        seconds / 60,

      errorCode: null
    };
  }


  // -------------------------
  // Fraction d'heure
  // Exemple : 3/4h
  // -------------------------

  const fractionalHoursMatch =
    normalizedInput.match(
      /^(\d+)\/(\d+)h$/
    );

  if (fractionalHoursMatch) {
    const numerator =
      Number(
        fractionalHoursMatch[1]
      );

    const denominator =
      Number(
        fractionalHoursMatch[2]
      );

    if (denominator === 0) {
      return {
        valid: false,
        errorCode:
          "INVALID_DURATION_STRUCTURE"
      };
    }

    return {
      valid: true,

      totalMinutes:
        numerator /
        denominator *
        60,

      errorCode: null
    };
  }


  // -------------------------
  // Heures seules
  // Exemple : 0,5h
  // -------------------------

  const hoursMatch =
    normalizedInput.match(
      /^(\d+(?:[.,]\d+)?)h$/
    );

  if (hoursMatch) {
    const hours =
      Number(
        hoursMatch[1]
          .replace(",", ".")
      );

    return {
      valid: true,

      totalMinutes:
        hours * 60,

      errorCode: null
    };
  }


  return {
    valid: false,
    errorCode:
      "INVALID_DURATION_STRUCTURE"
  };
}

/**
 * Vérifie une durée écrite
 * en heures et minutes.
 */
export function validateDurationAnswer({
  userInput,
  validAnswers,
  requiredFormat = null
}) {
  if (requiredFormat === 'hoursMinutes' &&
      !/^\d+h\d{1,2}min$/.test(normalizeDurationInput(userInput))) {
    return { valid: false, errorCode: 'INVALID_DURATION_STRUCTURE' };
  }
  const parsedUserAnswer =
    parseDuration(
      userInput
    );

  if (!parsedUserAnswer.valid) {
    return {
      valid: false,
      errorCode:
        parsedUserAnswer.errorCode
    };
  }

  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedValidAnswer =
      parseDuration(
        validAnswer
      );

    if (!parsedValidAnswer.valid) {
      continue;
    }

    if (
      parsedUserAnswer.totalMinutes ===
      parsedValidAnswer.totalMinutes
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
      "INCORRECT_DURATION_VALUE"
  };
}
