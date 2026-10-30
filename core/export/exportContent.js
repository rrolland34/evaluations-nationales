// core/export/exportContent.js

import {
  formatExportAnswer
} from "./exportAnswerFormatting.js";

import {
  formatQCMAnswer
} from "../qcm.js";

export function createEvaluationContent({
  userAnswers
}) {
  return userAnswers
    .map(
      (
        correction,
        index
      ) => {
        const questionText =
          typeof correction.question ===
          "string"

            ? correction.question

            : (
                correction.question?.[
                  correction.answerMode
                ] ??
                correction.question?.direct ??
                correction.question?.qcm ??
                correction.question?.point ??
                ""
              );

        const rawAnswer =
          correction.displayAnswer ??
          correction.correctAnswer ??
          "";

        const answerText =
          correction.answerMode === "point" ||
          (
            correction.answerMode === "qcm" &&
            Array.isArray(
              correction.qcmPoints
            )
          )
            ? ""
            : formatExportAnswer(
                rawAnswer
              );

        const qcmAnswers =
          correction.answerMode === "qcm" &&
          Array.isArray(
            correction.qcmAnswersOrder
          )

            ? correction.qcmAnswersOrder

            : null;

        const qcmContent =
          qcmAnswers
            ? `
                <div class="archive-qcm">
                  ${qcmAnswers
                    .map(
                      (
                        answer,
                        answerIndex
                      ) => {
                        const displayedQCMAnswer =
                          formatQCMAnswer(
                            answer,
                            correction
                          );

                        return `
                          <div>
                            ${String.fromCharCode(
                              65 + answerIndex
                            )}.
                            ${displayedQCMAnswer}
                          </div>
                        `;
                      }
                    )
                    .join("")}
                </div>
              `
            : "";

        return `
          <section class="evaluation-question">
            <h2>
              Question ${index + 1}
            </h2>

            <div
              class="archive-question-content"
              data-question-index="${index}"
            >
              ${questionText}
            </div>

            ${qcmContent}

            ${answerText
              ? `
                  <p class="evaluation-answer">
                    Réponse :
                    ${answerText}
                  </p>
                `
              : ""
            }
          </section>
        `;
      }
    )
    .join("");
}