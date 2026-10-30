// core/validators/repeatedProductValidator.js

export function validateRepeatedProduct({
  userInput,
  base,
  exponent
}) {

  const normalized =
    String(userInput)
      .trim()
      .replace(
        /\s+/g,
        ""
      )
      .replace(
        /×/g,
        "*"
      );


  const factors =
    normalized.split(
      "*"
    );


  if (
    factors.length !== exponent
  ) {
    return {
      valid: false,

      errorCode:
        "WRONG_FACTOR_COUNT"
    };
  }


  const expectedFactor =
    base < 0
      ? `(${base})`
      : String(base);


  const valid =
    factors.every(
      factor =>
        factor ===
        expectedFactor
    );


  return {
    valid,

    errorCode:
      valid
        ? null
        : "WRONG_REPEATED_PRODUCT"
  };
}