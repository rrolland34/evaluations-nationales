// core/correctionProgress.js

export function advanceCorrectionProgress({
  inCorrectionMode,
  correctionStep,
  currentCorrectionIndex,
  correctionCount,
  setCurrentCorrectionIndex,
  onDisplayCorrectionAnswer,
  onDisplayCorrectionQuestion,
  onShowFinalScore
}) {
  if (!inCorrectionMode) {
    return;
  }

  if (correctionStep === "question") {
    onDisplayCorrectionAnswer();
  } else {
    const nextCorrectionIndex =
      currentCorrectionIndex + 1;

    setCurrentCorrectionIndex(
      nextCorrectionIndex
    );

    if (
      nextCorrectionIndex >=
      correctionCount
    ) {
      onShowFinalScore();
    } else {
      onDisplayCorrectionQuestion();
    }
  }
}

export function previousCorrectionProgress({
  inCorrectionMode,
  correctionStep,
  currentCorrectionIndex,
  setCurrentCorrectionIndex,
  onDisplayCorrectionAnswer,
  onDisplayCorrectionQuestion
}) {
  if (!inCorrectionMode) {
    return;
  }

  /*
   * Réponse courante
   * → question courante.
   */
  if (correctionStep === "answer") {
    onDisplayCorrectionQuestion();
    return;
  }

  /*
   * Première question :
   * impossible de remonter davantage.
   */
  if (currentCorrectionIndex <= 0) {
    return;
  }

  /*
   * Question courante
   * → réponse de la question précédente.
   */
  const previousCorrectionIndex =
    currentCorrectionIndex - 1;

  setCurrentCorrectionIndex(
    previousCorrectionIndex
  );

  /*
   * Important :
   * on affiche d'abord la question
   * précédente afin que l'énoncé visible
   * corresponde à la réponse.
   */
  onDisplayCorrectionQuestion();

  onDisplayCorrectionAnswer();
}