// core/slideshowCompletion.js

export function handleSlideshowCompletion({
  presentationMode,
  answeredCount,
  selectedQuestionCount,
  setAnsweredCount,
  onHideTimer,
  onHidePauseButton,
  onOpenCorrectionOverlay
}) {
  if (
    presentationMode === "slideshow" &&
    answeredCount + 1 >= selectedQuestionCount
  ) {
    setAnsweredCount(
      selectedQuestionCount
    );

    onHideTimer();

    if (
      typeof onHidePauseButton ===
      "function"
    ) {
      onHidePauseButton();
    }

    onOpenCorrectionOverlay();

    return true;
  }

  return false;
}