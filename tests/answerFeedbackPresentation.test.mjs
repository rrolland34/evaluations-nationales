import test from "node:test";
import assert from "node:assert/strict";
import { displayAnswerFeedback } from "../core/answerFeedback.js";
import { getDisplayAnswer } from "../core/answerDisplay.js";

function feedbackDOM() {
  const feedback = { innerHTML: "", textContent: "", style: {} };
  globalThis.document = { querySelectorAll: () => [], getElementById: id => id === "feedback" ? feedback : { querySelectorAll: () => [] } };
  return feedback;
}

test("validation : six séries, réponses correctes, incorrectes et vides, Direct et QCM", async () => {
  try {
    for (let i = 1; i <= 6; i++) {
      const { default: series } = await import(`../exercices/remediation_evaluations_nationales_6e_serie_${i}.js`);
      for (const question of series.generateQuestions(() => 0)) for (const answerMode of ["direct", "qcm"]) {
        const displayAnswer = getDisplayAnswer(question, answerMode);
        for (const result of ["correct", "incorrect", "empty"]) {
          const feedback = feedbackDOM();
          displayAnswerFeedback({ isCorrect: result === "correct", isNotAnswered: result === "empty", answerMode,
            correctAnswer: question.answers[0], displayAnswer, userAnswer: "invalide" });
          if (result === "correct") {
            assert.equal(feedback.textContent, "Bonne réponse !");
            assert.equal(feedback.style.color, "green");
          } else {
            assert.equal(feedback.style.color, "red");
            if (answerMode === "direct") {
              assert.match(feedback.innerHTML, /answer-feedback-message/);
              assert.match(feedback.innerHTML, /Réponse attendue :/);
              assert.ok(feedback.innerHTML.includes(displayAnswer), "HTML et formules de la correction préservés");
              assert.doesNotMatch(feedback.innerHTML, /\(Réponse :|<\/div>\s*\)/);
            } else assert.equal(feedback.textContent, result === "empty" ? "Réponse non saisie." : "Réponse incorrecte !");
          }
        }
      }
    }
  } finally { delete globalThis.document; }
});

test("validation : fraction 8/100, unités, formatage et masquage de la réponse attendue", () => {
  try {
    for (const displayAnswer of [String.raw`<div>Le nombre égal à la fraction \(\frac{8}{100}\) est : \(0{,}08\).</div>`, String.raw`\(12~\mathrm{cm}^2\)`, "7 h 44 min"]) {
      const feedback = feedbackDOM();
      displayAnswerFeedback({ isCorrect: false, answerMode: "direct", displayAnswer, correctAnswer: "0.08", incorrectFeedback: "À revoir." });
      assert.ok(feedback.innerHTML.includes(displayAnswer));
      assert.ok(feedback.innerHTML.includes("À revoir."));
      assert.ok(feedback.innerHTML.endsWith(`${displayAnswer}</div>`));
    }
    const feedback = feedbackDOM();
    displayAnswerFeedback({ isCorrect: false, answerMode: "direct", correctAnswer: "0.08", showCorrectAnswer: false });
    assert.doesNotMatch(feedback.innerHTML, /Réponse attendue/);
  } finally { delete globalThis.document; }
});
