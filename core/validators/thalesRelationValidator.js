// core/validators/thalesRelationValidator.js

function normalizeInput(
  value
) {
  return String(value)
    .trim()
    .toUpperCase()

    // Virgule française.
    .replace(/,/g, ".")

    // Espaces inutiles.
    .replace(/\s+/g, "");
}


function normalizeSegment(
  value
) {
  /*
   * AB et BA représentent
   * la même longueur.
   */
  if (
    /^[A-Z]{2}$/.test(value)
  ) {
    return value
      .split("")
      .sort()
      .join("");
  }

  return value;
}


function parseTerm(
  rawTerm,
  values
) {
  const term =
    normalizeInput(rawTerm);

  /*
   * Nombre.
   */
  if (
    /^-?\d+(?:\.\d+)?$/.test(
      term
    )
  ) {
    return {
      type: "number",
      value: Number(term)
    };
  }

  /*
   * Segment.
   */
  if (
    /^[A-Z]{2}$/.test(
      term
    )
  ) {
    const segment =
      normalizeSegment(term);

    return {
      type: "segment",
      value: segment
    };
  }

  return null;
}


function parseRatio(
  rawRatio,
  values
) {
  const parts =
    rawRatio.split("/");

  if (parts.length !== 2) {
    return null;
  }

  const numerator =
    parseTerm(
      parts[0],
      values
    );

  const denominator =
    parseTerm(
      parts[1],
      values
    );

  if (
    !numerator ||
    !denominator
  ) {
    return null;
  }

  return {
    numerator,
    denominator
  };
}


function resolveTerm(
  term,
  values
) {
  if (
    term.type === "number"
  ) {
    return {
      kind: "number",
      value: term.value
    };
  }

  const segmentName =
    term.value;

  /*
   * Si une valeur numérique est connue
   * pour ce segment, on la conserve aussi.
   */
  const configuredValue =
    values[segmentName];

  return {
    kind: "segment",
    segment: segmentName,

    numericValue:
      configuredValue ??
      null
  };
}


function sameTerm(
  term,
  expectedSegment,
  expectedValue
) {
  const resolved =
    resolveTerm(
      term,
      {}
    );

  /*
   * Réponse donnée sous forme
   * de nom de segment.
   */
  if (
    resolved.kind === "segment"
  ) {
    return (
      resolved.segment ===
      normalizeSegment(
        expectedSegment
      )
    );
  }

  /*
   * Réponse donnée sous forme
   * numérique.
   */
  if (
    resolved.kind === "number" &&
    expectedValue !== null &&
    expectedValue !== undefined
  ) {
    return (
      Math.abs(
        resolved.value -
        expectedValue
      ) < 1e-9
    );
  }

  return false;
}


function ratioMatches(
  ratio,
  smallSegment,
  largeSegment,
  values
) {
  const smallValue =
    values[
      normalizeSegment(
        smallSegment
      )
    ];

  const largeValue =
    values[
      normalizeSegment(
        largeSegment
      )
    ];

  const direct =
    sameTerm(
      ratio.numerator,
      smallSegment,
      smallValue
    ) &&
    sameTerm(
      ratio.denominator,
      largeSegment,
      largeValue
    );

  const inverse =
    sameTerm(
      ratio.numerator,
      largeSegment,
      largeValue
    ) &&
    sameTerm(
      ratio.denominator,
      smallSegment,
      smallValue
    );

  if (direct) {
    return "direct";
  }

  if (inverse) {
    return "inverse";
  }

  return null;
}


export function validateThalesRelation({
  userInput,
  correspondences,
  values = {}
}) {
  if (
    userInput === null ||
    userInput === undefined
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_THALES_RELATION"
    };
  }

  const normalized =
    normalizeInput(
      userInput
    );

  const rawRatios =
    normalized.split("=");

  /*
   * On accepte 2 ou 3 rapports.
   */
  if (
    rawRatios.length < 2 ||
    rawRatios.length > 3
  ) {
    return {
      valid: false,
      errorCode:
        "INVALID_THALES_RELATION"
    };
  }

  const ratios =
    rawRatios.map(
      rawRatio =>
        parseRatio(
          rawRatio,
          values
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
        "INVALID_THALES_RELATION"
    };
  }

  /*
   * Chaque correspondance décrit :
   *
   * petit segment ↔ grand segment
   *
   * Exemple :
   * BD ↔ BA
   * BE ↔ BC
   * DE ↔ AC
   */
  const correspondenceEntries =
    Object.entries(
      correspondences
    );

  let commonDirection =
    null;

  const usedCorrespondences =
    new Set();

  for (
    const ratio
    of ratios
  ) {
    let foundMatch =
      false;

    for (
      const [
        smallSegment,
        largeSegment
      ]
      of correspondenceEntries
    ) {
      const key =
        `${smallSegment}:${largeSegment}`;

      if (
        usedCorrespondences.has(
          key
        )
      ) {
        continue;
      }

      const direction =
        ratioMatches(
          ratio,
          smallSegment,
          largeSegment,
          values
        );

      if (!direction) {
        continue;
      }

      if (
        commonDirection === null
      ) {
        commonDirection =
          direction;
      }

      if (
        direction !==
        commonDirection
      ) {
        return {
          valid: false,
          errorCode:
            "INCONSISTENT_THALES_DIRECTION"
        };
      }

      usedCorrespondences.add(
        key
      );

      foundMatch =
        true;

      break;
    }

    if (!foundMatch) {
      return {
        valid: false,
        errorCode:
          "INVALID_THALES_RATIO"
      };
    }
  }

  return {
    valid: true,
    errorCode: null
  };
}