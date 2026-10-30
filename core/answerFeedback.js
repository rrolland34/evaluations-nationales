// core/answerFeedback.js

import {
  highlightCorrectQCMButton,
  highlightIncorrectQCMButton
} from "./qcm.js";

import { formatAnswer } from "./answerFormatting.js";

export function displayAnswerFeedback({
  isCorrect,
  isNotAnswered,
  correctAnswer,
  displayAnswer,
  incorrectFeedback,
  answerMode,
  userAnswer,
  showCorrectAnswer = true,
  correctQCMAnswer = null,
}) {
  const feedbackElement =
    document.getElementById("feedback");

  const rawCorrectAnswer =
    displayAnswer ??
    correctAnswer;

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

  const isNegativeDecimal =
    /^-\d+(?:\.\d+)?$/.test(
      normalizedCorrectAnswer
    );

  const isNumericAnswer =
    normalizedCorrectAnswer !== "" &&
    !Number.isNaN(
      Number(
        normalizedCorrectAnswer
      )
    );

  const formattedCorrectAnswer =
    isPower ||
    isProduct ||
    isScientificNotation ||
    isNegativeDecimal

      ? `\\(${formatAnswer(
          normalizedCorrectAnswer,
          "math"
        )}\\)`

      : isNumericAnswer

        ? formatAnswer(
            normalizedCorrectAnswer
          )

        : (
            displayAnswer ??
            formatAnswer(
              correctAnswer
            )
          );

  if (isCorrect) {
    if (answerMode === "qcm") {
      highlightCorrectQCMButton(
        correctQCMAnswer ??
        correctAnswer
      );
    }

    feedbackElement.textContent =
      "Bonne réponse !";

    feedbackElement.style.color =
      "green";

    return;
  }

  if (isNotAnswered) {
    if (
      answerMode === "qcm" ||
      answerMode === "point"
    ) {
      feedbackElement.textContent =
        "Réponse non saisie.";
    } else {
      feedbackElement.innerHTML =
        `<div class="answer-feedback-message">Réponse non saisie.</div>` +
        `<div class="answer-feedback-expected">Réponse attendue : ${formattedCorrectAnswer}</div>`;
    }
  } else {
    if (answerMode === "qcm") {
      feedbackElement.textContent =
        "Réponse incorrecte !";

      highlightIncorrectQCMButton(
        userAnswer
      );
    } else {
      feedbackElement.innerHTML =
        '<div class="answer-feedback-message">Réponse incorrecte !</div>';

      if (incorrectFeedback) {
        feedbackElement.innerHTML +=
          ` ${incorrectFeedback}`;
      }

      if (showCorrectAnswer) {
        feedbackElement.innerHTML +=
          `<div class="answer-feedback-expected">Réponse attendue : ${formattedCorrectAnswer}</div>`;
      }
    }
  }

  if (answerMode === "qcm") {
    highlightCorrectQCMButton(
      correctQCMAnswer ??
      correctAnswer
    );
  }

  feedbackElement.style.color = "red";
}
