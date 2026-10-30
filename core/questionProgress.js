// core/questionProgress.js

export function advanceQuestionProgress({
  currentQuestionIndex,
  questionCount,
  presentationMode,
  answeredCount,
  setCurrentQuestionIndex,
  setAnsweredCount
}) {
  setCurrentQuestionIndex(
    (currentQuestionIndex + 1) % questionCount
  );

  if (presentationMode === "slideshow") {
    setAnsweredCount(answeredCount + 1);
  }
}