// core/finalScore.js

import {
  setModeButtonsDisabled
} from "./modes.js";

/**
 * Retourne le commentaire correspondant au score obtenu.
 */
function getScoreComment(score, questionCount) {
  if (score === questionCount) {
    return "Excellent — travail remarquable !";
  }

  const successRate = score / questionCount;

  if (successRate <= 0.4) {
    return "Insuffisant — Il faut revoir les notions de base.";
  }

  if (successRate <= 0.6) {
    return "Pas mal, mais peut mieux faire.";
  }

  if (successRate <= 0.8) {
    return "Très bien !";
  }

  return "Excellent — travail remarquable !";
}

/**
 * Affiche le résultat final d'une session.
 *
 * @param {Object} options
 * @param {number} options.score
 * @param {number} options.questionCount
 * @param {"response"|"slideshow"} options.presentationMode
 */
export function displayFinalScore({
  score,
  questionCount,
  presentationMode
}) {
  const resultElement =
    document.getElementById("result");

  if (!resultElement) {
    return;
  }

  if (
    presentationMode ===
    "slideshow"
  ) {
    resultElement.innerHTML =
      "Fin du diaporama";

    const qcmOptions =
      document.getElementById(
        "qcm-options"
      );

    if (qcmOptions) {
      qcmOptions.style.display =
        "none";
    }

    return;
  }

  const comment =
    getScoreComment(
      score,
      questionCount
    );

  resultElement.innerHTML =
    `<strong>Score :</strong> ${score} / ${questionCount}` +
    `<br><em>${comment}</em>`;
}

/**
 * Replace l'interface dans son état de fin de session.
 */
export function prepareFinalScreen() {
  const submitButton = document.getElementById("submit");
  const nextButton = document.getElementById("next");
  const restartButton = document.getElementById("restart");
  const counterElement =
    document.getElementById("question-counter");

  const timeSlider =
    document.getElementById("time-slider");

  const questionCountSlider =
    document.getElementById("question-count-slider");

  setModeButtonsDisabled(false);

  if (submitButton) {
    submitButton.disabled = true;
  }

  if (nextButton) {
    nextButton.disabled = true;
  }

  if (restartButton) {
    restartButton.style.display = "inline-block";
  }

  if (counterElement) {
    counterElement.style.display = "none";
  }

  if (timeSlider) {
    timeSlider.disabled = false;
  }

  if (questionCountSlider) {
    questionCountSlider.disabled = false;
  }

}