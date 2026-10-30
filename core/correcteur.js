// core/correcteur.js
import { validateProbability } from "./validators/probabilityValidator.js";
import { validateIntegerSet } from "./validators/integerSetValidator.js";
import { validateCalculationExpression } from "./validators/calculationExpressionValidator.js";

import {
  validateSymbolicExact
} from "./validators/symbolicExactValidator.js";

import {
  parseAnswer
} from "./answerParser.js";

import {
  validateDecimalFormat
} from "./validators/decimalValidator.js";

import {
  validateFractionFormat
} from "./validators/fractionValidator.js";

import {
  validateIntegerPlusDecimalFraction,
  validateExpandedDecimalFraction
} from "./validators/decompositionValidator.js";

import {
  validateDecimalFractionFormat
} from "./validators/decimalFractionValidator.js";

import {
  validateSimplifiedValueFormat
} from "./validators/simplifiedValueValidator.js";

import {
  validateCanonicalDecimalFormat
} from "./validators/canonicalDecimalValidator.js";

import {
  validateCanonicalDecimalFractionFormat
} from "./validators/canonicalDecimalFractionValidator.js";

import {
  validateMultipleOf
} from "./validators/multipleOfValidator.js";

import {
  validateDivisorOf
} from "./validators/divisorOfValidator.js";

import {
  validateIntegerFormat
} from "./validators/integerValidator.js";

import {
  validateLengthAnswer
} from "./validators/lengthValidator.js";

import {
  validateLengthUnit
} from "./validators/lengthUnitValidator.js";

import {
  validateSpeedAnswer
} from "./validators/speedValidator.js";

import {
  validateDurationAnswer
} from "./validators/durationValidator.js";

import {
  validateValueWithUnit
} from "./validators/valueWithUnitValidator.js";

import {
  validateAreaUnit
} from "./validators/areaUnitValidator.js";

import {
  validateAreaAnswer
} from "./validators/areaValidator.js";

import {
  validateThalesRelation
} from "./validators/thalesRelationValidator.js";

import {
  validateCoordinates
} from "./validators/coordinatesValidator.js";

import {
  validatePower
} from "./validators/powerValidator.js";

import {
  validateRepeatedProduct
} from "./validators/repeatedProductValidator.js";

import {
  validateScientificNotation
} from "./validators/scientificNotationValidator.js";

import {
  validateRatioComparison
} from "./validators/ratioComparisonValidator.js";

import {
  validateVolumeUnit
} from "./validators/volumeUnitValidator.js";

import {
  validateVolumeAnswer
} from "./validators/volumeValidator.js";

import {
  validateAlgebra
} from "./validators/algebraValidator.js";

import {
  validatePercentage
} from "./validators/percentageValidator.js";

import {
  validateSum
} from "./validators/sumValidator.js";

/**
 * Compare la réponse de l'utilisateur
 * aux réponses acceptées.
 *
 * La valeur mathématique est vérifiée
 * avant la forme demandée.
 */
