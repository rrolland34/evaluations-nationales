// core/export/exportAnswerFormatting.js

import {
  formatAnswer
} from "../answerFormatting.js";

export function formatExportAnswer(
  rawAnswer
) {
  const normalizedAnswer =
    String(
      rawAnswer ?? ""
    ).trim();

  const isPower =
    /^\(?-?\d+\)?\^-?\d+$/.test(
      normalizedAnswer
    );

  const isProduct =
    /^(?:\(-?\d+\)|-?\d+)(?:\*(?:\(-?\d+\)|-?\d+))+$/.test(
      normalizedAnswer.replace(
        /\s+/g,
        ""
      )
    );

  const isScientificNotation =
    /^-?\d+(?:\.\d+)?\*10\^-?\d+$/.test(
      normalizedAnswer.replace(
        /\s+/g,
        ""
      )
    );

  const isNumericAnswer =
    normalizedAnswer !== "" &&
    !Number.isNaN(
      Number(
        normalizedAnswer
      )
    );

  const coordinateMatch =
    normalizedAnswer.match(
      /^([A-Za-z])\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)$/
    );

  if (
    coordinateMatch
  ) {
    const pointName =
      coordinateMatch[1];

    const x =
      coordinateMatch[2];

    const y =
      coordinateMatch[3];

    return (
      `\\(\\mathrm{${pointName}}(` +
      `${formatAnswer(x, "math")}` +
      `\\,;\\,` +
      `${formatAnswer(y, "math")}` +
      `)\\)`
    );
  }

  if (
    isPower ||
    isProduct ||
    isScientificNotation ||
    isNumericAnswer
  ) {
    return (
      `\\(${formatAnswer(
        normalizedAnswer,
        "math"
      )}\\)`
    );
  }

  return normalizedAnswer;
}