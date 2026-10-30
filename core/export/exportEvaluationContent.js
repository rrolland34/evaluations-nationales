import { getDisplayAnswer } from "../answerDisplay.js";
// core/export/exportEvaluationContent.js

import {
  formatQCMAnswer
} from "../qcm.js";

import {
  getCorrectQCMAnswer
} from "../answerEvaluation.js";

import {
  formatExportAnswer
} from "./exportAnswerFormatting.js";

// Sans répartition exploitable, conserver le repli historique du générateur.
function getQuestionAnswerMode(answerMode, questionAnswerModes, index) {
  const mode = questionAnswerModes?.[index];
  return answerMode === "mixed" && (mode === "direct" || mode === "qcm")
    ? mode
    : answerMode;
}

export function createEvaluationStatement({
  exercice,
  answerMode = "direct",
  questionAnswerModes
}) {
  const studentIdentity = `
    <div class="evaluation-student-identity">

      <div class="evaluation-identity-item">
        <span>Nom :</span>
        <span class="evaluation-identity-line"></span>
      </div>

      <div class="evaluation-identity-item">
        <span>Prénom :</span>
        <span class="evaluation-identity-line"></span>
      </div>

    </div>
  `;

  const questionsContent =
    exercice.questions
      .map(
      (
        question,
        index
      ) => {
        const questionAnswerMode = getQuestionAnswerMode(answerMode, questionAnswerModes, index);
        const questionText =
          typeof question.question ===
          "string"

            ? question.question

            : (
                question.question?.[
                  questionAnswerMode
                ] ??
                question.question?.direct ??
                question.question?.qcm ??
                question.question?.point ??
                ""
              );

          const qcmContent =
            questionAnswerMode === "qcm" &&
            Array.isArray(
              question.possible_answers
            )
              ? `
                  <div class="archive-qcm">
                    ${question.possible_answers
                      .map(
                        (
                          answer,
                          answerIndex
                        ) => {
                          const displayedQCMAnswer =
                            formatQCMAnswer(
                              answer,
                              question
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

            const answerLines =
              Number.isInteger(
                question.exportAnswerLines
              ) &&
              question.exportAnswerLines > 0
                ? question.exportAnswerLines
                : 1;

            const answerSpace =
              questionAnswerMode === "direct"
                ? `
                    <div class="evaluation-response-space">

                      ${Array.from(
                        {
                          length:
                            answerLines
                        },
                        (
                          _,
                          lineIndex
                        ) => `
                          <div class="evaluation-response-row">

                            ${
                              lineIndex === 0
                                ? "<span>Réponse :</span>"
                                : '<span class="evaluation-response-label-spacer"></span>'
                            }

                            <span class="evaluation-response-line"></span>

                          </div>
                        `
                      ).join("")}

                    </div>
                  `
                : "";

        return `
          <section class="evaluation-question">
            <h2>
              Question ${index + 1}
            </h2>

            <div>
              ${questionText}
            </div>

            ${qcmContent}

            ${answerSpace}
          </section>
        `;
      }
    )
    .join("");

  return `
    ${studentIdentity}
    ${questionsContent}
  `;
}


export function createEvaluationWithCorrection({
  exercice,
  answerMode = "direct",
  questionAnswerModes
}) {
  return exercice.questions
    .map(
      (
        question,
        index
      ) => {
        const questionAnswerMode = getQuestionAnswerMode(answerMode, questionAnswerModes, index);
        const questionText =
          typeof question.question ===
          "string"

            ? question.question

            : (
                question.question?.[
                  questionAnswerMode
                ] ??
                question.question?.direct ??
                question.question?.qcm ??
                question.question?.point ??
                ""
              );

        const qcmContent =
          questionAnswerMode === "qcm" &&
          Array.isArray(
            question.possible_answers
          )
            ? `
                <div class="archive-qcm">
                  ${question.possible_answers
                    .map(
                      (
                        answer,
                        answerIndex
                      ) => {
                        const displayedQCMAnswer =
                          formatQCMAnswer(
                            answer,
                            question
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

        const modeCorrection = question.display_answer && typeof question.display_answer === "object"
          ? getDisplayAnswer(question, questionAnswerMode) : null;
        const scratchCorrection = question.progressiveCorrection?.kind === "scratch" && typeof question.display_answer === "string";
        const rawAnswer =
          modeCorrection ?? (scratchCorrection ? question.display_answer : questionAnswerMode === "qcm"
            ? (
                getCorrectQCMAnswer({
                  question
                }) ??
                ""
              )
            : (
                question.display_answer ??
                question.answers?.[0] ??
                ""
              ));

        const displayedAnswer =
          (modeCorrection !== null || scratchCorrection) ? formatExportAnswer(rawAnswer) : questionAnswerMode === "qcm"
            ? formatQCMAnswer(
                rawAnswer,
                question
              )
            : questionAnswerMode === "point"
              ? ""
              : formatExportAnswer(
                  rawAnswer
                );

        return `
          <section class="evaluation-question">
            <h2>
              Question ${index + 1}
            </h2>

            <div>
              ${questionText}
            </div>

            ${qcmContent}

            <div class="evaluation-answer">
              Réponse :
              ${displayedAnswer}
            </div>
          </section>
        `;
      }
    )
    .join("");
}
