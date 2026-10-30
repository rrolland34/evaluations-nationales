// core/corrections.js

import { formatAnswer } from "./answerFormatting.js";

import { displayQCMOptions } from "./qcm.js";

import {
  displayCartesianPoint,
  displayCartesianPoints,
  highlightCartesianQCMPoints
} from "./cartesianPointSelection.js";

import {
  getQuestionText
} from "./questionDisplay.js";

function renderScratchBlocks() {
  if (!window.scratchblocks) {
    return;
  }

  scratchblocks.renderMatching(
    "pre.blocks",
    {
      style: "scratch3",
      languages: ["fr"]
    }
  );
}

/**
 * Affiche la question correspondant à une étape de correction.
 *
 * @param {Object} options
 * @param {Object} options.correction
 * @param {number} options.index
 * @param {number} options.total
 */
export function displayCorrectionQuestion({
  correction,
  index,
  total
}) {
  if (!correction) {
    return;
  }

  const questionElement =
    document.getElementById("question");

  const feedbackElement =
    document.getElementById("feedback");

  const resultElement =
    document.getElementById("result");

  const qcmButtonsContainer =
    document.getElementById("qcm-buttons");

  const counterElement =
    document.getElementById("question-counter");

  if (questionElement) {

    const correctionQuestion =
      correction.question;

    if (
      typeof correctionQuestion ===
      "string"
    ) {
      questionElement.innerHTML =
        correctionQuestion;

    } else if (
      correctionQuestion &&
      typeof correctionQuestion ===
        "object"
    ) {
      questionElement.innerHTML =
        correctionQuestion[
          correction.answerMode
        ] ??
        correctionQuestion.direct ??
        correctionQuestion.qcm ??
        correctionQuestion.point ??
        "";

    } else {
      questionElement.innerHTML = "";
    }

    if (
      window.scratchblocks &&
      questionElement.querySelector(
        "pre.blocks"
      )
    ) {
      scratchblocks.renderMatching(
        "#question pre.blocks",
        {
          style: "scratch3",
          languages: ["fr"]
        }
      );
    }
  }

  if (feedbackElement) {
    feedbackElement.textContent = "";
  }

  if (resultElement) {
    resultElement.innerHTML = "";
  }

  if (qcmButtonsContainer) {
    qcmButtonsContainer.innerHTML = "";
  }

  if (
    correction.givenPoint &&
    correction.figureConfig
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      displayCartesianPoint({
        svg,

        point:
          correction.givenPoint,

        width:
          correction.figureConfig.width,

        height:
          correction.figureConfig.height,

        range:
          correction.figureConfig.range,

        padding:
          correction.figureConfig.padding,

        name:
          correction.givenPoint.name
      });
    }
  }

  if (
    correction.answerMode === "qcm" &&
    Array.isArray(
      correction.qcmPoints
    )
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (
      svg &&
      correction.figureConfig
    ) {
      displayCartesianPoints({
        svg,

        points:
          correction.qcmPoints,

        width:
          correction.figureConfig.width,

        height:
          correction.figureConfig.height,

        range:
          correction.figureConfig.range,

        padding:
          correction.figureConfig.padding
      });
    }
  }

  if (
    correction.answerMode === "qcm" &&
    !Array.isArray(
      correction.qcmPoints
    ) &&
    Array.isArray(
      correction.qcmAnswersOrder
    )
  ) {
    displayQCMOptions(
      {
        possible_answers:
          correction.qcmAnswersOrder,

        qcmAnswersOrder:
          correction.qcmAnswersOrder,

        qcmNumberFormat:
          correction.qcmNumberFormat,

        qcmClass:
          correction.qcmClass,
        qcmRenderAnswer: correction.qcmRenderAnswer
      },
      true
    );
  }

  if (counterElement) {
    counterElement.textContent =
      `Correction ${index + 1}/${total}`;
  }

  typesetMath();
}

/**
 * Affiche la réponse correcte.
 *
 * @param {Object} correction
 */
