import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

// Moteurs réels de session, de progression et de chronomètre ; seuls le DOM,
// le rendu et les intervalles sont simulés pour avancer sans attendre.
const paths = [
  "core/tableaux.js", "core/modes.js", "core/mixedMode.js", "core/timer.js", "core/session.js",
  "core/questionProgress.js", "core/slideshowCompletion.js",
  "core/sessionCompletion.js", "core/keyboardShortcuts.js", "core/inputEvents.js", "main.js"
];
const sources = await Promise.all(paths.map(async path =>
  (await readFile(new URL(`../${path}`, import.meta.url), "utf8"))
    .replace(/^import\s[\s\S]*?from\s*["'][^"']+["'];/gm, "")
    .replace(/^export /gm, "")
));
const questionControls = (await readFile(new URL("../core/questionControls.js", import.meta.url), "utf8"))
  .replace(/^import\s[\s\S]*?from\s*["'][^"']+["'];/gm, "")
  .replace(/^export /gm, "");

function setup({ mode = "slideshow", shuffle = false, generated = false, beforeReady = "" } = {}) {
  const questions = Object.freeze([
    Object.freeze({ id: "custom", question: "A", answers: ["1"], duration: 30, time: 99 }),
    Object.freeze({ id: "default", question: "B", answers: ["2"], time: 99 }),
    Object.freeze({ id: "short", question: "C", answers: ["3"], duration: 2 })
  ]);
  const series = { title: "Durées", shuffle, questions };
  let generations = 0;
  if (generated) series.generateQuestions = () => {
    generations++;
    return questions.map(q => ({ ...q, ...(q.duration ? { duration: q.duration + 1 } : {}) }));
  };
  const elements = new Map(), intervals = new Map(), keyListeners = [];
  let ready, page, sliders, controls, nextInterval = 0;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      style: {}, classList: { add() {}, remove() {}, contains() { return false; } },
      handlers: {},
      addEventListener(name, fn) { this.handlers[name] = fn; }, focus() {}
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    URLSearchParams, console,
    window: { location: { search: "?table=duration_test" }, addEventListener() {} },
    document: {
      getElementById: element, querySelector: element,
      addEventListener(name, fn) {
        if (name === "DOMContentLoaded") ready = fn;
        if (name === "keydown") keyListeners.push(fn);
      }
    },
    requestAnimationFrame: fn => fn(),
    setInterval(fn, delay) {
      assert.equal(delay, 1000);
      intervals.set(++nextInterval, fn);
      return nextInterval;
    },
    clearInterval: id => intervals.delete(id),
    loadExercise: () => series,
    initializePage(options) { page = options; },
    initializeSliders(options) {
      sliders = options;
      options.onTimeChange(60);
      options.onQuestionCountChange(questions.length);
    },
    initializeModeControls(options) {
      controls = options;
      options.onAnswerModeChange("direct", false);
      options.onPresentationModeChange(mode, false);
    },
    initializeMathKeyboard() {},
    setAnswerControlsLocked() {},
    displayQuestionContent() {}, configureQuestionControls() {}, updateMathKeyboard() {},
    hideCorrectionOverlay() {}, showCorrectionOverlay() {}, displayFinalScore() {},
    getDisplayAnswer: q => q.answers[0],
    getCorrectQCMAnswer: ({ question }) => question.answers[0]
  });
  sources.forEach(source => vm.runInContext(source, context));
  vm.runInContext(beforeReady, context);
  ready();
  return {
    page, series, questions, element, sliders, controls,
    run: code => vm.runInContext(code, context),
    key(props = {}) {
      const event = {
        key: "Enter", shiftKey: true, ...props,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() { this.stopped = true; }
      };
      if (event.target === element("user-answer")) event.target.handlers.keydown(event);
      if (!event.stopped) keyListeners.forEach(fn => fn(event));
      return event;
    },
    tick() { assert.equal(intervals.size, 1); [...intervals.values()][0](); },
    get activeTimers() { return intervals.size; },
    get generations() { return generations; }
  };
}

