// core/validators/volumeUnitValidator.js

function normalizeVolumeUnit(
  value
) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/³/g, "3")
    .replace(/\^3/g, "3");
}

export function validateVolumeUnit({
  userInput,
  validAnswers
}) {
  const normalizedUserInput =
    normalizeVolumeUnit(
      userInput
    );

  const normalizedValidAnswers =
    validAnswers.map(
      normalizeVolumeUnit
    );

  // Détecte une saisie du type :
  // 25 cm³
  // 25cm³
  // 25 cm^3
  // 25cm3
  const numberAndUnitMatch =
    normalizedUserInput.match(
      /^[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)((?:km|hm|dam|dm|cm|mm|m)3)$/
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
      "WRONG_VOLUME_UNIT"
  };
}