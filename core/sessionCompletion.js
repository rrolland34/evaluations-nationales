// core/sessionCompletion.js

export function handleSessionCompletion({
  answeredCount,
  selectedQuestionCount,
  presentationMode,
  userAnswers,
  score,
  onStopTimer,
  onStartCorrections,
  onDisplayFinalScore,
  onPrepareFinalScreen,
  onHideTimer
}) {
  if (answeredCount >= selectedQuestionCount) {
    // Arrêter le timer immédiatement
    onStopTimer();

    // En mode diaporama,
    // afficher les corrections une par une
    if (
      presentationMode === "slideshow" &&
      userAnswers.length > 0
    ) {
      onStartCorrections();
      return true;
    }

    onDisplayFinalScore({
      score,
      questionCount: selectedQuestionCount,
      presentationMode
    });

    onPrepareFinalScreen();
    onHideTimer();

    return true;
  }

  return false;
}