// core/keyboardShortcuts.js

export function initializeKeyboardShortcuts({
  isWaitingForCorrection,
  isInCorrectionMode,
  isAwaitingNextQuestion,
  getPresentationMode,
  getCorrectionStep,
  onStartCorrections,
  onAdvanceCorrection,
  onPreviousCorrection,
  onNextQuestion,
  onSkipSlideshowQuestion = () => {},
  onShowCompleteCorrection = () => {},
  clearAwaitingNextQuestion,
  isProgressiveCorrectionContext = () => false
}) {
  document.addEventListener(
    "keydown",
    function(event) {
      if (event.key === "Enter" && event.shiftKey) {
        if (event.defaultPrevented || event.isComposing) return;
        // Empêcher aussi l'activation native d'un bouton par ce raccourci.
        event.preventDefault();
        if (
          event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
          event.target?.isContentEditable ||
          event.target?.closest?.('input, textarea, select, button, a[href], [contenteditable], [role="button"], [role="textbox"]')
        ) return;
        if (
          getPresentationMode() === "slideshow" &&
          !isWaitingForCorrection() &&
          getCorrectionStep() !== "final"
        ) {
          if (isInCorrectionMode()) onShowCompleteCorrection();
          else onSkipSlideshowQuestion();
        }
        return;
      }
      // Protection limitée aux séries optant pour les étapes progressives.
      // Les champs conservent leur gestionnaire local (stopPropagation).
      if (isProgressiveCorrectionContext()) {
        if (event.defaultPrevented || event.isComposing) return;
        if (event.repeat && ["Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          return;
        }
      }
      if (
        event.key === "ArrowUp" &&
        getPresentationMode() ===
          "slideshow" &&
        (
          isInCorrectionMode() ||
          getCorrectionStep() === "final"
        )
      ) {
        event.preventDefault();
        onPreviousCorrection();
        return;
      }

      const isEnter =
        event.key === "Enter";

      const isSlideshowArrowDown =
        event.key === "ArrowDown" &&
        getPresentationMode() ===
          "slideshow";

      if (
        !isEnter &&
        !isSlideshowArrowDown
      ) {
        return;
      }

      if (isWaitingForCorrection()) {
        event.preventDefault();
        onStartCorrections();
        return;
      }

      if (isInCorrectionMode()) {
        event.preventDefault();
        onAdvanceCorrection();
        return;
      }

      if (
        isAwaitingNextQuestion() &&
        getPresentationMode() ===
          "response"
      ) {
        event.preventDefault();
        clearAwaitingNextQuestion();
        onNextQuestion();
        return;
      }
    }
  );
}
