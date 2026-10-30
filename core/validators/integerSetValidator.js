// Ensemble d'entiers distincts : l'ordre est libre, les répétitions sont refusées.
export function validateIntegerSet({ userInput, expectedValues }) {
  if (!Array.isArray(expectedValues) || expectedValues.length === 0 ||
      !expectedValues.every(Number.isSafeInteger) || new Set(expectedValues).size !== expectedValues.length) {
    return { valid: false, errorCode: 'INVALID_INTEGER_SET_CONFIGURATION' };
  }
  const input = typeof userInput === 'string' ? userInput.trim() : '';
  // La virgule est ici un séparateur d'entiers, jamais une virgule décimale.
  if (!/^[+-]?\d+(?:(?:\s*[,;]\s*|\s+)[+-]?\d+)*$/.test(input)) {
    return { valid: false, errorCode: 'INVALID_INTEGER_SET' };
  }
  const values = input.split(/[\s,;]+/).map(Number);
  const valid = values.every(Number.isSafeInteger) && new Set(values).size === values.length &&
    values.length === expectedValues.length && values.every(value => expectedValues.includes(value));
  return { valid, errorCode: valid ? null : 'WRONG_INTEGER_SET' };
}
