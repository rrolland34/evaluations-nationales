import test from "node:test";
import assert from "node:assert/strict";
import { getExportStyles } from "../core/export/exportStyles.js";
import { getExportFigureStyles } from "../core/export/exportFigureStyles.js";
import { createExportWindow } from "../core/export/exportWindow.js";
import { createEvaluationStatement, createEvaluationWithCorrection } from "../core/export/exportEvaluationContent.js";
import { createEvaluationContent } from "../core/export/exportContent.js";
import series from "../exercices/remediation_evaluations_nationales_6e_serie_5.js";

test("les corrections exportées héritent du rouge, conservé à l'impression", () => {
  const rule = getExportStyles().match(/\.evaluation-answer\s*\{([^}]+)\}/)[1];
  assert.match(rule, /color:\s*red\s*;/);
  assert.match(rule, /-webkit-print-color-adjust:\s*exact\s*;/);
  assert.match(rule, /(?<!-)print-color-adjust:\s*exact\s*;/);
  // La couleur ne doit pas être forcée sur tous les descendants ni via fill/stroke.
  assert.doesNotMatch(getExportStyles(), /\.evaluation-answer\s+\*|(?:fill|stroke):\s*red/);
  assert.match(getExportStyles(), /\.evaluation-answer svg:not\(mjx-container svg\)\s*\{\s*color:\s*#111;\s*\}/);
  assert.ok(getExportStyles().includes(getExportFigureStyles()));
});

for (const answerMode of ["direct", "qcm"]) {
  test(`la fenêtre commune applique les styles sans modifier les contenus de remédiation : ${answerMode}`, () => {
    const before = JSON.stringify(series);
    const corrected = createEvaluationWithCorrection({ exercice: series, answerMode });
    const statement = createEvaluationStatement({ exercice: series, answerMode });
    const archive = createEvaluationContent({ userAnswers: series.questions.map(q => ({
      question: q.question, displayAnswer: q.display_answer,
      correctAnswer: q.answers[0], answerMode
    })) });
    assert.doesNotMatch(statement, /class="evaluation-answer"/);
    for (const content of [corrected, statement, archive]) {
      const archiveWindow = { document: { documentElement: {} } };
      globalThis.window = { open: () => archiveWindow };
      try {
        assert.equal(createExportWindow({ title: series.title, currentDate: "22/10/2026", evaluationContent: content }), archiveWindow);
        const html = archiveWindow.document.documentElement.innerHTML;
        assert.ok(html.includes(content));
        assert.ok(html.includes(getExportStyles()));
        assert.equal((html.match(/class="evaluation-question"/g) ?? []).length, series.questions.length);
      } finally { delete globalThis.window; }
    }
    assert.equal(JSON.stringify(series), before);
  });
}


test("export : corrections par mode, repli et archive de la question 5", async () => {
  const { default: series6 } = await import("../exercices/remediation_evaluations_nationales_6e_serie_6.js");
  const { getDisplayAnswer } = await import("../core/answerDisplay.js");
  for (const mode of ["direct", "qcm"]) {
    const q = series6.generateQuestions()[4];
    const expected = getDisplayAnswer(q, mode);
    const subject = createEvaluationWithCorrection({ exercice: { questions: [q] }, answerMode: mode });
    const archive = createEvaluationContent({ userAnswers: [{ question: q.question, displayAnswer: expected, correctAnswer: q.answers[0], answerMode: mode }] });
    for (const html of [subject, archive]) {
      assert.ok(html.includes(expected));
      assert.doesNotMatch(html, /\[object Object\]/);
    }
    assert.equal((subject.match(/<svg/g) ?? []).length, 1);
  }
  const q = { question: "Test", answers: ["1"], display_answer: { direct: "Correction directe", qcm: "Correction QCM" } };
  for (const [mode, expected] of [["direct", "Correction directe"], ["qcm", "Correction QCM"], ["mixed", "Correction directe"]]) {
    const html = createEvaluationWithCorrection({ exercice: { questions: [q] }, answerMode: mode });
    assert.ok(html.includes(expected));
    assert.doesNotMatch(html, /\[object Object\]/);
  }
});
