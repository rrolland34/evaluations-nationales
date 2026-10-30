import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { setAnswerControlsLocked } from "../core/answerLock.js";
import { evaluateCurrentAnswer } from "../core/answerEvaluation.js";
import { checkAnswerSmart } from "../core/correcteur.js";
import { configureQuestionControls } from "../core/questionControls.js";
import { updateAnswerUI } from "../core/answerUI.js";
import { storeAnswerForCorrections } from "../core/answerHistory.js";
import { handleSessionCompletion } from "../core/sessionCompletion.js";
import { handleSlideshowCompletion } from "../core/slideshowCompletion.js";
import { advanceQuestionProgress } from "../core/questionProgress.js";
import { initializeAnswerInput } from "../core/inputEvents.js";
import { initializeKeyboardShortcuts } from "../core/keyboardShortcuts.js";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const strip = source => source.replace(/^import\s[\s\S]*?from\s*["'][^"']+["'];/gm, "").replace(/^export /gm, "");

function dom() {
  const ids = new Map(), keys = [];
  const matches = (el, selector) => selector.split(",").some(s => {
    s = s.trim();
    return s.startsWith(".") ? el.className.split(" ").includes(s.slice(1)) : el.tagName === s.toUpperCase();
  });
  const document = {
    activeElement: null,
    createElement(tag = "div") {
      return {
        tagName: tag.toUpperCase(), style: {}, dataset: {}, className: "", value: "", disabled: false,
        children: [], handlers: {}, classList: { add() {}, remove() {} },
        addEventListener(name, fn, capture = false) { (this.handlers[name] ??= []).push({ fn, capture }); },
        matches(selector) { return matches(this, selector); },
        contains(other) { return this === other || this.children.some(c => c.contains(other)); },
        querySelectorAll(selector) { return this.children.flatMap(c => [...(matches(c, selector) ? [c] : []), ...c.querySelectorAll(selector)]); },
        querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; },
        appendChild(child) { child.parent = this; this.children.push(child); },
        focus() { document.activeElement = this; }, blur() { document.activeElement = null; },
        set innerHTML(html) {
          this.html = html; this.children = [];
          if (this.id === "multi-answer-container") for (const match of html.matchAll(/<(input|select)\s[^>]*data-index="(\d+)"[^>]*>/g)) {
            const child = document.createElement(match[1]); child.className = "multi-answer-input";
            child.dataset.index = match[2]; this.appendChild(child);
          }
        },
        get innerHTML() { return this.html ?? ""; },
        fire(type, props = {}) {
          const event = { type, target: this, key: "Enter", ...props,
            preventDefault() { this.defaultPrevented = true; },
            stopPropagation() { this.stopped = true; },
            stopImmediatePropagation() { this.immediate = this.stopped = true; }
          };
          const ancestors = []; for (let node = this; node; node = node.parent) ancestors.unshift(node);
          for (const node of ancestors) {
            for (const h of node.handlers[type] ?? []) if (h.capture) h.fn(event);
            if (event.stopped) return event;
          }
          if (!(type === "click" && this.disabled)) for (const h of this.handlers[type] ?? []) if (!h.capture) h.fn(event);
          if (type === "keydown" && !event.stopped) keys.forEach(fn => fn(event));
          return event;
        },
        click() { if (!this.disabled) this.fire("click"); }
      };
    },
    getElementById(id) {
      if (!ids.has(id)) { const el = this.createElement(id === "user-answer" ? "input" : ["submit", "next"].includes(id) ? "button" : "div"); el.id = id; ids.set(id, el); }
      return ids.get(id);
    },
    querySelector(selector) { return selector === ".cartesian-plane" ? null : this.querySelectorAll(selector)[0] ?? null; },
    querySelectorAll(selector) { return [...ids.values()].flatMap(el => el.querySelectorAll(selector)); },
    addEventListener(type, fn) { if (type === "keydown") keys.push(fn); },
    press() { keys.forEach(fn => fn({ key: "Enter", preventDefault() {} })); }
  };
  return document;
}

