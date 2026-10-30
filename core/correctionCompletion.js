// core/correctionCompletion.js

export function completeCorrectionSession({
  score,
  selectedQuestionCount,
  presentationMode,
  setInCorrectionMode,
  setWaitingForCorrectionStart,
  onDisplayFinalScore,
  onPrepareFinalScreen
}) {
  setInCorrectionMode(false);
  setWaitingForCorrectionStart(false);

  const questionElement =
    document.getElementById("question");

  const feedbackElement =
    document.getElementById("feedback");

  const submitButton =
    document.getElementById("submit");

  const nextButton =
    document.getElementById("next");

  if (questionElement) {
    questionElement.innerHTML = "";
  }

  if (feedbackElement) {
    feedbackElement.textContent = "";
  }

  onDisplayFinalScore({
    score,
    questionCount:
      selectedQuestionCount,
    presentationMode
  });

  onPrepareFinalScreen();

  const exportButton =
    document.getElementById(
      "export-evaluation"
    );

  if (exportButton) {
    exportButton.style.display =
      "inline-block";
  }

  /*
   * Dans l'ancienne fonction, ces boutons étaient réactivés
   * après la séquence de correction.
   */
  if (submitButton) {
    submitButton.disabled = false;
  }

  if (nextButton) {
    nextButton.disabled = false;
    nextButton.textContent =
      "Question suivante";
  }
}