export function displayCorrectionAnswer(correction) {
  if (!correction) {
    return;
  }

  if (
    correction.answerMode === "point"
  ) {
    const feedbackElement =
      document.getElementById(
        "feedback"
      );

    if (feedbackElement) {
      feedbackElement.textContent = "";
    }

    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (
      svg &&
      correction.figureConfig &&
      correction.correctAnswer
    ) {
      displayCartesianPoint({
        svg,

        point:
          correction.correctAnswer,

        width:
          correction.figureConfig.width,

        height:
          correction.figureConfig.height,

        range:
          correction.figureConfig.range,

        padding:
          correction.figureConfig.padding,

        name:
          correction.correctAnswer.name,

        color:
          "red"
      });
    }

    typesetMath();
    return;
  }

  if (
    correction.answerMode === "qcm" &&
    Array.isArray(
      correction.qcmPoints
    )
  ) {
    const feedbackElement =
      document.getElementById(
        "feedback"
      );

    if (feedbackElement) {
      feedbackElement.textContent = "";
    }

    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (
      svg &&
      correction.correctAnswer
    ) {
      highlightCartesianQCMPoints({
        svg,

        selectedPoint:
          null,

        correctPoint:
          correction.correctAnswer
      });
    }

    typesetMath();
    return;
  }

  const feedbackElement =
    document.getElementById("feedback");

  if (correction.answerMode === "qcm") {
    if (feedbackElement) {
      feedbackElement.textContent = "";
    }

    const buttons =
      document.querySelectorAll(
        "#qcm-buttons button"
      );

    const correctQCMAnswer =
      correction.correctQCMAnswer ??
      correction.correctAnswer;

    const correctAnswerIndex =
      correction.qcmAnswersOrder.findIndex(
        (answer) =>
          String(answer) ===
          String(correctQCMAnswer)
      );

    const correctButton =
      buttons[correctAnswerIndex];

    if (correctButton) {
      correctButton.style.background =
        "#4CAF50";

      correctButton.style.color =
        "white";

      correctButton.style.borderColor =
        "#45a049";

      correctButton.style.opacity = "1";
    }

    typesetMath();
    return;
  }

  if (!feedbackElement) {
    return;
  }

  const rawCorrectAnswer =
    correction.displayAnswer ??
    correction.correctAnswer;

  const normalizedCorrectAnswer =
    String(
      rawCorrectAnswer
    ).trim();

  const isPower =
    /^\(?-?\d+\)?\^-?\d+$/.test(
      normalizedCorrectAnswer
    );

  const isProduct =
    /^(?:\(-?\d+\)|-?\d+)(?:\*(?:\(-?\d+\)|-?\d+))+$/.test(
      normalizedCorrectAnswer.replace(
        /\s+/g,
        ""
      )
    );

  const isScientificNotation =
    /^-?\d+(?:\.\d+)?\*10\^-?\d+$/.test(
      normalizedCorrectAnswer.replace(
        /\s+/g,
        ""
      )
    );

  const isNumericAnswer =
    normalizedCorrectAnswer !== "" &&
    !Number.isNaN(
      Number(
        normalizedCorrectAnswer
      )
    );

  const coordinateMatch =
    normalizedCorrectAnswer.match(
      /^([A-Za-z])\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)$/
    );

  const isCoordinates =
    coordinateMatch !== null;

  let displayedAnswer;

  if (isCoordinates) {
    const pointName =
      coordinateMatch[1];

    const x =
      coordinateMatch[2];

    const y =
      coordinateMatch[3];

    displayedAnswer =
      `\\(\\mathrm{${pointName}}(` +
      `${formatAnswer(x, "math")}` +
      `\\,;\\,` +
      `${formatAnswer(y, "math")}` +
      `)\\)`;
  } else if (
    isPower ||
    isProduct ||
    isScientificNotation ||
    isNumericAnswer
  ) {
    displayedAnswer =
      `\\(${formatAnswer(
        normalizedCorrectAnswer,
        "math"
      )}\\)`;
  } else {
    displayedAnswer =
      correction.displayAnswer ??
      formatAnswer(
        correction.correctAnswer
      );
  }

  feedbackElement.innerHTML =
    `Solution : ${displayedAnswer}`;

  feedbackElement.style.color =
    "red";

  typesetMath();
}

/**
 * Demande à MathJax d'actualiser les formules.
 */
function typesetMath() {
  if (!window.MathJax) {
    return;
  }

  if (typeof MathJax.typesetPromise === "function") {
    MathJax.typesetPromise().catch((error) => {
      console.error(
        "Erreur pendant le rendu MathJax :",
        error
      );
    });

    return;
  }

  if (typeof MathJax.typeset === "function") {
    MathJax.typeset();
  }
}