test("export Mixte : répartition jouée, changements de réglages et régénération", () => {
  const app = setup({ generated: true });
  app.run(`
    globalThis.exportCalls = [];
    globalThis.openExportDialog = ({ onExport }) => onExport({ exportType: "evaluation", includeCorrection: false });
    globalThis.exportExercise = options => exportCalls.push(options);
  `);
  const exportCurrent = () => {
    app.element("export-evaluation").handlers.click();
    return JSON.parse(app.run("JSON.stringify(exportCalls[exportCalls.length - 1])"));
  };
  // Les contrôles réels enregistrent ces réglages ; seul le rendu est simulé.
  app.controls.onAnswerModeChange("mixed", false);
  app.sliders.onMixedQCMCountChange(2);
  app.page.onStart();
  const played = JSON.parse(app.run("JSON.stringify(mixedModeDistribution)"));
  assert.equal(played.filter(m => m === "qcm").length, 2);
  assert.deepEqual(exportCurrent().questionAnswerModes, played);

  // Un réglage destiné à la prochaine séance ne doit pas provoquer un nouveau tirage.
  app.sliders.onMixedQCMCountChange(0);
  assert.deepEqual(exportCurrent().questionAnswerModes, played);
  app.controls.onAnswerModeChange("qcm", false);
  assert.equal(exportCurrent().questionAnswerModes, undefined);
  app.controls.onAnswerModeChange("mixed", false);
  assert.deepEqual(exportCurrent().questionAnswerModes, played);

  app.page.onRestart();
  assert.equal(app.generations, 1);
  assert.deepEqual(exportCurrent().questionAnswerModes, ["direct", "direct", "direct"]);
  assert.deepEqual(JSON.parse(app.run("JSON.stringify(exportCalls[0].questionAnswerModes)")), played, "copie indépendante de la répartition");
  assert.deepEqual(exportCurrent().questions.map(q => q.duration), [31, undefined, 3]);

  app.sliders.onMixedQCMCountChange(3);
  app.page.onRestart();
  assert.deepEqual(exportCurrent().questionAnswerModes, ["qcm", "qcm", "qcm"]);
  app.controls.onAnswerModeChange("direct", false);
  app.page.onRestart();
  assert.deepEqual(JSON.parse(app.run("JSON.stringify(mixedModeDistribution)")), []);
  app.controls.onAnswerModeChange("mixed", false);
  assert.deepEqual(exportCurrent().questionAnswerModes, [], "aucune ancienne répartition après une séance Direct");
  app.run("stopTimer()");
});

for (const mode of ["response", "slideshow"]) {
  for (const shuffle of [false, true]) {
    test(`durées propres et curseur, passage et Recommencer : ${mode}, mélange ${shuffle}`, () => {
      const app = setup({ mode, shuffle });
      for (const slider of [60, 45]) {
        app.run(`selectedTime = ${slider}`);
        if (slider === 60) app.page.onStart();
        else app.page.onRestart();
        // Le redémarrage arrête aussi le chronomètre encore actif.
        assert.equal(app.activeTimers, 1);
        const order = app.run("tableauSelectionne.map(q => q.id)");
        for (let i = 0; i < order.length; i++) {
          if (i > 0) app.page.onNext();
          const original = app.questions.find(q => q.id === order[i]);
          const expected = original.duration ?? slider;
          assert.equal(app.run("tableauSelectionne[currentQuestionIndex].time"), expected);
          assert.equal(app.run("getTimeLeft()"), expected);
          assert.equal(app.element("timer").textContent, String(expected));
          app.tick();
          assert.equal(app.run("getTimeLeft()"), expected - 1);
          assert.equal(app.activeTimers, 1);
        }
      }
      assert.equal(app.series.questions, app.questions);
      assert.equal(app.questions[0].time, 99);
      assert.equal(app.questions[1].time, 99);
      assert.equal(app.questions[2].time, undefined);
      app.run("stopTimer()");
    });
  }
}

test("le compte à rebours expire à la durée propre puis utilise le curseur", () => {
  const app = setup();
  app.page.onStart();
  for (let i = 0; i < 29; i++) app.tick();
  assert.equal(app.run("currentQuestionIndex"), 0);
  assert.equal(app.run("getTimeLeft()"), 1);
  app.tick();
  assert.equal(app.run("currentQuestionIndex"), 1);
  assert.equal(app.run("getTimeLeft()"), 60);
  assert.equal(app.activeTimers, 1);
  app.page.onRestart();
  assert.equal(app.run("currentQuestionIndex"), 0);
  assert.equal(app.run("getTimeLeft()"), 30);
  app.run("stopTimer()");
});

test("Recommencer utilise aussi les durées des questions régénérées", () => {
  const app = setup({ generated: true });
  app.page.onStart();
  assert.equal(app.run("getTimeLeft()"), 30);
  app.page.onRestart();
  assert.equal(app.generations, 1);
  assert.equal(app.run("getTimeLeft()"), 31);
  app.page.onNext();
  assert.equal(app.run("getTimeLeft()"), 60);
  app.page.onNext();
  assert.equal(app.run("getTimeLeft()"), 3);
  app.run("stopTimer()");
});

