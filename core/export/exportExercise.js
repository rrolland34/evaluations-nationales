// core/export/exportExercise.js

import {
  createEvaluationContent
} from "./exportContent.js";

import {
  renderExportCartesianFigures
} from "./exportCartesianFigures.js";

import {
  exportDocument
} from "./exportDocument.js";

import {
  createEvaluationStatement,
  createEvaluationWithCorrection
} from "./exportEvaluationContent.js";

export function exportExercise({
  exercice,
  userAnswers,

  questions =
    exercice.questions,

  exportType =
    "archive",

  includeCorrection =
    false,

  answerMode =
    "direct",

  questionAnswerModes
}) {
  if (
    exportType ===
    "archive"
  ) {
    const content =
      createEvaluationContent({
        userAnswers
      });

    exportDocument({
      title:
        exercice.title,

      content,

      afterRender({
        archiveWindow
      }) {
        renderExportCartesianFigures({
          archiveWindow,
          userAnswers
        });
      }
    });

    return;
  }

  if (
    exportType ===
    "evaluation"
  ) {
    const evaluationExercise = {
      ...exercice,

      questions
    };

    const content =
      includeCorrection

        ? createEvaluationWithCorrection({
            exercice:
              evaluationExercise,

            answerMode,
            questionAnswerModes
          })

        : createEvaluationStatement({
            exercice:
              evaluationExercise,

            answerMode,
            questionAnswerModes
          });

    exportDocument({
      title:
        exercice.title,

      content
    });

    return;
  }
}