export function checkAnswerSmart({
  userInput,
  validAnswers,
  answerRule,
  tolerance = 1e-9
}) {
  if (
    !Array.isArray(validAnswers) ||
    validAnswers.length === 0
  ) {
    return {
      correct: false,
      feedback:
        "Aucune réponse correcte n'est configurée",
      showCorrectAnswer: false
    };
  }

  if (answerRule?.type === "integerSet") {
    const validation = validateIntegerSet({ userInput, expectedValues: answerRule.expectedValues });
    return {
      correct: validation.valid,
      feedback: validation.valid ? "Bonne réponse !" : "Un ensemble d'entiers distincts est attendu.",
      showCorrectAnswer: validation.errorCode !== 'INVALID_INTEGER_SET_CONFIGURATION',
      errorCode: validation.errorCode
    };
  }

  // Une question peut fournir une règle locale sans ajouter de validateur global.
  if (answerRule?.type === "custom" && typeof answerRule.validate === "function") {
    const validation = answerRule.validate({ userInput, validAnswers });
    return {
      correct: validation.valid === true,
      feedback: validation.valid ? "Bonne réponse !" : (validation.feedback ?? ""),
      showCorrectAnswer: true
    };
  }

  if (answerRule?.type === "calculationExpression") {
    const validation = validateCalculationExpression({
      userInput,
      patterns: answerRule.patterns,
      equivalences: answerRule.equivalences,
      allowNumberOnly: answerRule.allowNumberOnly
    });
    const messages = {
      INVALID_CALCULATION_CONFIGURATION: "Aucun modèle de calcul valide n'est configuré.",
      INVALID_CALCULATION_EXPRESSION: "L’expression saisie n’est pas valide.",
      EXPECTED_CALCULATION: "Un calcul est attendu, pas seulement son résultat.",
      WRONG_CALCULATION_STRUCTURE: "Le calcul ne correspond pas à la méthode demandée."
    };
    return {
      correct: validation.valid,
      feedback: validation.valid ? "Bonne réponse !" : messages[validation.errorCode],
      showCorrectAnswer: validation.errorCode !== "INVALID_CALCULATION_CONFIGURATION",
      errorCode: validation.errorCode
    };
  }

  if (answerRule?.type === "probability") {
    const validation = validateProbability({ userInput, validAnswers });
    return {
      correct: validation.valid,
      feedback: validation.valid ? "Bonne réponse !" : validation.errorCode === "INVALID_PROBABILITY"
        ? "Une probabilité entre 0 et 1, sous forme de fraction, de nombre décimal ou de pourcentage, est attendue."
        : "",
      showCorrectAnswer: true,
      errorCode: validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "length"
  ) {
    const validation =
      validateLengthAnswer({
        userInput,
        validAnswers,

        requiredUnit:
          answerRule.requiredUnit ??
          null,

        valueRule:
          answerRule.valueRule ??
          null,

        tolerance
      });

    if (validation.valid) {
      return {
        correct: true,
        feedback: "Bonne réponse !",
        showCorrectAnswer: true
      };
    }

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_LENGTH_STRUCTURE"
    ) {
      feedback =
        "Une longueur écrite sous la forme « nombre suivi d’une unité » est attendue.";
    }

    if (
      validation.errorCode ===
      "INVALID_LENGTH_NUMBER"
    ) {
      feedback =
        "La valeur numérique de la longueur est invalide.";
    }

    if (
      validation.errorCode ===
      "EXPECTED_LENGTH_UNIT"
    ) {
      feedback =
        "Une unité de longueur est attendue.";
    }

    if (
      validation.errorCode ===
      "WRONG_LENGTH_UNIT"
    ) {
      feedback =
        `La réponse doit être donnée en ${answerRule.requiredUnit}.`;
    }

    if (
      validation.errorCode ===
      "MISSING_MULTIPLICATION_AFTER_PI"
    ) {
      feedback =
        "Le coefficient placé après \\(\\pi\\) doit être précédé du signe \\(\\times\\) ou \\(*\\).";
    }

    if (
      validation.errorCode ===
      "MULTIPLE_PI_SYMBOLS"
    ) {
      feedback =
        "Un seul symbole \\(\\pi\\) est attendu.";
    }

    if (
      validation.errorCode ===
      "EXPECTED_PI_MULTIPLE"
    ) {
      feedback =
        "Un multiple de \\(\\pi\\) est attendu.";
    }

    if (
      validation.errorCode ===
      "INVALID_PI_COEFFICIENT"
    ) {
      feedback =
        "Le coefficient de \\(\\pi\\) est invalide.";
    }

    return {
      correct: false,
      feedback,
      showCorrectAnswer: true,
      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "area"
  ) {
    const validation =
      validateAreaAnswer({
        userInput,
        validAnswers,
        requiredUnit:
          answerRule.requiredUnit ??
          null,
        valueRule:
          answerRule.valueRule ??
          null,
        tolerance
      });

    let feedback = "";

    switch (validation.errorCode) {
      case "INVALID_AREA_STRUCTURE":
        feedback =
          "Une aire avec son unité est attendue.";
        break;

      case "INVALID_AREA_NUMBER":
        feedback =
          "La valeur numérique de l'aire est invalide.";
        break;

      case "EXPECTED_AREA_UNIT":
        feedback =
          "Une unité d'aire est attendue.";
        break;

      case "WRONG_AREA_UNIT":
        feedback =
          "Bonne valeur mais mauvaise unité d'aire.";
        break;

      case "WRONG_AREA_VALUE":
        feedback = "";
        break;
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "lengthUnit"
  ) {
    const validation =
      validateLengthUnit({
        userInput,
        validAnswers
      });

    let feedback = "";

    switch (validation.errorCode) {
      case "EXPECTED_UNIT_ONLY":
        feedback =
          "Seule l’unité est attendue.";
        break;

      case "WRONG_LENGTH_UNIT":
        feedback = "";
        break;
    }

    return {
      correct: validation.valid,
      feedback,
      showCorrectAnswer: true,
      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "areaUnit"
  ) {
    const validation =
      validateAreaUnit({
        userInput,
        validAnswers
      });

    let feedback = "";

    switch (validation.errorCode) {
      case "EXPECTED_UNIT_ONLY":
        feedback =
          "Seule l’unité est attendue.";
        break;

      case "WRONG_AREA_UNIT":
        feedback = "";
        break;
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "volume"
  ) {
    const validation =
      validateVolumeAnswer({
        userInput,
        validAnswers,

        requiredUnit:
          answerRule.requiredUnit ??
          null,

        valueRule:
          answerRule.valueRule ??
          null,

        tolerance
      });

    let feedback = "";

    switch (validation.errorCode) {
      case "INVALID_VOLUME_STRUCTURE":
        feedback =
          "Un volume avec son unité est attendu.";
        break;

      case "INVALID_VOLUME_NUMBER":
        feedback =
          "La valeur numérique du volume est invalide.";
        break;

      case "EXPECTED_VOLUME_UNIT":
        feedback =
          "Une unité de volume est attendue.";
        break;

      case "WRONG_VOLUME_UNIT":
        feedback =
          "Bonne valeur mais mauvaise unité de volume.";
        break;

      case "WRONG_VOLUME_VALUE":
        feedback = "";
        break;
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "volumeUnit"
  ) {
    const validation =
      validateVolumeUnit({
        userInput,
        validAnswers
      });

    let feedback = "";

    switch (validation.errorCode) {
      case "EXPECTED_UNIT_ONLY":
        feedback =
          "Seule l’unité est attendue.";
        break;

      case "WRONG_VOLUME_UNIT":
        feedback = "";
        break;
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "algebra"
  ) {
    const validation =
      validateAlgebra({
        userInput,
        validAnswers,

        form:
          answerRule.form ??
          "equivalent",

        tolerance
      });


    let feedback = "";


    switch (
      validation.errorCode
    ) {
      case "INVALID_ALGEBRA_EXPRESSION":
        feedback =
          "L’expression saisie n’est pas valide.";
        break;


      case "WRONG_ALGEBRA_VALUE":
        feedback = "";
        break;


      case "NOT_DEVELOPED":
        feedback =
          "L’expression est correcte, mais elle n’est pas développée.";
        break;


      case "NOT_REDUCED":
        feedback =
          "L’expression est correcte, mais elle n’est pas réduite.";
        break;


      case "NOT_FACTORIZED":
        feedback =
          "L’expression est correcte, mais elle n’est pas factorisée.";
        break;


      case "NOT_FULLY_FACTORIZED":
        feedback =
          "L’expression est correcte, mais la factorisation n’est pas complète.";
        break;


      case "UNKNOWN_ALGEBRA_FORM":
        feedback =
          "La forme algébrique demandée n’est pas reconnue.";
        break;
    }


    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "percentage"
  ) {
    const expectedAnswer =
      parseAnswer(
        validAnswers[0]
      );

    if (!expectedAnswer.valid) {
      return {
        correct: false,
        feedback:
          "La réponse correcte configurée est invalide.",
        showCorrectAnswer: false
      };
    }

    const validation =
      validatePercentage({
        userInput,

        expectedValue:
          expectedAnswer.value,

        tolerance
      });

    let feedback = "";

    switch (
      validation.errorCode
    ) {
      case "INVALID_PERCENTAGE":
        feedback =
          "Le pourcentage saisi n’est pas valide.";
        break;

      case "NOT_PERCENTAGE":
        feedback =
          "Une écriture en pourcentage est attendue.";
        break;

      case "WRONG_PERCENTAGE_VALUE":
        feedback = "";
        break;
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type === "speed"
  ) {
    const validation =
      validateSpeedAnswer({
        userInput,
        validAnswers,

        requiredUnit:
          answerRule.requiredUnit ??
          null,

        tolerance
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_SPEED_STRUCTURE"
    ) {
      feedback =
        "Une vitesse écrite sous la forme « nombre suivi d’une unité » est attendue.";
    }

    if (
      validation.errorCode ===
      "INVALID_SPEED_NUMBER"
    ) {
      feedback =
        "La valeur numérique de la vitesse est invalide.";
    }

    if (
      validation.errorCode ===
      "EXPECTED_SPEED_UNIT"
    ) {
      feedback =
        "Une unité de vitesse est attendue.";
    }

    if (
      validation.errorCode ===
      "WRONG_SPEED_UNIT"
    ) {
      feedback =
        `La réponse doit être donnée en ${answerRule.requiredUnit}.`;
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer: true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type === "duration"
  ) {
    const validation =
      validateDurationAnswer({
        userInput,
        validAnswers,
        requiredFormat: answerRule.requiredFormat ?? null
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_DURATION_STRUCTURE"
    ) {
      feedback =
        "Une durée écrite en heures et minutes est attendue.";
    }

    if (
      validation.errorCode ===
      "INVALID_DURATION_NUMBER"
    ) {
      feedback =
        "Les heures et les minutes doivent être des nombres entiers.";
    }

    if (
      validation.errorCode ===
      "INVALID_DURATION_MINUTES"
    ) {
      feedback =
        "Le nombre de minutes doit être compris entre 0 et 59.";
    }

    return {
      correct:
        validation.valid,

      feedback,

      showCorrectAnswer: true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "valueWithUnit"
  ) {
    const validation =
      validateValueWithUnit({
        userInput,
        validAnswers,

        requiredUnit:
          answerRule.requiredUnit
      });

    if (!validation.valid) {
      let feedback = "";

      if (
        validation.errorCode ===
        "EXPECTED_REQUIRED_UNIT"
      ) {
        feedback =
          `L'unité ${answerRule.requiredUnit} est attendue.`;
      }

      if (
        validation.errorCode ===
        "WRONG_REQUIRED_UNIT"
      ) {
        feedback =
          `La réponse doit être donnée en ${answerRule.requiredUnit}.`;
      }

      return {
        correct: false,
        feedback,
        showCorrectAnswer: true,
        errorCode:
          validation.errorCode
      };
    }

    const valueResult =
      checkAnswerSmart({
        userInput:
          validation.valueInput,

        validAnswers,

        answerRule:
          answerRule.valueRule ?? null,

        tolerance
      });

    return valueResult;
  }

  if (
    answerRule?.numberOnly
  ) {
    const normalizedInput =
      String(userInput)
        .trim();

    const numberAndUnitMatch =
      normalizedInput.match(
        /^[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)\s*[a-zA-Z]+(?:\^?[23]|[²³])?$/
      );

    if (numberAndUnitMatch) {
      return {
        correct: false,
        feedback:
          "Seul le nombre est attendu.",
        showCorrectAnswer: true
      };
    }
  }

  if (
    answerRule?.type ===
    "sum"
  ) {
    const validation =
      validateSum(
        userInput,
        answerRule.terms
      );

    let feedback = "";

    if (
      validation.errorCode ===
      "EXPECTED_SUM"
    ) {
      feedback =
        "Une somme contenant les termes attendus est demandée.";
    }

    if (
      validation.errorCode ===
      "INCORRECT_SUM"
    ) {
      feedback =
        "Les termes de la somme sont incorrects.";
    }

    if (
      validation.errorCode ===
      "INVALID_SUM_TERMS"
    ) {
      feedback =
        "La somme attendue est mal configurée.";
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "symbolicExact"
  ) {
    const validation =
      validateSymbolicExact({
        userInput,
        validAnswers
      });

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : "",

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "thalesRelation"
  ) {
    const validation =
      validateThalesRelation({
        userInput,

        correspondences:
          answerRule.correspondences,

        values:
          answerRule.values ?? {}
      });

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : "Égalité de rapports incorrecte.",

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "ratioComparison"
  ) {
    const validation =
      validateRatioComparison({
        userInput,

        expectedRelation:
          answerRule.expectedRelation,

        firstRow:
          answerRule.firstRow,

        secondRow:
          answerRule.secondRow
      });

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : "Comparaison de rapports incorrecte.",

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "coordinates"
  ) {
    const validation =
      validateCoordinates({
        userInput,

        validAnswers,

        valueRule:
          answerRule.valueRule ??
          null
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_COORDINATES_STRUCTURE"
    ) {
      feedback =
        "Les coordonnées doivent être écrites sous la forme \\(A(x;y)\\) ou \\((x;y)\\).";
    }

    if (
      validation.errorCode ===
      "INVALID_COORDINATE_FORMAT"
    ) {
      feedback =
        "L'écriture des coordonnées n'est pas conforme à la forme demandée.";
    }

    if (
      validation.errorCode ===
      "INVALID_COORDINATE_VALUE"
    ) {
      feedback =
        "Une des coordonnées n'est pas un nombre valide.";
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "power"
  ) {
    const validation =
      validatePower({
        userInput,

        expectedBase: answerRule.expectedBase,

        expectedValue:
          answerRule.expectedValue,

        allowOneForZeroExponent:
          answerRule
            .allowOneForZeroExponent
          ?? true
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_POWER_FORMAT"
    ) {
      feedback =
        "Une puissance écrite sous la forme \\(a^n\\) est attendue.";
    }

    if (
      validation.errorCode ===
      "INVALID_POWER_VALUE"
    ) {
      feedback =
        "La puissance saisie n'est pas valide.";
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "repeatedProduct"
  ) {
    const validation =
      validateRepeatedProduct({
        userInput,

        base:
          answerRule.base,

        exponent:
          answerRule.exponent
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "WRONG_FACTOR_COUNT"
    ) {
      feedback =
        "Le nombre de facteurs est incorrect.";
    }

    if (
      validation.errorCode ===
      "WRONG_REPEATED_PRODUCT"
    ) {
      feedback =
        "Le produit ne correspond pas à la puissance demandée.";
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  if (
    answerRule?.type ===
    "scientificNotation"
  ) {
    const validation =
      validateScientificNotation({
        userInput,

        expectedValue:
          answerRule.expectedValue
      });

    let feedback = "";

    if (
      validation.errorCode ===
      "INVALID_SCIENTIFIC_FORMAT"
    ) {
      feedback =
        "Une écriture scientifique de la forme \\(a\\times10^n\\) est attendue.";
    }

    if (
      validation.errorCode ===
      "INVALID_SCIENTIFIC_VALUE"
    ) {
      feedback =
        "L'écriture scientifique saisie n'est pas valide.";
    }

    if (
      validation.errorCode ===
      "NOT_SCIENTIFIC_NOTATION"
    ) {
      feedback =
        "Le coefficient doit avoir une valeur absolue comprise entre 1 et 10.";
    }

    return {
      correct:
        validation.valid,

      feedback:
        validation.valid
          ? "Bonne réponse !"
          : feedback,

      showCorrectAnswer:
        true,

      errorCode:
        validation.errorCode
    };
  }

  const userAnswer =
    parseAnswer(userInput);

  if (!userAnswer.valid) {
    return {
      correct: false,
      feedback: "Réponse invalide",
      showCorrectAnswer: true
    };
  }

  if (
    answerRule?.type ===
    "multipleOf"
  ) {
    const validation =
      validateMultipleOf(
        userInput,
        answerRule.referenceNumber
      );

    if (!validation.valid) {
      return {
        correct: false,
        feedback: "",
        showCorrectAnswer: true
      };
    }

    return {
      correct: true,
      feedback: "Bonne réponse !",
      showCorrectAnswer: true
    };
  }

  if (
    answerRule?.type ===
    "divisorOf"
  ) {
    const validation =
      validateDivisorOf(
        userInput,
        answerRule.referenceNumber
      );

    if (!validation.valid) {
      return {
        correct: false,
        feedback: "",
        showCorrectAnswer: true
      };
    }

    return {
      correct: true,
      feedback: "Bonne réponse !",
      showCorrectAnswer: true
    };
  }

  let matchingAnswerFound = false;

  for (const validAnswer of validAnswers) {
    const parsedValidAnswer =
      parseAnswer(validAnswer);

    if (!parsedValidAnswer.valid) {
      continue;
    }

    const sameValue =
      Math.abs(
        userAnswer.value -
        parsedValidAnswer.value
      ) < tolerance;

    const sameUnit =
      userAnswer.unit ===
        parsedValidAnswer.unit ||
      (
        userAnswer.unit ===
          "%" &&
        parsedValidAnswer.unit ===
          ""
      ) ||
      (
        userAnswer.unit ===
          "" &&
        parsedValidAnswer.unit ===
          "%"
      );

    if (sameValue && sameUnit) {
      matchingAnswerFound = true;
      break;
    }

    if (sameValue && !sameUnit) {
      return {
        correct: false,
        feedback:
          "Bonne valeur mais mauvaise unité",
        showCorrectAnswer: true
      };
    }
  }

  if (matchingAnswerFound) {
    if (
      answerRule?.type ===
      "canonicalDecimal"
    ) {
      const validation =
        validateCanonicalDecimalFormat(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une écriture décimale sans zéro inutile est attendue.",
          showCorrectAnswer: false,
          errorCode:
            validation.errorCode
        };
      }
    }

    if (
      answerRule?.type ===
      "canonicalDecimalFraction"
    ) {
      const validation =
        validateCanonicalDecimalFractionFormat(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une fraction décimale sous sa forme la plus simple est attendue.",
          showCorrectAnswer: false,
          errorCode:
            validation.errorCode
        };
      }
    }

    if (
      answerRule?.type ===
      "simplifiedValue"
    ) {
      const validation =
        validateSimplifiedValueFormat(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une réponse sous la forme la plus simple est attendue.",
          showCorrectAnswer: false
        };
      }
    }

    if (answerRule?.type === "integer") {
      const validation =
        validateIntegerFormat(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Un nombre entier est attendu.",
          showCorrectAnswer: false
        };
      }
    }

    if (
      answerRule?.type ===
      "decimal"
    ) {
      const validation =
        validateDecimalFormat(
          userInput
        );

      if (!validation.valid) {
        let feedback =
          "Réponse invalide.";

        if (
          validation.errorCode ===
          "EXPECTED_DECIMAL"
        ) {
          feedback =
            "Une écriture décimale est attendue.";
        }

        return {
          correct: false,
          feedback,
          showCorrectAnswer: false
        };
      }
    }

    if (
      answerRule?.type ===
      "fraction"
    ) {
      const validation =
        validateFractionFormat(
          userInput,
          { irreducible: answerRule.irreducible === true }
        );

      if (!validation.valid) {
        let feedback =
          "Réponse invalide.";

        if (
          validation.errorCode ===
          "EXPECTED_FRACTION"
        ) {
          feedback =
            "Une fraction est attendue.";
        }

        if (validation.errorCode === "EXPECTED_IRREDUCIBLE_FRACTION") {
          feedback = "Une fraction irréductible est attendue.";
        }

        return {
          correct: false,
          feedback,
          showCorrectAnswer: false
        };
      }
    }

    if (
      answerRule?.type ===
      "decimalFraction"
    ) {
      const validation =
        validateDecimalFractionFormat(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une fraction décimale est attendue.",
          errorCode:
            validation.errorCode,
          showCorrectAnswer: false
        };
      }
    }

    if (
      answerRule?.type ===
      "integerPlusDecimalFraction"
    ) {
      const validation =
        validateIntegerPlusDecimalFraction(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une somme d’un nombre entier et d’une fraction décimale inférieure à 1 est attendue.",
          showCorrectAnswer: false
        };
      }
    }

    if (
      answerRule?.type ===
      "expandedDecimalFraction"
    ) {
      const validation =
        validateExpandedDecimalFraction(
          userInput
        );

      if (!validation.valid) {
        return {
          correct: false,
          feedback:
            "Une somme d’un nombre entier et de fractions décimales ayant un numérateur inférieur à 10 est attendue.",
          showCorrectAnswer: false
        };
      }
    }

    return {
      correct: true,
      feedback: "Bonne réponse !",
      showCorrectAnswer: true
    };
  }

  return {
    correct: false,
    feedback: "",
    showCorrectAnswer: true
  };
}