function setup({ answerMode = "direct", questions, mode = "response" } = {}) {
  const document = dom(); globalThis.document = document; globalThis.window = {};
  const intervals = new Map(), evaluations = [], feedback = [], historyCalls = [];
  let intervalId = 0;
  questions ??= [{ question: "2+2", answers: ["4"], time: 1 }, { question: "3+3", answers: ["6"], time: 2 }];
  const context = vm.createContext({ document, window: { location: { search: "?table=fixture" } }, URLSearchParams,
    loadExercise: () => ({ questions }), setAnswerControlsLocked,
    evaluateCurrentAnswer(options) { const result = evaluateCurrentAnswer(options); evaluations.push(result); return result; },
    checkAnswerSmart, configureQuestionControls, updateAnswerUI,
    storeAnswerForCorrections(options) { historyCalls.push(options); storeAnswerForCorrections(options); },
    handleSessionCompletion, handleSlideshowCompletion, advanceQuestionProgress,
    getDisplayAnswer: q => q.answers[0], getCorrectQCMAnswer: ({ question }) => question.answers[0],
    displayAnswerFeedback: result => feedback.push(result),
    displayQuestionContent() {}, updateMathKeyboard() {},
    displayFinalScore() {}, prepareStandardFinalScreen() {},
    hideTimer() {}, hideCorrectionOverlay() {}, showCorrectionOverlay() {},
    setInterval(fn) { intervals.set(++intervalId, fn); return intervalId; }, clearInterval: id => intervals.delete(id)
  });
  vm.runInContext(strip(read("core/timer.js")), context);
  vm.runInContext(strip(read("main.js")), context);
  const run = code => vm.runInContext(code, context);
  run(`tableauSelectionne = exercice.questions; selectedQuestionCount = ${questions.length}; answerMode = ${JSON.stringify(answerMode)}; presentationMode = ${JSON.stringify(mode)}; displayQuestion();`);
  document.getElementById("submit").addEventListener("click", () => run("checkAnswer()"));
  document.getElementById("next").addEventListener("click", () => run("nextQuestion()"));
  initializeAnswerInput({ onSubmit: () => run("checkAnswer()") });
  initializeKeyboardShortcuts({ isWaitingForCorrection: () => false, isInCorrectionMode: () => false,
    isAwaitingNextQuestion: () => run("awaitingNextQuestion"), getPresentationMode: () => mode,
    getCorrectionStep: () => "question", clearAwaitingNextQuestion: () => run("awaitingNextQuestion = false"),
    onNextQuestion: () => run("nextQuestion()") });
  return { document, run, evaluations, feedback, historyCalls, intervals,
    input: document.getElementById("user-answer"), submit: () => document.getElementById("submit").click(),
    tick: () => [...intervals.values()][0](), snapshot: () => run("JSON.stringify({score,answeredCount,userAnswers})") };
}

for (const [label, value, score] of [["correcte", "4", 1], ["incorrecte", "9", 0], ["vide", "", 0]]) {
  test(`réponse ${label} : une évaluation et un score définitifs, double clic, Entrée et appel tardif`, () => {
    const app = setup(); app.input.value = value; app.input.focus();
    const pendingTick = [...app.intervals.values()][0];
    app.submit(); app.submit();
    const state = app.snapshot();
    assert.equal(app.run("score"), score); assert.equal(app.run("answeredCount"), 1);
    assert.equal(app.input.disabled, true); assert.equal(app.document.activeElement, null);
    // Même un appel direct du gestionnaire et un événement déjà en attente
    // ne doivent pas réévaluer une réponse modifiée artificiellement.
    app.input.value = "4"; app.input.fire("keydown"); app.run("checkAnswer(); handleTimeUp()"); pendingTick();
    assert.equal(app.evaluations.length, 1); assert.equal(app.historyCalls.length, 1);
    assert.equal(app.snapshot(), state); assert.equal(app.evaluations[0].userAnswer, value);
    assert.equal(app.feedback[0].isNotAnswered, value === "");
  });
}

for (const partial of [false, true]) test(`expiration ${partial ? "avec réponse partielle" : "sans réponse"} : aucune validation tardive`, () => {
  const app = setup({ questions: [{ question: "paire", answers: ["4", "6"], time: 1,
    answerFields: [{ label: "a", answer: "4" }, { label: "b", answer: "6" }] }, { question: "suite", answers: ["1"], time: 2 }] });
  const fields = app.document.querySelectorAll(".multi-answer-input");
  if (partial) fields[0].value = "4";
  app.tick(); const state = app.snapshot();
  assert.ok(fields.every(f => f.disabled)); assert.equal(app.evaluations.length, 1);
  fields[1].value = "6"; app.run("checkAnswer(); handleTimeUp()"); app.submit();
  assert.equal(app.snapshot(), state); assert.equal(app.run("score"), 0);
  assert.deepEqual(app.evaluations[0].userAnswer, partial ? ["4", ""] : ["", ""]);
});

