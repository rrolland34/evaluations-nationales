// core/correctionSession.js

import {
  setModeButtonsDisabled
} from "./modes.js";

export function startCorrectionSession({
  correctionCount,
  setCurrentCorrectionIndex,
  setInCorrectionMode,
  setCorrectionStep,
  onHideTimer,
  onCloseCorrectionOverlay,
  onDisplayCorrectionQuestion
}) {
  setCurrentCorrectionIndex(0);
  setInCorrectionMode(true);
  setCorrectionStep("question");

  onHideTimer();

  const controlsElement =
    document.querySelector(".controls");

  if (controlsElement) {
    controlsElement.style.display = "flex";
  }

  const counterEl =
    document.getElementById(
      "question-counter"
    );

  if (counterEl) {
    counterEl.style.display = "block";
    counterEl.textContent =
      `Correction 1/${correctionCount}`;
  }

  onCloseCorrectionOverlay();
  onDisplayCorrectionQuestion();
}

export function restoreCorrectionScreen({
  correctionIndex,
  correctionCount
}) {
  const controlsElement =
    document.querySelector(".controls");

  const counterElement =
    document.getElementById(
      "question-counter"
    );

  const restartButton =
    document.getElementById(
      "restart"
    );

  const timeSlider =
    document.getElementById(
      "time-slider"
    );

  const questionCountSlider =
    document.getElementById(
      "question-count-slider"
    );

  /*
   * On revient dans une correction :
   * les réglages de session doivent
   * donc être de nouveau verrouillés.
   */
  setModeButtonsDisabled(true);

  if (controlsElement) {
    controlsElement.style.display =
      "flex";
  }

  if (counterElement) {
    counterElement.style.display =
      "block";

    counterElement.textContent =
      `Correction ${correctionIndex + 1}/${correctionCount}`;
  }

  if (restartButton) {
    restartButton.style.display =
      "none";
  }

  if (timeSlider) {
    timeSlider.disabled = true;
  }

  if (questionCountSlider) {
    questionCountSlider.disabled =
      true;
  }
}