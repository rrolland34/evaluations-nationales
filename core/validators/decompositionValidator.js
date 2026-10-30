// core/validators/decompositionValidator.js

import { normalizeAnswer }
  from "../answerParser.js";

/**
 * Indique si une chaîne représente un entier positif ou nul.
 */
function isIntegerTerm(term) {
  return /^\d+$/.test(term);
}

/**
 * Analyse une fraction composée de deux entiers.
 */
function parseFractionTerm(term) {
  const match = term.match(
    /^(\d+)\/(\d+)$/
  );

  if (!match) {
    return null;
  }

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);

  if (
    !Number.isInteger(numerator) ||
    !Number.isInteger(denominator) ||
    denominator === 0
  ) {
    return null;
  }

  return {
    numerator,
    denominator
  };
}

/**
 * Vérifie qu'un entier est une puissance de 10 :
 * 10, 100, 1 000...
 */
function isPowerOfTen(value) {
  return (
    value >= 10 &&
    Number.isInteger(Math.log10(value))
  );
}

/**
 * Question 5 :
 * un entier + une fraction décimale inférieure à 1.
 *
 * Exemples acceptés :
 * 95+27/100
 * 27/100+95
 */
export function validateIntegerPlusDecimalFraction(
  userInput
) {
  const normalized =
    normalizeAnswer(userInput);

  const terms = normalized.split("+");

  if (terms.length !== 2) {
    return {
      valid: false,
      errorCode: "EXPECTED_INTEGER_PLUS_FRACTION"
    };
  }

  const integerTerms =
    terms.filter(isIntegerTerm);

  const fractionTerms =
    terms
      .map(parseFractionTerm)
      .filter(fraction => fraction !== null);

  if (
    integerTerms.length !== 1 ||
    fractionTerms.length !== 1
  ) {
    return {
      valid: false,
      errorCode: "EXPECTED_INTEGER_PLUS_FRACTION"
    };
  }

  const fraction = fractionTerms[0];

  if (!isPowerOfTen(fraction.denominator)) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECIMAL_FRACTION"
    };
  }

  if (
    fraction.numerator >=
    fraction.denominator
  ) {
    return {
      valid: false,
      errorCode: "FRACTION_MUST_BE_LESS_THAN_ONE"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}

/**
 * Question 6 :
 * un entier + une ou plusieurs fractions décimales
 * ayant chacune un numérateur inférieur à 10.
 *
 * Exemple accepté :
 * 95+2/10+7/100
 */
export function validateExpandedDecimalFraction(
  userInput
) {
  const normalized =
    normalizeAnswer(userInput);

  const terms = normalized.split("+");

  if (terms.length < 2) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECOMPOSITION"
    };
  }

  let integerCount = 0;
  let fractionCount = 0;

  for (const term of terms) {
    if (isIntegerTerm(term)) {
      integerCount++;
      continue;
    }

    const fraction =
      parseFractionTerm(term);

    if (!fraction) {
      return {
        valid: false,
        errorCode: "EXPECTED_FRACTION_TERMS"
      };
    }

    if (!isPowerOfTen(fraction.denominator)) {
      return {
        valid: false,
        errorCode: "EXPECTED_DECIMAL_FRACTION"
      };
    }

    if (fraction.numerator >= 10) {
      return {
        valid: false,
        errorCode: "NUMERATOR_TOO_LARGE"
      };
    }

    fractionCount++;
  }

  if (
    integerCount !== 1 ||
    fractionCount === 0
  ) {
    return {
      valid: false,
      errorCode: "EXPECTED_DECOMPOSITION"
    };
  }

  return {
    valid: true,
    errorCode: null
  };
}