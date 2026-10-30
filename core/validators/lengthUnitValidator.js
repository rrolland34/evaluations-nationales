// core/validators/lengthUnitValidator.js

function normalizeLengthUnit(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function validateLengthUnit({
  userInput,
  validAnswers
}) {
  const normalizedUserInput =
    normalizeLengthUnit(
      userInput
    );

  const normalizedValidAnswers =
    validAnswers.map(
      normalizeLengthUnit
    );

  // Détecte une saisie du type :
  // 25 cm
  // 25cm
  const numberAndUnitMatch =
    normalizedUserInput.match(
      /^[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)([a-z]+)$/
    );

  if (numberAndUnitMatch) {
    const suppliedUnit =
      numberAndUnitMatch[1];

    if (
      normalizedValidAnswers.includes(
        suppliedUnit
      )
    ) {
      return {
        valid: false,
        errorCode:
          "EXPECTED_UNIT_ONLY"
      };
    }
  }

  if (
    normalizedValidAnswers.includes(
      normalizedUserInput
    )
  ) {
    return {
      valid: true,
      errorCode: null
    };
  }

  return {
    valid: false,
    errorCode:
      "WRONG_LENGTH_UNIT"
  };
}