test("validation et expiration simultanées : la première issue gagne dans les deux ordres", () => {
  for (const timeoutFirst of [false, true]) {
    const app = setup(); const tick = [...app.intervals.values()][0]; app.input.value = timeoutFirst ? "" : "4";
    if (timeoutFirst) { tick(); app.input.value = "4"; app.submit(); } else { app.submit(); tick(); }
    assert.equal(app.evaluations.length, 1); assert.equal(app.run("answeredCount"), 1);
    assert.equal(app.run("score"), timeoutFirst ? 0 : 1);
  }
});

test("expiration avec une réponse correcte déjà saisie : barème historique conservé", () => {
  const app = setup(); app.input.value = "4"; app.tick();
  assert.equal(app.run("score"), 1); assert.equal(app.run("answeredCount"), 1);
  assert.equal(app.evaluations.length, 1); assert.equal(app.input.disabled, true);
  app.run("checkAnswer(); handleTimeUp()"); assert.equal(app.run("score"), 1);
});

test("nouvelle question par Entrée : état réinitialisé, ancien tick annulé et nouveau score unique", () => {
  const app = setup(); const oldTick = [...app.intervals.values()][0]; app.input.value = "4"; app.submit();
  app.document.press();
  assert.equal(app.run("currentQuestionIndex"), 1); assert.equal(app.input.disabled, false);
  assert.equal(app.document.getElementById("submit").disabled, false); assert.equal(app.input.value, "");
  oldTick(); assert.equal(app.run("getTimeLeft()"), 2); assert.equal(app.evaluations.length, 1);
  app.input.value = "6"; app.submit(); app.run("checkAnswer()");
  assert.equal(app.run("score"), 2); assert.equal(app.run("answeredCount"), 2);
  assert.equal(app.evaluations.length, 2);
});

test("QCM : choix conservé, changement et événements de sélection tardifs bloqués", () => {
  const app = setup({ answerMode: "qcm", questions: [{ question: "qcm", answers: ["4"], possible_answers: ["4", "5", "6"], time: 1 }] });
  const buttons = app.document.getElementById("qcm-buttons").children;
  buttons.find(b => b.dataset.answer === "5").click(); app.submit(); const state = app.snapshot();
  assert.ok(buttons.every(b => b.disabled));
  buttons.find(b => b.dataset.answer === "4").fire("click"); app.run('handleQCMSelection("4"); checkAnswer()');
  assert.equal(app.run("selectedQCMAnswer"), "5"); assert.equal(app.snapshot(), state);
  assert.equal(app.evaluations.length, 1);
});

for (const [name, answer] of [["fraction", "1/2"], ["texte", "triangle"]]) test(`${name} : saisie conservée et verrouillée après validation`, () => {
  const app = setup({ questions: [{ question: name, answers: [answer], time: 1,
    ...(name === "texte" ? { answerRule: { type: "custom", validate: ({ userInput }) => ({ valid: userInput === answer }) } } : {}) }] });
  app.input.value = answer; app.submit();
  assert.equal(app.input.value, answer); assert.equal(app.input.disabled, true);
  assert.equal(app.run("score"), 1); app.run("checkAnswer()"); assert.equal(app.evaluations.length, 1);
});

test("verrou commun : champs, menus de preuve, clavier mathématique et événements en attente", () => {
  const document = dom(); globalThis.document = document;
  const root = document.createElement("div"), input = document.createElement("input"), menu = document.createElement("button");
  root.appendChild(input); root.appendChild(menu); input.value = "réponse conservée";
  let changes = 0; menu.addEventListener("click", () => changes++);
  const submitButton = document.createElement("button");
  setAnswerControlsLocked(true, { containers: [root], submitButton }); menu.fire("click");
  assert.equal(changes, 0); assert.equal(input.value, "réponse conservée");
  assert.equal(input.disabled, true); assert.equal(menu.disabled, true); assert.equal(submitButton.disabled, true);
  setAnswerControlsLocked(false, { containers: [root], submitButton }); menu.click();
  assert.equal(changes, 1); assert.equal(input.disabled, false);
});

test("diaporama des automatismes : expiration, historique et progression existants", () => {
  const app = setup({ mode: "slideshow" }); app.tick();
  assert.equal(app.run("currentQuestionIndex"), 1);
  assert.equal(app.run("userAnswers.length"), 1); assert.equal(app.run("answeredCount"), 1);
  assert.equal(app.run("userAnswers[0].userAnswer"), "Pas de réponse");
  assert.equal(app.evaluations.length, 0); assert.equal(app.run("getTimeLeft()"), 2);
});
