// core/modes.js

/**
 * Met à jour l'apparence des boutons du mode de réponse.
 *
 * @param {"direct"|"qcm"|"mixed"} activeMode
 */
export function displayAnswerMode(activeMode) {
  const directButton =
    document.getElementById("mode-direct");

  const qcmButton =
    document.getElementById("mode-qcm");

  const mixedButton =
    document.getElementById("mode-mixed");

  const mixedQCMControl =
    document.getElementById(
      "mixed-qcm-control"
    );

  if (directButton) {
    directButton.style.background =
      activeMode === "direct"
        ? "#4CAF50"
        : "#666";
  }

  if (qcmButton) {
    qcmButton.style.background =
      activeMode === "qcm"
        ? "#4CAF50"
        : "#666";
  }

  if (mixedButton) {
    mixedButton.style.background =
      activeMode === "mixed"
        ? "#4CAF50"
        : "#666";
  }

  if (mixedQCMControl) {
    mixedQCMControl.style.display =
      activeMode === "mixed"
        ? "flex"
        : "none";
  }
}

/**
 * Met à jour l'apparence des boutons du mode de présentation.
 *
 * @param {"response"|"slideshow"} activeMode
 */
export function displayPresentationMode(activeMode) {
  const responseButton =
    document.getElementById("mode-response");

  const slideshowButton =
    document.getElementById("mode-slideshow");

  const pauseButton =
    document.getElementById("pause-timer");

  if (responseButton) {
    responseButton.style.background =
      activeMode === "response"
        ? "#4CAF50"
        : "#666";
  }

  if (slideshowButton) {
    slideshowButton.style.background =
      activeMode === "slideshow"
        ? "#4CAF50"
        : "#666";
  }

  if (pauseButton) {
    pauseButton.style.display =
      activeMode === "slideshow"
        ? "block"
        : "none";
  }
}

/**
 * Active ou désactive tous les boutons de mode.
 *
 * @param {boolean} disabled
 */
export function setModeButtonsDisabled(disabled) {
  const buttonIds = [
    "mode-direct",
    "mode-qcm",
    "mode-mixed",
    "mode-response",
    "mode-slideshow"
  ];

  buttonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);

    if (button) {
      button.disabled = disabled;
    }
  });
}