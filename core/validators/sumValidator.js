// core/validators/sumValidator.js

import {
  normalizeAnswer
} from "../answerParser.js";

/**
 * Vérifie qu'une réponse est une somme
 * constituée exactement des termes attendus.
 *
 * L'ordre des termes n'a pas d'importance.
 *
 * Exemple :
 * terms: [4, 8, 3, 6]
 *
 * Acceptés :
 * 4+8+3+6
 * 6+3+8+4
 * 8 + 4 + 6 + 3
 *
 * Refusés :
 * 21
 * 4+8+3
 * 4+8+3+5
 * 4*8*3*6
 */
export function validateSum(
  userInput,
  terms
) {
  const normalized =
    normalizeAnswer(
      userInput
    );

  if (
    !Array.isArray(terms) ||
    terms.length === 0
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_SUM_TERMS"
    };
  }

  const userTerms =
    normalized.split("+");

  if (
    userTerms.length !==
    terms.length
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_SUM"
    };
  }

  if (
    userTerms.some(
      term =>
        !/^[+-]?\d+(?:\.\d+)?$/.test(
          term
        )
    )
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_SUM"
    };
  }

  const normalizedUserTerms =
    userTerms
      .map(Number)
      .sort(
        (a, b) =>
          a - b
      );

  const normalizedExpectedTerms =
    terms
      .map(Number)
      .sort(
        (a, b) =>
          a - b
      );

  const valid =
    normalizedUserTerms.every(
      (
        term,
        index
      ) =>
        term ===
        normalizedExpectedTerms[
          index
        ]
    );

  return {
    valid,
    errorCode:
      valid
        ? null
        : "INCORRECT_SUM"
  };
}