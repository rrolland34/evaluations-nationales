// core/answerHistory.js

export function storeAnswerForCorrections({
  presentationMode,
  userAnswers,
  currentQuestion,
  userAnswer,
  correctAnswer,
  isCorrect,
  answerMode,
  displayAnswer,
  correctQCMAnswer,
  figureConfig,
  givenPoint
}) {
  if (presentationMode === "slideshow") {

    userAnswers.push({
      question:
        currentQuestion.question,

      ...(currentQuestion.progressiveCorrection !== undefined
        ? { progressiveCorrection: currentQuestion.progressiveCorrection }
        : {}),

      userAnswer:
        userAnswer ||
        "Pas de réponse",

      answerFields:
        Array.isArray(
          currentQuestion.answerFields
        )
          ? currentQuestion.answerFields
          : null,

      correctAnswer,

      displayAnswer:
        displayAnswer ??
        correctAnswer,

      correctQCMAnswer:
        correctQCMAnswer ??
        currentQuestion.possible_answers?.[0] ??
        correctAnswer,

      isCorrect,
      answerMode,
      figureConfig,
      givenPoint,

      qcmNumberFormat:
        currentQuestion.qcmNumberFormat ??
        null,
      
      qcmClass:
        currentQuestion.qcmClass ??
        null,
      ...(currentQuestion.qcmRenderAnswer ? { qcmRenderAnswer: currentQuestion.qcmRenderAnswer } : {}),

      qcmAnswersOrder:
        currentQuestion.qcmAnswersOrder
          ? [
              ...currentQuestion.qcmAnswersOrder
            ]
          : null
    });
  }
}
