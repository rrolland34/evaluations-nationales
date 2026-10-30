// core/modeControls.js

export function initializeModeControls({
  initialAnswerMode,
  initialPresentationMode,
  onAnswerModeChange,
  onPresentationModeChange
}) {
  onAnswerModeChange(initialAnswerMode, false);
  onPresentationModeChange(initialPresentationMode, false);

  // Liaison des boutons de mode (Type : Réponse/QCM)
  const modeDirectBtn =
    document.getElementById("mode-direct");

  const modeQcmBtn =
    document.getElementById("mode-qcm");

  const modeMixedBtn =
  document.getElementById("mode-mixed");

  if (modeDirectBtn) {
    modeDirectBtn.addEventListener("click", function() {
      onAnswerModeChange("direct", true);
    });
  }

  if (modeQcmBtn) {
    modeQcmBtn.addEventListener("click", function() {
      onAnswerModeChange("qcm", true);
    });
  }

  if (modeMixedBtn) {
    modeMixedBtn.addEventListener("click", function() {
      onAnswerModeChange("mixed", true);
    });
  }

  // Liaison des boutons de présentation
  // (Mode : Réponse/Diaporama)
  const modeResponseBtn =
    document.getElementById("mode-response");

  const modeSlideshowBtn =
    document.getElementById("mode-slideshow");

  if (modeResponseBtn) {
    modeResponseBtn.addEventListener("click", function() {
      onPresentationModeChange("response", true);
    });
  }

  if (modeSlideshowBtn) {
    modeSlideshowBtn.addEventListener("click", function() {
      onPresentationModeChange("slideshow", true);
    });
  }
}