// core/validators/symbolicExactValidator.js

function normalizeSymbolicExpression(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function validateSymbolicExact({
  userInput,
  validAnswers
}) {
  const normalizedInput =
    normalizeSymbolicExpression(
      userInput
    );

  const normalizedValidAnswers =
    validAnswers.map(
      answer =>
        normalizeSymbolicExpression(
          answer
        )
    );

  const valid =
    normalizedValidAnswers.includes(
      normalizedInput
    );

  return {
    valid,

    errorCode:
      valid
        ? null
        : "WRONG_SYMBOLIC_EXPRESSION"
  };
}