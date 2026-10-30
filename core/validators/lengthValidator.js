// core/validators/lengthValidator.js

import {
  parseAnswer
} from "../answerParser.js";

import {
  validatePiMultiple
} from "./piMultipleValidator.js";

import {
  validateCanonicalDecimalFormat
} from "./canonicalDecimalValidator.js";

const LENGTH_UNIT_FACTORS = {
  km: 1000,
  hm: 100,
  dam: 10,
  m: 1,
  dm: 0.1,
  cm: 0.01,
  mm: 0.001
};

function normalizeLengthInput(
  userInput
) {
  return String(userInput)
    .trim()

    // Retire les délimiteurs MathJax.
    .replace(/^\\\(/, "")
    .replace(/\\\)$/, "")

    // Transforme \text{cm} en cm.
    .replace(
      /\\text\{([^{}]+)\}/g,
      "$1"
    )

    // Transforme \mathrm{cm} en cm.
    .replace(
      /\\mathrm\{([^{}]+)\}/g,
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
    .replace(/³/g, "3")
    .replace(/\^2/g, "2")
    .replace(/\^3/g, "3");
}

/**
 * Sépare une réponse en deux parties :
 *
 * - une partie numérique ;
 * - une unité.
 *
 * Exemples acceptés :
 * "20cm"
 * "20 cm"
 * "1 250 mm"
 * "0,2 m"
 *
 * Exemples refusés :
 * "cm 20"
 * "c 20 m"
 * "20"
 * "20 cm mm"
 */
function parseLengthAnswer(
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
        "INVALID_LENGTH_STRUCTURE"
    };
  }

  const trimmedInput =
    normalizeLengthInput(
      userInput
    );

  /*
   * On cherche d’abord une unité de longueur
   * connue à la fin de la réponse.
   *
   * Cela permet de découper correctement :
   * "13.8pimm"
   *
   * en :
   * numericPart = "13.8pi"
   * unit = "mm"
   */
  const knownLengthUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*((?:km|hm|dam|dm|cm|mm|m)(?:\^?[23]|[²³])?)$/i
    );

  /*
   * Si aucune unité de longueur connue
   * n’est trouvée, on tente tout de même
   * d’extraire une unité textuelle.
   *
   * Cela permet de produire le feedback
   * « Une unité de longueur est attendue »
   * pour "20 kg" ou "20 mol".
   */
  const genericUnitMatch =
    trimmedInput.match(
      /^(.+?)\s*([a-zA-Z]+(?:\^?[23]|[²³])?)$/
    );

  const match =
    knownLengthUnitMatch ??
    genericUnitMatch;

  if (!match) {
    return {
      valid: false,
      errorCode:
        "INVALID_LENGTH_STRUCTURE"
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
          "INVALID_LENGTH_NUMBER"
      };
    }

    if (
      valueRule?.type ===
      "canonicalDecimal"
    ) {
      const formatValidation =
        validateCanonicalDecimalFormat(
          numericPart
        );

      if (!formatValidation.valid) {
        return {
          valid: false,
          errorCode:
            formatValidation.errorCode
        };
      }
    }

    parsedValue = {
      valid: true,
      value:
        parsedNumber.value
    };
  }

  if (
    !Object.hasOwn(
      LENGTH_UNIT_FACTORS,
      unit
    )
  ) {
    return {
      valid: false,
      errorCode:
        "EXPECTED_LENGTH_UNIT"
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

function convertLengthToMeters(
  value,
  unit
) {
  return (
    value *
    LENGTH_UNIT_FACTORS[unit]
  );
}

/**
 * Vérifie qu'une réponse représente
 * la même longueur que l'une des
 * réponses configurées.
 */
export function validateLengthAnswer({
  userInput,
  validAnswers,
  requiredUnit = null,
  valueRule = null,
  tolerance = 1e-9
}) {
  const parsedUserAnswer =
    parseLengthAnswer(
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
      errorCode: "WRONG_LENGTH_UNIT"
    };
  }

  const userValueInMeters =
    convertLengthToMeters(
      parsedUserAnswer.value,
      parsedUserAnswer.unit
    );

  for (
    const validAnswer
    of validAnswers
  ) {
    const parsedValidAnswer =
      parseLengthAnswer(
        validAnswer,
        valueRule
      );

    if (!parsedValidAnswer.valid) {
      continue;
    }

    const validValueInMeters =
      convertLengthToMeters(
        parsedValidAnswer.value,
        parsedValidAnswer.unit
      );

    const sameLength =
      Math.abs(
        userValueInMeters -
        validValueInMeters
      ) < tolerance;

    if (sameLength) {
      return {
        valid: true,
        value:
          parsedUserAnswer.value,
        numericPart:
          parsedUserAnswer.numericPart,
        unit:
          parsedUserAnswer.unit,
        valueInMeters:
          userValueInMeters,
        errorCode: null
      };
    }
  }

  return {
    valid: false,
    errorCode: "WRONG_LENGTH_VALUE"
  };
}