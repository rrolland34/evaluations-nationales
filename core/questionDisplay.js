// core/questionDisplay.js

export function getQuestionText(
  question,
  answerMode
) {
  if (
    typeof question.question ===
    "string"
  ) {
    return question.question;
  }

  return (
    question.question?.[answerMode] ??
    question.question?.direct ??
    question.question?.qcm ??
    ""
  );
}

export function displayQuestionContent({
  question,
  currentQuestionIndex,
  selectedQuestionCount,
  answerMode
}) {
  document.getElementById("question").innerHTML =
    getQuestionText(
      question,
      answerMode
    );

  document.getElementById("feedback").textContent = "";

  // Mettre à jour le numéro de question
  const counterEl =
    document.getElementById("question-counter");

  if (counterEl) {
    counterEl.textContent =
      `Question ${currentQuestionIndex + 1}/${selectedQuestionCount}`;
  }
}