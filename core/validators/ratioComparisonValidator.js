// core/validators/ratioComparisonValidator.js

function normalizeInput(
  value
) {
  return String(value)
    .trim()

    // Virgule française.
    .replace(/,/g, ".")

    // Espaces inutiles.
    .replace(/\s+/g, "")

    // Différentes écritures possibles de ≠.
    .replace(/\\neq/g, "≠")
    .replace(/!=/g, "≠");
}


function parseNumber(
  value
) {
  if (
    !/^-?\d+(?:\.\d+)?$/.test(
      value
    )
  ) {
    return null;
  }

  return Number(value);
}


function parseRatio(
  rawRatio
) {
  const parts =
    rawRatio.split("/");

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const numerator =
    parseNumber(
      parts[0]
    );

  const denominator =
    parseNumber(
      parts[1]
    );

  if (
    numerator === null ||
    denominator === null ||
    Math.abs(
      denominator
    ) < 1e-12
  ) {
    return null;
  }

  return {
    numerator,
    denominator,

    value:
      numerator /
      denominator
  };
}


function ratioBelongsToTable(
  ratio,
  firstRow,
  secondRow
) {
  for (
    let index = 0;
    index < firstRow.length;
    index++
  ) {
    const top =
      firstRow[
        index
      ];

    const bottom =
      secondRow[
        index
      ];

    const direct =
      Math.abs(
        ratio.numerator -
        bottom
      ) < 1e-9 &&
      Math.abs(
        ratio.denominator -
        top
      ) < 1e-9;

    const inverse =
      Math.abs(
        ratio.numerator -
        top
      ) < 1e-9 &&
      Math.abs(
        ratio.denominator -
        bottom
      ) < 1e-9;

    if (
      direct ||
      inverse
    ) {
      return {
        valid: true,

        direction:
          direct
            ? "bottomOverTop"
            : "topOverBottom",

        columnIndex:
          index
      };
    }
  }

  return {
    valid: false,
    direction: null,
    columnIndex: null
  };
}


export function validateRatioComparison({
  userInput,
  expectedRelation,
  firstRow,
  secondRow
}) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_RATIO_COMPARISON"
    };
  }

  const normalized =
    normalizeInput(
      userInput
    );

  let operator =
    null;

  let rawRatios =
    null;

  if (
    normalized.includes(
      "≠"
    )
  ) {
    operator =
      "notEqual";

    rawRatios =
      normalized.split(
        "≠"
      );
  } else if (
    normalized.includes(
      "="
    )
  ) {
    operator =
      "equal";

    rawRatios =
      normalized.split(
        "="
      );
  }

  if (
    !operator ||
    !rawRatios ||
    rawRatios.length < 2
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_RATIO_COMPARISON"
    };
  }

  /*
   * On ne mélange pas = et ≠
   * dans une même réponse.
   */
  if (
    rawRatios.some(
      ratio =>
        ratio.includes("=") ||
        ratio.includes("≠")
    )
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_RATIO_COMPARISON"
    };
  }

  const ratios =
    rawRatios.map(
      rawRatio =>
        parseRatio(
          rawRatio
        )
    );

  if (
    ratios.some(
      ratio => !ratio
    )
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_RATIO"
    };
  }

  const tableMatches =
    ratios.map(
      ratio =>
        ratioBelongsToTable(
          ratio,
          firstRow,
          secondRow
        )
    );

  if (
    tableMatches.some(
      match =>
        !match.valid
    )
  ) {
    return {
      valid: false,
      errorCode:
        "RATIO_NOT_FROM_TABLE"
    };
  }

  const commonDirection =
    tableMatches[0]
      .direction;

  if (
    tableMatches.some(
      match =>
        match.direction !==
        commonDirection
    )
  ) {
    return {
      valid: false,
      errorCode:
        "INCONSISTENT_RATIO_DIRECTION"
    };
  }

  const usedColumns =
    new Set(
      tableMatches.map(
        match =>
          match.columnIndex
      )
    );

  if (
    usedColumns.size !==
    tableMatches.length
  ) {
    return {
      valid: false,
      errorCode:
        "DUPLICATE_RATIO"
    };
  }

  /*
   * Le symbole choisi par l'élève
   * doit correspondre à la réponse attendue.
   */
  if (
    operator !==
    expectedRelation
  ) {
    return {
      valid: false,
      errorCode:
        "WRONG_RELATION"
    };
  }

  const firstValue =
    ratios[0].value;

  if (
    operator ===
    "equal"
  ) {
    const allEqual =
      ratios.every(
        ratio =>
          Math.abs(
            ratio.value -
            firstValue
          ) < 1e-9
      );

    return {
      valid:
        allEqual,

      errorCode:
        allEqual
          ? null
          : "RATIOS_NOT_EQUAL"
    };
  }

  /*
   * Pour une inégalité,
   * il suffit qu'au moins un des rapports
   * soit différent du premier.
   */
  const atLeastOneDifferent =
    ratios
      .slice(1)
      .some(
        ratio =>
          Math.abs(
            ratio.value -
            firstValue
          ) >= 1e-9
      );

  return {
    valid:
      atLeastOneDifferent,

    errorCode:
      atLeastOneDifferent
        ? null
        : "RATIOS_ARE_EQUAL"
  };
}