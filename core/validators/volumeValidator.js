// core/validators/volumeValidator.js

import {
  parseAnswer
} from "../answerParser.js";

import {
  validatePiMultiple
} from "./piMultipleValidator.js";

const VOLUME_UNIT_FACTORS = {
  km3: 1_000_000_000_000_000_000,
  hm3: 1_000_000_000_000_000,
  dam3: 1_000_000_000_000,
  m3: 1_000_000_000,
  dm3: 1_000_000,
  cm3: 1_000,
  mm3: 1
};

function normalizeVolumeInput(
  userInput
) {
  return String(userInput)
    .trim()

    // Retire les délimiteurs MathJax.
    .replace(/^\\\(/, "")
    .replace(/\\\)$/, "")

    // Transforme \text{cm^3} en cm^3.
    .replace(
      /\\text\{([^{}]+)\}/g,
      "$1"
    )

    // Transforme \pi en pi.
    .replace(/\\pi/g, "pi")

    // Transforme 13{,}8 en 13,8.
    .replace(/\{,\}/g, ",")

    // Retire les espaces LaTeX.
    .replace(/\\,/g, "")
    .replace(/\\ /g, "")
    .replace(/~/g, "")

    // Nettoie les espaces ordinaires.
    .trim();
}

function normalizeUnit(
  unit
) {
  return String(unit)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/³/g, "3")
    .replace(/\^3/g, "3");
}

function parseVolumeAnswer(
  userInput,
  valueRule = null
) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_VOLUME_STRUCTURE"
    };
  }

  const trimmedInput =
    normalizeVolumeInput(
      userInput
    );

  const knownVolumeUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*((?:km|hm|dam|dm|cm|mm|m)(?:\^?3|³))$/i
    );

  const genericUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*([a-zA-Z]+(?:\^?3|³)?)$/
    );

  const match =
    knownVolumeUnitMatch ??
    genericUnitMatch;

  if (!match) {
    return {
      valid: false,
      errorCode:
        "INVALID_VOLUME_STRUCTURE"
    };
  }

  const numericPart =
    match[1].trim();

  const unit =
    normalizeUnit(
      match[2]
    );

  let parsedValue;

  if (
    valueRule?.type ===
    "piMultiple"
  ) {
    const piValidation =
      validatePiMultiple(
        numericPart
      );

    if (!piValidation.valid) {
      return {
        valid: false,
        errorCode:
          piValidation.errorCode
      };
    }

    parsedValue = {
      valid: true,
      value:
        piValidation.coefficient
    };
  } else {
    const parsedNumber =
      parseAnswer(
        numericPart
      );

    if (
      !parsedNumber.valid ||
      parsedNumber.unit !== ""
    ) {
      return {
        valid: false,
        errorCode:
          "INVALID_VOLUME_NUMBER"
      };
    }

    parsedValue = {
      valid: true,
      value:
        parsedNumber.value
    };
  }

  if (
    !Object.hasOwn(
      VOLUME_UNIT_FACTORS,
      unit
    )
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_VOLUME_UNIT"
    };
  }

  return {
    valid: true,
    value:
      parsedValue.value,
    numericPart,
    unit,
    errorCode: null
  };
}

function convertVolumeToCubicMillimeters(
  value,
  unit
) {
  return (
    value *
    VOLUME_UNIT_FACTORS[unit]
  );
}

export function validateVolumeAnswer({
  userInput,
  validAnswers,
  requiredUnit = null,
  valueRule = null,
  tolerance = 1e-9
}) {
  const parsedUserAnswer =
    parseVolumeAnswer(
      userInput,
      valueRule
    );

  if (!parsedUserAnswer.valid) {
    return parsedUserAnswer;
  }

  if (
    requiredUnit !== null &&
    parsedUserAnswer.unit !==
      normalizeUnit(requiredUnit)
  ) {
    return {
      valid: false,
      errorCode:
        "WRONG_VOLUME_UNIT"
    };
  }

  const userValueInCubicMillimeters =
    convertVolumeToCubicMillimeters(
      parsedUserAnswer.value,
      parsedUserAnswer.unit
    );

  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedValidAnswer =
      parseVolumeAnswer(
        validAnswer,
        valueRule
      );

    if (!parsedValidAnswer.valid) {
      continue;
    }

    const validValueInCubicMillimeters =
      convertVolumeToCubicMillimeters(
        parsedValidAnswer.value,
        parsedValidAnswer.unit
      );

    const sameVolume =
      Math.abs(
        userValueInCubicMillimeters -
        validValueInCubicMillimeters
      ) < tolerance;

    if (sameVolume) {
      return {
        valid: true,
        value:
          parsedUserAnswer.value,
        numericPart:
          parsedUserAnswer.numericPart,
        unit:
          parsedUserAnswer.unit,
        valueInCubicMillimeters:
          userValueInCubicMillimeters,
        errorCode: null
      };
    }
  }

  return {
    valid: false,
    errorCode:
      "WRONG_VOLUME_VALUE"
  };
}