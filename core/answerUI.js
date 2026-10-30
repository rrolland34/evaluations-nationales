// core/answerUI.js

export function updateAnswerUI({
  presentationMode,
  setAwaitingNextQuestion
}) {
  document
    .getElementById("user-answer")
    .disabled = true;

  const nextBtn =
    document.getElementById("next");

  if (nextBtn) {
    nextBtn.style.display = "inline-block";
  }

  if (presentationMode === "response") {
    setAwaitingNextQuestion(true);
  }
}