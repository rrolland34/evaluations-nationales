// core/validators/areaUnitValidator.js

function normalizeAreaUnit(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/²/g, "2")
    .replace(/\^2/g, "2");
}

export function validateAreaUnit({
  userInput,
  validAnswers
}) {
  const normalizedUserInput =
    normalizeAreaUnit(
      userInput
    );

  const normalizedValidAnswers =
    validAnswers.map(
      normalizeAreaUnit
    );

  // Détecte une saisie du type :
  // 25 cm²
  // 25cm²
  // 25 cm^2
  // 25cm2
  const numberAndUnitMatch =
    normalizedUserInput.match(
      /^[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)((?:km|hm|dam|dm|cm|mm|m)2)$/
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
      "WRONG_AREA_UNIT"
  };
}