for (const answerMode of ["direct", "qcm", "mixed"]) {
  test(`Maj + Entrée suit le parcours du diaporama et conserve l'historique : ${answerMode}`, () => {
    const app = setup();
    app.page.onStart();
    app.run(`answerMode = "${answerMode}"; mixedModeDistribution = ["direct", "qcm", "direct"];`);
    app.key();
    assert.equal(app.run("currentQuestionIndex"), 1);
    assert.equal(app.run("userAnswers.length"), 1);
    assert.equal(app.run("userAnswers[0].userAnswer"), "Pas de réponse");
    assert.equal(app.run("getTimeLeft()"), 60);
    assert.equal(app.activeTimers, 1);
    app.key({ repeat: true });
    assert.equal(app.run("currentQuestionIndex"), 1);
    assert.equal(app.run("userAnswers.length"), 1);
    app.key();
    assert.equal(app.run("currentQuestionIndex"), 2);
    assert.equal(app.run("getTimeLeft()"), 2);
    app.key();
    assert.equal(app.activeTimers, 0);
    assert.equal(app.run("waitingForCorrectionStart"), true);
    assert.equal(app.run("inCorrectionMode"), false);
    assert.equal(app.run("userAnswers.length"), 3);
    const snapshot = app.run("JSON.stringify(userAnswers)");
    app.key();
    app.key({ repeat: true });
    assert.equal(app.run("waitingForCorrectionStart"), true);
    assert.equal(app.run("inCorrectionMode"), false);
    assert.equal(app.run("JSON.stringify(userAnswers)"), snapshot);
    app.page.onRestart();
    app.key();
    assert.equal(app.run("currentQuestionIndex"), 1);
    app.run("stopTimer()");
  });
}

test("Maj + Entrée ignore les réglages, le mode réponse et les corrections", () => {
  const app = setup();
  app.key();
  assert.equal(app.activeTimers, 0);
  assert.equal(app.run("userAnswers.length"), 0);
  app.page.onStart();
  for (const state of [
    'presentationMode = "response"; awaitingNextQuestion = true;',
    'presentationMode = "slideshow"; inCorrectionMode = true;',
    'inCorrectionMode = false; correctionStep = "final";'
  ]) {
    app.run(state);
    app.key();
    assert.equal(app.run("currentQuestionIndex"), 0);
    assert.equal(app.run("userAnswers.length"), 0);
    assert.equal(app.activeTimers, 1);
  }
  app.run("stopTimer()");
});

test("Maj + Entrée ignore les contrôles interactifs et les événements déjà traités", () => {
  const app = setup();
  app.page.onStart();
  const selector = 'input, textarea, select, button, a[href], [contenteditable], [role="button"], [role="textbox"]';
  for (const tag of ["input", "textarea", "select", "button", "a", "span dans button", "contenteditable"]) {
    const target = { closest(value) { assert.equal(value, selector); return { tag }; } };
    assert.equal(app.key({ target }).defaultPrevented, true);
  }
  for (const props of [
    { repeat: true }, { defaultPrevented: true }, { isComposing: true },
    { ctrlKey: true }, { altKey: true }, { metaKey: true },
    { target: { isContentEditable: true } }
  ]) app.key(props);
  assert.equal(app.run("currentQuestionIndex"), 0);
  assert.equal(app.run("userAnswers.length"), 0);
  assert.equal(app.activeTimers, 1);
  app.run("stopTimer()");
});

test("le champ de réponse ignore Maj + Entrée et conserve Entrée", () => {
  for (const mode of ["response", "slideshow"]) {
    const app = setup({ mode, beforeReady: 'checkAnswer = () => { globalThis.submitted = true; };' });
    app.page.onStart();
    const target = app.element("user-answer");
    const ignored = app.key({ target });
    assert.equal(ignored.stopped, true);
    assert.equal(app.run("globalThis.submitted"), undefined);
    assert.equal(app.run("currentQuestionIndex"), 0);
    app.key({ target, shiftKey: false });
    assert.equal(app.run("globalThis.submitted"), true);
    app.run("stopTimer()");
  }
});

