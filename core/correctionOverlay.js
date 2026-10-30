// core/correctionOverlay.js

/**
 * Affiche l'overlay annonçant le début des corrections.
 */
export function showCorrectionOverlay() {
  const overlay =
    document.getElementById(
      "correction-overlay"
    );

  const qcmOptions =
    document.getElementById(
      "qcm-options"
    );

  if (!overlay) {
    return;
  }

  if (qcmOptions) {
    qcmOptions.style.display =
      "none";
  }

  overlay.style.display =
    "flex";

  overlay.classList.add(
    "visible"
  );
}

/**
 * Masque l'overlay des corrections.
 */
export function hideCorrectionOverlay() {
  const overlay =
    document.getElementById("correction-overlay");

  if (!overlay) {
    return;
  }

  overlay.classList.remove("visible");
  overlay.style.display = "none";
}