// core/validators/coordinatesValidator.js

import {
  validateIntegerFormat
} from "./integerValidator.js";

import {
  validateCanonicalDecimalFormat
} from "./canonicalDecimalValidator.js";


export function validateCoordinates({
  userInput,
  validAnswers,
  valueRule = null
}) {
  function parseCoordinates(
    value
  ) {
    const normalized =
      String(value)
        .trim()
        .replace(
          /\s+/g,
          ""
        )
        .toUpperCase();

    const match =
      normalized.match(
        /^([A-Z])?\(([^;]+);([^;]+)\)$/
      );

    if (!match) {
      return null;
    }

    return {
      name:
        match[1] ?? null,

      x:
        match[2],

      y:
        match[3]
    };
  }


  function validateCoordinateValue(
    value
  ) {
    if (!valueRule) {
      return true;
    }

    if (
      valueRule.type ===
      "integer"
    ) {
      return validateIntegerFormat(
        value
      ).valid;
    }

    if (
      valueRule.type ===
      "canonicalDecimal"
    ) {
      return (
        validateCanonicalDecimalFormat(
          value
        ).valid
      );
    }

    return true;
  }


  function numericValue(
    value
  ) {
    const normalized =
      String(value)
        .replace(
          ",",
          "."
        );

    const number =
      Number(normalized);

    return Number.isFinite(number)
      ? number
      : null;
  }


  const parsedInput =
    parseCoordinates(
      userInput
    );

  if (!parsedInput) {
    return {
      valid: false,

      errorCode:
        "INVALID_COORDINATES_STRUCTURE"
    };
  }


  if (
    !validateCoordinateValue(
      parsedInput.x
    ) ||
    !validateCoordinateValue(
      parsedInput.y
    )
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_COORDINATE_FORMAT"
    };
  }


  const inputX =
    numericValue(
      parsedInput.x
    );

  const inputY =
    numericValue(
      parsedInput.y
    );

  if (
    inputX === null ||
    inputY === null
  ) {
    return {
      valid: false,

      errorCode:
        "INVALID_COORDINATE_VALUE"
    };
  }


  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedAnswer =
      parseCoordinates(
        validAnswer
      );

    if (!parsedAnswer) {
      continue;
    }


    /*
     * Si l'élève écrit un nom
     * de point, celui-ci doit
     * être correct.
     */

    if (
      parsedInput.name !== null &&
      parsedAnswer.name !== null &&
      parsedInput.name !==
        parsedAnswer.name
    ) {
      continue;
    }


    const answerX =
      numericValue(
        parsedAnswer.x
      );

    const answerY =
      numericValue(
        parsedAnswer.y
      );


    if (
      inputX === answerX &&
      inputY === answerY
    ) {
      return {
        valid: true,
        errorCode: null
      };
    }
  }


  return {
    valid: false,

    errorCode:
      "WRONG_COORDINATES"
  };
}