// core/validators/valueWithValidator.js

export function validateValueWithUnit({
  userInput,
  validAnswers,
  requiredUnit
}) {
  const input =
    String(userInput).trim();

  const escapedUnit =
    requiredUnit.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const match =
    input.match(
      new RegExp(
        `^(.+?)\\s*(${escapedUnit})$`
      )
    );

  if (!match) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_REQUIRED_UNIT"
    };
  }

  const valueInput =
    match[1].trim();

  const unit =
    match[2];

  if (unit !== requiredUnit) {
    return {
      valid: false,
      errorCode:
        "WRONG_REQUIRED_UNIT"
    };
  }

  return {
    valid: true,
    valueInput,
    unit
  };
}