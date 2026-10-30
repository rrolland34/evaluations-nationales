import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createEvaluationStatement, createEvaluationWithCorrection } from "../core/export/exportEvaluationContent.js";
import { createEvaluationContent } from "../core/export/exportContent.js";
import { formatQCMAnswer } from "../core/qcm.js";

const generators = [createEvaluationStatement, createEvaluationWithCorrection];
const sections = html => [...html.matchAll(/<section class="evaluation-question">([\s\S]*?)<\/section>/g)].map(m => m[1]);
const count = (html, className) => (html.match(new RegExp(`class="${className}"`, "g")) ?? []).length;
const normalizeHeading = html => html.replace(/Question \d+/, "Question N");
const distributions = [
  Array(5).fill("direct"),
  ["qcm", "direct", "qcm", "direct", "direct"],
  ["direct", "qcm", "direct", "direct", "qcm"],
  Array(5).fill("qcm")
];

for (let seriesNumber = 1; seriesNumber <= 6; seriesNumber++) {
  const { default: series } = await import(`../exercices/remediation_evaluations_nationales_6e_serie_${seriesNumber}.js`);
  for (const modes of distributions) {
    test(`export Mixte série ${seriesNumber} : ${modes.join("/")}`, () => {
      let seed = 42;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
      const questions = series.generateQuestions(random).map((q, i) => ({ ...q, ...(i === 1 ? { exportAnswerLines: 3 } : {}) }));
      const before = JSON.stringify(questions);
      for (const generate of generators) {
        const html = generate({ exercice: { questions }, answerMode: "mixed", questionAnswerModes: modes });
        const parts = sections(html);
        assert.equal(parts.length, 5);
        assert.doesNotMatch(html, /\[object Object\]|undefined|NaN/);
        for (let i = 0; i < 5; i++) {
          const q = questions[i], mode = modes[i];
          // Chaque section doit être identique à l'export historique du mode réellement joué.
          const expected = sections(generate({ exercice: { questions: [q] }, answerMode: mode }))[0];
          assert.equal(normalizeHeading(parts[i]), normalizeHeading(expected));
          assert.ok(parts[i].includes(q.question[mode] ?? q.question));
          assert.equal(count(parts[i], "archive-qcm"), mode === "qcm" ? 1 : 0);
          assert.equal(count(parts[i], "evaluation-response-row"), generate === createEvaluationStatement && mode === "direct" ? (q.exportAnswerLines ?? 1) : 0);
          if (mode === "qcm") {
            let previous = -1;
            for (const option of q.possible_answers) {
              const offset = parts[i].indexOf(formatQCMAnswer(option, q), previous + 1);
              assert.ok(offset > previous, "ordre natif des propositions du sujet");
              previous = offset;
            }
          }
        }
      }
      assert.equal(JSON.stringify(questions), before);
    });
  }
}

test("série 6 Q5 : figure, volume et correction de la variante jouée restent associés", async () => {
  const { default: series } = await import("../exercices/remediation_evaluations_nationales_6e_serie_6.js");
  const questions = series.generateQuestions(() => 0);
  const q = questions[4];
  assert.match(q.question.direct, /data-cube-count="16"/);
  assert.match(q.question.qcm, /data-cube-count="24"/);
  for (const mode of ["direct", "qcm"]) {
    const modes = ["direct", "qcm", "direct", "direct", mode];
    for (const generate of generators) {
      const last = sections(generate({ exercice: { questions }, answerMode: "mixed", questionAnswerModes: modes }))[4];
      assert.match(last, new RegExp(`data-cube-count="${mode === "direct" ? 16 : 24}"`));
      assert.doesNotMatch(last, new RegExp(`data-cube-count="${mode === "direct" ? 24 : 16}"`));
      if (generate === createEvaluationWithCorrection) assert.ok(last.includes(q.display_answer[mode]));
    }
  }
});

test("repli Mixte historique et métadonnées ignorées en Direct/QCM", () => {
  const q = { question: { direct: "Énoncé direct", qcm: "Énoncé QCM" }, answers: ["1"], possible_answers: ["1", "2"], display_answer: { direct: "Correction directe", qcm: "Correction QCM" } };
  for (const generate of generators) {
    const options = { exercice: { questions: [q] }, answerMode: "mixed" };
    const legacy = generate(options);
    assert.ok(legacy.includes("Énoncé direct"));
    assert.equal(count(legacy, "archive-qcm"), 0);
    assert.equal(count(legacy, "evaluation-response-row"), 0);
    if (generate === createEvaluationWithCorrection) assert.ok(legacy.includes("Correction directe"));
    for (const questionAnswerModes of [[], [undefined], ["mixed"], ["invalide"]]) {
      assert.equal(generate({ ...options, questionAnswerModes }), legacy);
    }
    for (const answerMode of ["direct", "qcm"]) {
      assert.equal(generate({ ...options, answerMode, questionAnswerModes: [answerMode === "direct" ? "qcm" : "direct"] }), generate({ ...options, answerMode }));
    }
  }
});

test("exportExercise transmet la répartition aux sujets et ne change pas l'archive", () => {
  const source = readFileSync(new URL("../core/export/exportExercise.js", import.meta.url), "utf8")
    .replace(/^import\s[\s\S]*?from\s*["'][^"']+["'];/gm, "").replace(/^export /gm, "");
  let document;
  const context = vm.createContext({ createEvaluationStatement, createEvaluationWithCorrection, createEvaluationContent,
    exportDocument: value => { document = value; }, renderExportCartesianFigures() {} });
  vm.runInContext(source, context);
  const q = { question: { direct: "Direct", qcm: "QCM" }, answers: ["1"], possible_answers: ["1", "2"] };
  const options = { exercice: { title: "Test", questions: [q] }, answerMode: "mixed", questionAnswerModes: ["qcm"],
    userAnswers: [{ question: q.question, answerMode: "qcm", displayAnswer: "1", qcmAnswersOrder: ["2", "1"] }] };
  for (const includeCorrection of [false, true]) {
    context.exportExercise({ ...options, exportType: "evaluation", includeCorrection });
    assert.equal(document.content, generators[Number(includeCorrection)](options));
    assert.equal(count(document.content, "archive-qcm"), 1);
  }
  context.exportExercise({ ...options, exportType: "archive" });
  assert.equal(document.content, createEvaluationContent(options));
  assert.ok(document.content.indexOf("2") < document.content.lastIndexOf("1"));
});