test("Entrée et les flèches conservent leurs actions existantes", () => {
  const app = setup({ beforeReady: `
    startCorrectionsMode = () => { globalThis.started = true; };
    advanceCorrectionStep = () => { globalThis.advanced = true; };
    previousCorrectionStep = () => { globalThis.previous = true; };
  ` });
  app.page.onStart();
  app.key({ shiftKey: false });
  app.key({ key: "ArrowDown", shiftKey: false });
  assert.equal(app.run("currentQuestionIndex"), 0);
  app.run('presentationMode = "response"; awaitingNextQuestion = true;');
  app.key({ shiftKey: false });
  assert.equal(app.run("currentQuestionIndex"), 1);
  assert.equal(app.run("awaitingNextQuestion"), false);
  app.run('presentationMode = "slideshow"; waitingForCorrectionStart = true;');
  app.key();
  assert.equal(app.run("globalThis.started"), undefined);
  app.key({ shiftKey: false });
  assert.equal(app.run("globalThis.started"), true);
  app.run('waitingForCorrectionStart = false; inCorrectionMode = true;');
  app.key();
  assert.equal(app.run("globalThis.advanced"), undefined);
  app.key({ shiftKey: false });
  assert.equal(app.run("globalThis.advanced"), true);
  app.run("globalThis.advanced = false");
  app.key({ key: "ArrowDown", shiftKey: false });
  assert.equal(app.run("globalThis.advanced"), true);
  app.key({ key: "ArrowUp", shiftKey: false });
  assert.equal(app.run("globalThis.previous"), true);
  app.run("stopTimer()");
});

test("champs multiples : Maj + Entrée inactif, Entrée valide ou avance comme avant", () => {
  const app = setup({ mode: "response" });
  const field = app.element("multi-field");
  const container = app.element("multi-answer-container");
  container.querySelectorAll = () => [field];
  container.querySelector = () => field;
  let submits = 0, nexts = 0;
  app.element("submit").click = () => submits++;
  app.element("next").click = () => nexts++;
  app.run(questionControls);
  app.run('configureQuestionControls({ question: { answerFields: [{ label: "A", answer: "1" }] }, answerMode: "direct", presentationMode: "response" });');
  const press = shiftKey => {
    const event = { key: "Enter", shiftKey,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.stopped = true; }
    };
    field.handlers.keydown(event);
    assert.equal(event.stopped, true);
  };
  press(true);
  assert.equal(submits, 0);
  press(false);
  assert.equal(submits, 1);
  app.element("next").style.display = "inline-block";
  press(true);
  assert.equal(nexts, 0);
  press(false);
  assert.equal(nexts, 1);
});


test("les six remédiations utilisent le curseur au chargement et après régénération", async () => {
  const { startExerciseSession } = await import("../core/session.js");
  const previousDocument = globalThis.document;
  const previousRAF = globalThis.requestAnimationFrame;
  const node = () => ({ style: {}, classList: { add() {}, remove() {} }, disabled: false, textContent: "", innerHTML: "" });
  globalThis.document = { getElementById: () => node(), querySelector: () => node() };
  globalThis.requestAnimationFrame = callback => callback();
  try {
    for (let index = 1; index <= 6; index++) {
      const { default: series } = await import(`../exercices/remediation_evaluations_nationales_6e_serie_${index}.js`);
      for (const questions of [series.questions, series.generateQuestions()]) {
        assert.equal(questions.length, 5);
        for (const question of questions) assert.equal(Object.hasOwn(question, "duration"), false);
        for (const selectedTime of [15, 45, 60]) {
          let ready = false;
          startExerciseSession({
            exercice: { ...series, questions }, selectedTime,
            onCloseCorrectionOverlay() {},
            onQuestionsReady(sessionQuestions) {
              ready = true;
              assert.deepEqual(sessionQuestions.map(question => question.time), Array(5).fill(selectedTime), `série ${index}, curseur ${selectedTime}`);
            }
          });
          assert.equal(ready, true);
        }
      }
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousRAF === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = previousRAF;
  }
});

for (const question of [0, 1, 2]) {
  test(`Pause/Reprendre, focus conservé et cycles multiples sur la question ${question + 1}`, () => {
    const app = setup();
    app.page.onStart();
    for (let i = 0; i < question; i++) app.key();
    const target = { closest() { return { id: "pause-timer" }; } };
    const pause = app.element("pause-timer");
    const remaining = app.run("getTimeLeft()");
    for (let cycle = 0; cycle < 4; cycle++) {
      pause.handlers.click();
      assert.equal(app.run("getIsPaused()"), true);
      assert.equal(app.activeTimers, 0);
      app.key({ target });
      app.key();
      assert.equal(app.run("currentQuestionIndex"), question);
      assert.equal(app.run("userAnswers.length"), question);
      assert.equal(app.run("getTimeLeft()"), remaining);
      pause.handlers.click();
      assert.equal(app.run("getIsPaused()"), false);
      assert.equal(app.activeTimers, 1);
    }
    const event = app.key({ target });
    assert.equal(event.defaultPrevented, true, "pas d'activation native du bouton");
    assert.equal(app.run("userAnswers.length"), question + 1, "un seul déclenchement");
    if (question < 2) {
      assert.equal(app.run("currentQuestionIndex"), question + 1);
      assert.equal(app.activeTimers, 1);
    } else assert.equal(app.activeTimers, 0);
    app.run("stopTimer()");
  });
}
