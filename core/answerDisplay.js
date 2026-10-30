// core/answerDisplay.js

export function getDisplayAnswer(
  question,
  answerMode
) {
  const displayAnswer =
    question.display_answer;

  if (
    typeof displayAnswer === "string"
  ) {
    return displayAnswer;
  }

  if (
    displayAnswer &&
    typeof displayAnswer === "object"
  ) {
    return (
      displayAnswer[answerMode] ??
      displayAnswer.direct ??
      displayAnswer.qcm ??
      null
    );
  }

  return null;
}