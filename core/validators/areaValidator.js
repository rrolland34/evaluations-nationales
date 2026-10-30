// core/validators/areaValidator.js

import {
  parseAnswer
} from "../answerParser.js";

import {
  validatePiMultiple
} from "./piMultipleValidator.js";

const AREA_UNIT_FACTORS = {
  km2: 1_000_000,
  hm2: 10_000,
  dam2: 100,
  m2: 1,
  dm2: 0.01,
  cm2: 0.0001,
  mm2: 0.000001
};

function normalizeAreaInput(
  userInput
) {
  return String(userInput)
    .trim()

    // Retire les délimiteurs MathJax.
    .replace(/^\\\(/, "")
    .replace(/\\\)$/, "")

    // Transforme \text{cm^2} en cm^2.
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

function normalizeUnit(unit) {
  return String(unit)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/²/g, "2")
    .replace(/\^2/g, "2");
}

/**
 * Sépare une réponse en deux parties :
 *
 * - une partie numérique ;
 * - une unité d'aire.
 *
 * Exemples acceptés :
 * "20cm²"
 * "20 cm²"
 * "20 cm^2"
 * "20 cm2"
 * "1 250 mm²"
 * "0,2 m²"
 *
 * Exemples refusés :
 * "cm² 20"
 * "20"
 * "20 cm"
 * "20 cm² mm²"
 */
function parseAreaAnswer(
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
        "INVALID_AREA_STRUCTURE"
    };
  }

  const trimmedInput =
    normalizeAreaInput(
      userInput
    );

  /*
   * On cherche d'abord une unité d'aire
   * connue à la fin de la réponse.
   */
  const knownAreaUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*((?:km|hm|dam|dm|cm|mm|m)(?:\^?2|²))$/i
    );

  /*
   * Si aucune unité d'aire connue
   * n'est trouvée, on tente quand même
   * d'extraire une unité textuelle.
   *
   * Cela permettra de produire un
   * feedback adapté pour "20 kg"
   * ou "20 cm".
   */
  const genericUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*([a-zA-Z]+(?:\^?2|²)?)$/
    );

  const match =
    knownAreaUnitMatch ??
    genericUnitMatch;

  if (!match) {
    return {
      valid: false,
      errorCode:
        "INVALID_AREA_STRUCTURE"
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
          "INVALID_AREA_NUMBER"
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
      AREA_UNIT_FACTORS,
      unit
    )
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_AREA_UNIT"
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

function convertAreaToSquareMeters(
  value,
  unit
) {
  return (
    value *
    AREA_UNIT_FACTORS[unit]
  );
}

/**
 * Vérifie qu'une réponse représente
 * la même aire que l'une des
 * réponses configurées.
 */
export function validateAreaAnswer({
  userInput,
  validAnswers,
  requiredUnit = null,
  valueRule = null,
  tolerance = 1e-9
}) {
  const parsedUserAnswer =
    parseAreaAnswer(
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
        "WRONG_AREA_UNIT"
    };
  }

  const userValueInSquareMeters =
    convertAreaToSquareMeters(
      parsedUserAnswer.value,
      parsedUserAnswer.unit
    );

  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedValidAnswer =
      parseAreaAnswer(
        validAnswer,
        valueRule
      );

    if (!parsedValidAnswer.valid) {
      continue;
    }

    const validValueInSquareMeters =
      convertAreaToSquareMeters(
        parsedValidAnswer.value,
        parsedValidAnswer.unit
      );

    const sameArea =
      Math.abs(
        userValueInSquareMeters -
        validValueInSquareMeters
      ) < tolerance;

    if (sameArea) {
      return {
        valid: true,
        value:
          parsedUserAnswer.value,
        numericPart:
          parsedUserAnswer.numericPart,
        unit:
          parsedUserAnswer.unit,
        valueInSquareMeters:
          userValueInSquareMeters,
        errorCode: null
      };
    }
  }

  return {
    valid: false,
    errorCode:
      "WRONG_AREA_VALUE"
  };
}