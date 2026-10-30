// core/validators/powerValidator.js

export function validatePower({
  userInput,
  expectedValue,
  expectedBase = null,
  allowOneForZeroExponent = true
}) {

  const normalized =
    String(userInput)
      .trim()
      .replace(
        /\s+/g,
        ""
      )
      .replace(
        ",",
        "."
      )
      .replace(
        /²/g,
        "^2"
      )
      .replace(
        /\^\{(-?\d+)\}/g,
        "^$1"
      )
      .replace(
        /\^\((-?\d+)\)/g,
        "^$1"
      );


  if (
    allowOneForZeroExponent &&
    normalized === "1" &&
    expectedValue === 1
  ) {
    return {
      valid: true,
      errorCode: null
    };
  }


  const match =
    normalized.match(
      /^(?:(\d+(?:\.\d+)?)|\((-?\d+(?:\.\d+)?)\))\^(-?\d+)$/
    );


  if (!match) {
    return {
      valid: false,

      errorCode:
        "INVALID_POWER_FORMAT"
    };
  }


  const base =
    Number(
      match[1] ??
      match[2]
    );

  const exponent =
    Number(
      match[3]
    );

  if (expectedBase !== null && base !== expectedBase) {
    return { valid: false, errorCode: "INVALID_POWER_FORMAT" };
  }


  if (
    !Number.isFinite(base) ||
    !Number.isInteger(exponent)
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_POWER_VALUE"
    };
  }


  if (
    base === 0 &&
    exponent <= 0
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_POWER_VALUE"
    };
  }


  const value =
    base ** exponent;


  if (
    !Number.isFinite(value)
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_POWER_VALUE"
    };
  }


  const tolerance =
    1e-12;


  const valid =
    Math.abs(
      value -
      expectedValue
    ) <=
    tolerance *
    Math.max(
      1,
      Math.abs(expectedValue)
    );


  return {
    valid,

    errorCode:
      valid
        ? null
        : "WRONG_POWER"
  };
}
