import { displayQCMOptions, highlightCorrectQCMButton } from "./core/qcm.js";
import {
  createProgressiveCorrectionPlayer,
  getProgressiveCorrectionSteps
} from "./core/progressiveCorrectionPlayer.js";
import { setModeButtonsDisabled } from "./core/modes.js";
import { loadExercise }
  from "./core/exerciseLoader.js";

import { checkAnswerSmart }
  from "./core/correcteur.js";

import {
  hideTimer,
  hideTimerImmediately,
  resetTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  getIsPaused
} from "./core/timer.js";

import {
  showCorrectionOverlay,
  hideCorrectionOverlay
} from "./core/correctionOverlay.js";

import {
  displayFinalScore,
  prepareFinalScreen as prepareStandardFinalScreen
} from "./core/finalScore.js";

import {
  displayCorrectionQuestion as renderCorrectionQuestion,
  displayCorrectionAnswer as renderCorrectionAnswer
} from "./core/corrections.js";

import {
  displayAnswerMode,
  displayPresentationMode,
} from "./core/modes.js";

import { initializeModeControls }
  from "./core/modeControls.js";

import { initializePage }
  from "./core/pageInit.js";

import { initializeSliders }
  from "./core/sliders.js";

import { initializeAnswerInput }
  from "./core/inputEvents.js";

import { initializeKeyboardShortcuts }
  from "./core/keyboardShortcuts.js";

import { startExerciseSession }
  from "./core/session.js";

import { displayQuestionContent }
  from "./core/questionDisplay.js";

import { configureQuestionControls }
  from "./core/questionControls.js";

import {
  evaluateCurrentAnswer,
  getCorrectQCMAnswer
} from "./core/answerEvaluation.js";

import { storeAnswerForCorrections }
  from "./core/answerHistory.js";

import { updateAnswerUI }
  from "./core/answerUI.js";

import { handleSlideshowCompletion }
  from "./core/slideshowCompletion.js";

import { advanceQuestionProgress }
  from "./core/questionProgress.js";

import { handleSessionCompletion }
  from "./core/sessionCompletion.js";

import { displayAnswerFeedback }
  from "./core/answerFeedback.js";

import {
  advanceCorrectionProgress,
  previousCorrectionProgress
} from "./core/correctionProgress.js";

import {
  startCorrectionSession,
  restoreCorrectionScreen
} from "./core/correctionSession.js";

import { completeCorrectionSession }
  from "./core/correctionCompletion.js";

import {
  initializeMathKeyboard,
  updateMathKeyboard
} from "./core/mathKeyboard.js";

import {
  createMixedModeDistribution
} from "./core/mixedMode.js";

import {
  getDisplayAnswer
} from "./core/answerDisplay.js";

import {
  enableCartesianPointSelection,
  enableCartesianQCMPointSelection,
  displayCartesianPoint,
  displayCartesianPoints,
  highlightCartesianQCMPoints
} from "./core/cartesianPointSelection.js";

import {
  formatAnswer
} from "./core/answerFormatting.js";

import {
  exportExercise
} from "./core/export/exportExercise.js";

import {
  openExportDialog
} from "./core/export/exportDialog.js";

const urlParams = new URLSearchParams(window.location.search);
const currentExercise = urlParams.get("table") || "remediation_evaluations_nationales_6e_serie_1";
let exercice = loadExercise(currentExercise);

function prepareFinalScreen() {
  prepareStandardFinalScreen();
}

import { setAnswerControlsLocked } from "./core/answerLock.js";

// État de la session
let tableauSelectionne = [];
let currentQuestionIndex = 0;
let currentCorrectionIndex = 0;
let score = 0;
let answeredCount = 0;
let selectedQuestionCount = 5;
let selectedTime = 30;
let selectedMixedQCMCount = 0;

// Modes
let answerMode = "direct";
let presentationMode = "response";
let currentQuestionAnswerMode =
  "direct";
let mixedModeDistribution = [];

// État de l'interface
let selectedQCMAnswer = null;
let selectedCartesianPoint = null;
let userAnswers = [];
let waitingForCorrectionStart = false;
let inCorrectionMode = false;
let correctionStep = "question";
let awaitingNextQuestion = false;
let responseLocked = true;

function setResponseLocked(locked) {
  responseLocked = locked;
  setAnswerControlsLocked(locked, {
    containers: ["user-answer", "multi-answer-container", "qcm-buttons", "math-keyboard"]
      .map(id => document.getElementById(id)).concat(document.querySelector(".cartesian-plane")),
    submitButton: document.getElementById("submit")
  });
}
let showCorrectAnswer = true;
let progressiveCorrectionPlayer = null;
let disposeQuestionInteraction = null;

function disposeProgressiveCorrection() {
  disposeQuestionInteraction?.();
  disposeQuestionInteraction = null;
  progressiveCorrectionPlayer?.dispose();
  progressiveCorrectionPlayer = null;
}

// Handlers
function handleQCMSelection(answer) {
  if (responseLocked) return;
  selectedQCMAnswer = answer;
}

function handleTimeUp() {
  if (presentationMode === "slideshow") {
    saveUnansweredQuestion();
    nextQuestion();
    return;
  }

  checkAnswer();
}

function openCorrectionOverlay() {
  waitingForCorrectionStart = true;
  showCorrectionOverlay();
}

function closeCorrectionOverlay() {
  waitingForCorrectionStart = false;
  hideCorrectionOverlay();
}

// Gestion des questions
function displayQuestion() {
  disposeProgressiveCorrection();
  if (!tableauSelectionne || tableauSelectionne.length === 0) {
    alert("Aucun tableau sélectionné ou tableau vide !");
    return;
  }
  const q = 
    tableauSelectionne[currentQuestionIndex];

  setResponseLocked(false);

  currentQuestionAnswerMode =

    q.answerMode === "point" &&
    answerMode !== "qcm"

      ? "point"

      : (
          answerMode === "mixed"

            ? mixedModeDistribution[
                answeredCount
              ]

            : answerMode
        );

  updateMathKeyboard(
    q,
    currentQuestionAnswerMode,
    presentationMode
  );

  displayQuestionContent({
    question: q,
    currentQuestionIndex,
    selectedQuestionCount,
    answerMode:
      currentQuestionAnswerMode
  });

  selectedCartesianPoint = null;

  if (
    q.givenPoint &&
    q.figureConfig
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      displayCartesianPoint({
        svg,

        point:
          q.givenPoint,

        width:
          q.figureConfig.width,

        height:
          q.figureConfig.height,

        range:
          q.figureConfig.range,

        padding:
          q.figureConfig.padding,

        name:
          q.givenPoint.name
      });
    }
  }

  if (
    currentQuestionAnswerMode === "point"
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      enableCartesianPointSelection({
        svg,

        width:
          q.figureConfig.width,

        height:
          q.figureConfig.height,

        range:
          q.figureConfig.range,

        padding:
          q.figureConfig.padding,

        name:
          q.answerPoint.name,

        onSelect:
          point => {
            if (responseLocked) return;
            selectedCartesianPoint =
              point;
          }
      });
    }
  }

  if (
    currentQuestionAnswerMode === "qcm" &&
    Array.isArray(q.qcmPoints)
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      displayCartesianPoints({
        svg,

        points:
          q.qcmPoints,

        width:
          q.figureConfig.width,

        height:
          q.figureConfig.height,

        range:
          q.figureConfig.range,

        padding:
          q.figureConfig.padding
      });

      if (
        presentationMode === "response"
      ) {
        enableCartesianQCMPointSelection({
          svg,

          onSelect:
            point => {
              if (responseLocked) return;
              selectedQCMAnswer =
                point;
            }
        });
      }
    }
  }

  selectedQCMAnswer = null;
  awaitingNextQuestion = false;

  configureQuestionControls({
    question: q,
    answerMode:
      currentQuestionAnswerMode,
    presentationMode,
    onQCMSelection: handleQCMSelection
  });

  if (presentationMode === "response" && currentQuestionAnswerMode === "direct") {
    disposeQuestionInteraction = q.initializeResponse?.({ document });
  }

  // Utiliser la durée attribuée à cette question par la session.
  resetTimer(q.time, handleTimeUp);

  if (window.MathJax) {
    MathJax.typeset();
  }


}

function saveUnansweredQuestion() {
  const currentQuestion =
    tableauSelectionne?.[currentQuestionIndex];

  if (!currentQuestion) {
    return;
  }

  const correctAnswer =
    currentQuestionAnswerMode === "point" ||
    (
      currentQuestionAnswerMode === "qcm" &&
      Array.isArray(
        currentQuestion.qcmPoints
      )
    )
      ? currentQuestion.answerPoint
      : currentQuestion.answers[0];

  const displayAnswer =

    currentQuestionAnswerMode === "point" ||
    (
      currentQuestionAnswerMode === "qcm" &&
      Array.isArray(
        currentQuestion.qcmPoints
      )
    )

      ? currentQuestion.answerPoint

      : (

          getDisplayAnswer(

            currentQuestion,

            currentQuestionAnswerMode

          ) ??

          currentQuestion.answers[0]

        );

  const correctQCMAnswer =
    currentQuestionAnswerMode === "qcm" &&
    !Array.isArray(
      currentQuestion.qcmPoints
    )
      ? getCorrectQCMAnswer({
          question:
            currentQuestion
        })
      : correctAnswer;

  userAnswers.push({
    question:
      currentQuestion.question,

    ...(currentQuestion.progressiveCorrection !== undefined
      ? { progressiveCorrection: currentQuestion.progressiveCorrection }
      : {}),

    userAnswer:
      "Pas de réponse",

    correctAnswer,

    displayAnswer,

    correctQCMAnswer,

    isCorrect: false,

    answerMode:
      currentQuestionAnswerMode,

    qcmNumberFormat:
      currentQuestion.qcmNumberFormat,

    qcmClass:
      currentQuestion.qcmClass ??
      null,
    ...(currentQuestion.qcmRenderAnswer ? { qcmRenderAnswer: currentQuestion.qcmRenderAnswer } : {}),

    figureConfig:
      currentQuestion.figureConfig,

    givenPoint:
      currentQuestion.givenPoint,

    qcmPoints:
      currentQuestion.qcmPoints
        ? [
            ...currentQuestion.qcmPoints
          ]
        : null,

    qcmAnswersOrder:
      currentQuestion.qcmAnswersOrder
        ? [
            ...currentQuestion.qcmAnswersOrder
          ]
        : null
  });
}

function checkAnswer() {
  if (responseLocked || awaitingNextQuestion || !tableauSelectionne[currentQuestionIndex]) {
    return;
  }

  // Acquérir le verrou avant toute évaluation ou mise à jour du score.
  setResponseLocked(true);
  stopTimer();
  disposeQuestionInteraction?.();
  disposeQuestionInteraction = null;
  const currentQuestion =
    tableauSelectionne[currentQuestionIndex];

  const {
    userAnswer,
    isCorrect,
    correctAnswer
  } = evaluateCurrentAnswer({
    question: currentQuestion,
    answerMode:
      currentQuestionAnswerMode,
    selectedQCMAnswer,
    selectedCartesianPoint
  });

  storeAnswerForCorrections({
    presentationMode,
    userAnswers,
    currentQuestion,
    answerMode:
      currentQuestionAnswerMode,
    userAnswer,
    correctAnswer,
    isCorrect,

    displayAnswer:
      getDisplayAnswer(
        currentQuestion,
        currentQuestionAnswerMode
      ) ??
      correctAnswer,

    correctQCMAnswer:
      currentQuestion.qcmAnswersOrder?.find(
        answer =>
          checkAnswerSmart({
            userInput: answer,
            validAnswers:
              currentQuestion.answers,
            answerRule:
              currentQuestion.answerRule
          }).correct
      ) ?? correctAnswer,

    figureConfig:
      currentQuestion.figureConfig,

    givenPoint:
      currentQuestion.givenPoint
  });

  const isNotAnswered =
    Array.isArray(userAnswer)
      ? userAnswer.every(
          answer => answer === ""
        )
      : !userAnswer;

  if (isNotAnswered) {
    processAnswer(
      false,
      correctAnswer,
      userAnswer,
      true
    );
  } else {
    processAnswer(
      isCorrect,
      correctAnswer,
      userAnswer
    );
  }

  updateAnswerUI({
    presentationMode,
    setAwaitingNextQuestion: (value) => {
      awaitingNextQuestion = value;
    }
  });
}

function processAnswer(
  isCorrect,
  correctAnswer,
  userAnswer,
  isNotAnswered = false
) {
  let incorrectFeedback = "";

  const currentQuestion =
    tableauSelectionne[currentQuestionIndex];

  if (!isCorrect && !isNotAnswered) {
    if (
      Array.isArray(currentQuestion.answerFields) &&
      currentQuestion.answerFields.length > 0
    ) {
      incorrectFeedback =
        "";

      showCorrectAnswer = true;

    } else if (
      currentQuestionAnswerMode === "point"
    ) {
      incorrectFeedback = "";

      showCorrectAnswer = false;

    } else if (
      currentQuestionAnswerMode === "qcm" &&
      Array.isArray(
        currentQuestion.qcmPoints
      )
    ) {
      incorrectFeedback = "";

      showCorrectAnswer = false;

    } else {
      const userInput =
        currentQuestionAnswerMode === "direct"
          ? document
              .getElementById("user-answer")
              .value
              .trim()
          : selectedQCMAnswer;

      const result =
        checkAnswerSmart({
          userInput,
          validAnswers:
            currentQuestion.answers,
          answerRule:
            currentQuestion.answerRule
        });

      incorrectFeedback =
        result.feedback;

      showCorrectAnswer =
        result.showCorrectAnswer ?? true;
    }
  }

  const displayAnswer =
    getDisplayAnswer(
      currentQuestion,
      currentQuestionAnswerMode
    ) ??
    (
      Array.isArray(
        currentQuestion.answerFields
      )
        ? currentQuestion.answerFields
            .map(
              field =>
                `${field.label} ${field.answer}`
            )
            .join(" ; ")
        : correctAnswer
    );

  const correctQCMAnswer =
    currentQuestionAnswerMode === "qcm" &&
    !Array.isArray(
      currentQuestion.qcmPoints
    )
      ? getCorrectQCMAnswer({
          question:
            currentQuestion
        })
      : correctAnswer;

  if (
    currentQuestionAnswerMode === "point" &&
    isNotAnswered
  ) {
    showCorrectAnswer = false;
  }

  displayAnswerFeedback({
    isCorrect,
    isNotAnswered,
    correctAnswer,
    correctQCMAnswer,
    displayAnswer,
    incorrectFeedback,

    answerMode:
      currentQuestionAnswerMode,

    userAnswer,
    showCorrectAnswer
  });

  if ((isCorrect || currentQuestion.qcmClass === 'time-clock-qcm') && currentQuestion.showCorrectionOnSuccess) {
    const correction = document.createElement('div');
    correction.style.color = 'red';
    correction.innerHTML = displayAnswer;
    document.getElementById('feedback').appendChild(correction);
  }


  if (
    currentQuestionAnswerMode === "qcm" &&
    Array.isArray(
      currentQuestion.qcmPoints
    )
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      highlightCartesianQCMPoints({
        svg,

        selectedPoint:
          isNotAnswered
            ? null
            : userAnswer,

        correctPoint:
          currentQuestion.answerPoint
      });
    }
  }

  if (
    currentQuestionAnswerMode === "point" &&
    !isCorrect
  ) {
    const svg =
      document.querySelector(
        ".cartesian-plane"
      );

    if (svg) {
      displayCartesianPoint({
        svg,

        point:
          currentQuestion.answerPoint,

        width:
          currentQuestion.figureConfig.width,

        height:
          currentQuestion.figureConfig.height,

        range:
          currentQuestion.figureConfig.range,

        padding:
          currentQuestion.figureConfig.padding,

        name:
          currentQuestion.answerPoint.name,

        color:
          "red"
      });
    }
  }

  if (window.MathJax) {
    MathJax.typeset();
  }

  if (isCorrect) {
    score++;
  }

  answeredCount++;

  const sessionCompleted =
    handleSessionCompletion({
      answeredCount,
      selectedQuestionCount,
      presentationMode,
      userAnswers,
      score,

      onStopTimer: stopTimer,

      onStartCorrections:
        startCorrectionsMode,

      onDisplayFinalScore:
        displayFinalScore,

      onPrepareFinalScreen:
        prepareFinalScreen,

      onHideTimer: hideTimer
    });

  if (sessionCompleted) {
    return;
  }
}

function nextQuestion() {
  if (answeredCount >= selectedQuestionCount) return; // Ne pas avancer après la fin

  const slideshowCompleted =
    handleSlideshowCompletion({
      presentationMode,
      answeredCount,
      selectedQuestionCount,

      setAnsweredCount: (value) => {
        answeredCount = value;
      },

      onHideTimer: hideTimer,

      onHidePauseButton: () => {
        const pauseButton =
          document.getElementById(
            "pause-timer"
          );

        if (pauseButton) {
          pauseButton.style.display =
            "none";

          pauseButton.textContent =
            "Pause";
        }
      },

      onOpenCorrectionOverlay:
        openCorrectionOverlay
    });

  if (slideshowCompleted) {
    return;
  }

  advanceQuestionProgress({
    currentQuestionIndex,
    questionCount: tableauSelectionne.length,
    presentationMode,
    answeredCount,

    setCurrentQuestionIndex: (value) => {
      currentQuestionIndex = value;
    },

    setAnsweredCount: (value) => {
      answeredCount = value;
    }
  });
  
  const sessionCompleted =
    handleSessionCompletion({
      answeredCount,
      selectedQuestionCount,
      presentationMode,
      userAnswers,
      score,

      onStopTimer: stopTimer,
      onStartCorrections:
        startCorrectionsMode,
      onDisplayFinalScore:
        displayFinalScore,
      onPrepareFinalScreen:
        prepareFinalScreen,
      onHideTimer: hideTimer
    });

  if (sessionCompleted) {
    return;
  }
  
  displayQuestion();
}

// Gestion des corrections
function startCorrectionsMode() {
  startCorrectionSession({
    correctionCount:
      userAnswers.length,

    setCurrentCorrectionIndex:
      (value) => {
        currentCorrectionIndex =
          value;
      },

    setInCorrectionMode:
      (value) => {
        inCorrectionMode = value;
      },

    setCorrectionStep:
      (value) => {
        correctionStep = value;
      },

    onHideTimer:
      hideTimer,

    onCloseCorrectionOverlay:
      closeCorrectionOverlay,

    onDisplayCorrectionQuestion:
      displayCorrectionQuestion
  });
}

function displayCorrectionQuestion() {
  disposeProgressiveCorrection();
  if (currentCorrectionIndex >= userAnswers.length) {
    showFinalScore();
    return;
  }

  const correction =
    userAnswers[currentCorrectionIndex];

  renderCorrectionQuestion({
    correction,
    index: currentCorrectionIndex,
    total: userAnswers.length
  });

  correctionStep = "question";
}

function displayCorrectionAnswer({ atEnd = false } = {}) {
  disposeProgressiveCorrection();
  const correction =
    userAnswers[currentCorrectionIndex];

  if (!correction) {
    showFinalScore();
    return;
  }

  const steps = getProgressiveCorrectionSteps({
    correctionMode: exercice.correctionMode,
    presentationMode,
    correction
  });
  const container = document.getElementById("feedback");
  if (steps && container) {
    progressiveCorrectionPlayer = createProgressiveCorrectionPlayer({
      container,
      steps,
      beforeRender({ isLastStep }) {
        // Reconstruire le QCM retire le vert lors d'un retour en arrière.
        // La bonne proposition n'est révélée qu'à la conclusion.
        if (correction.answerMode === "qcm") {
          renderCorrectionQuestion({
            correction,
            index: currentCorrectionIndex,
            total: userAnswers.length
          });
          if (isLastStep) renderCorrectionAnswer(correction);
        }
      }
    });
    progressiveCorrectionPlayer.start({ atEnd });
  } else {
    renderCorrectionAnswer(correction);
  }

  correctionStep = "answer";
}

function showCompleteCorrection() {
  if (inCorrectionMode && presentationMode === "slideshow" && correctionStep === "answer") {
    progressiveCorrectionPlayer?.showAll();
  }
}

function advanceCorrectionStep() {
  if (!inCorrectionMode) return;
  if (progressiveCorrectionPlayer?.next()) return;
  advanceCorrectionProgress({
    inCorrectionMode,
    correctionStep,
    currentCorrectionIndex,
    correctionCount:
      userAnswers.length,

    setCurrentCorrectionIndex:
      (value) => {
        currentCorrectionIndex =
          value;
      },

    onDisplayCorrectionAnswer:
      displayCorrectionAnswer,

    onDisplayCorrectionQuestion:
      displayCorrectionQuestion,

    onShowFinalScore:
      showFinalScore
  });
}

function previousCorrectionStep() {
  if (inCorrectionMode && progressiveCorrectionPlayer?.previous()) return;
  if (
    correctionStep === "final"
  ) {
    const lastCorrectionIndex =
      userAnswers.length - 1;

    currentCorrectionIndex =
      lastCorrectionIndex;

    inCorrectionMode = true;

    restoreCorrectionScreen({
      correctionIndex:
        lastCorrectionIndex,

      correctionCount:
        userAnswers.length
    });

    displayCorrectionQuestion();
    displayCorrectionAnswer({ atEnd: true });

    return;
  }

  previousCorrectionProgress({
    inCorrectionMode,
    correctionStep,
    currentCorrectionIndex,

    setCurrentCorrectionIndex:
      (value) => {
        currentCorrectionIndex =
          value;
      },

    onDisplayCorrectionAnswer:
      () => displayCorrectionAnswer({ atEnd: true }),

    onDisplayCorrectionQuestion:
      displayCorrectionQuestion
  });
}

function showFinalScore() {
  disposeProgressiveCorrection();
  correctionStep = "final";

  completeCorrectionSession({
    score,
    selectedQuestionCount,
    presentationMode,

    setInCorrectionMode:
      (value) => {
        inCorrectionMode = value;
      },

    setWaitingForCorrectionStart:
      (value) => {
        waitingForCorrectionStart =
          value;
      },

    onDisplayFinalScore:
      displayFinalScore,

    onPrepareFinalScreen:
      prepareFinalScreen
  });
}

// Initialisation
function startExercises() {
  disposeProgressiveCorrection();
  inCorrectionMode = false;
  awaitingNextQuestion = false;
  correctionStep = "question";
  currentCorrectionIndex = 0;
  currentQuestionIndex = 0;
  score = 0;
  answeredCount = 0;
  userAnswers = [];

  if (answerMode === "mixed") {
    mixedModeDistribution =
      createMixedModeDistribution(
        selectedQuestionCount,
        selectedMixedQCMCount
      );
  } else {
    mixedModeDistribution = [];
  }

  const pauseButton =
    document.getElementById(
      "pause-timer"
    );

  if (pauseButton) {
    pauseButton.textContent =
      "Pause";

    pauseButton.style.display =
      presentationMode === "slideshow"
        ? "block"
        : "none";
  }

  startExerciseSession({
    exercice,
    selectedTime,

    onCloseCorrectionOverlay:
      closeCorrectionOverlay,

    onQuestionsReady(questions) {
      tableauSelectionne = questions;
      displayQuestion();
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  window.addEventListener("pagehide", disposeProgressiveCorrection);
  initializePage({
    title: exercice.title,
    onStart: startExercises,
    onRestart: () => {
      if (typeof exercice.generateQuestions === "function") {
        exercice.questions = exercice.generateQuestions();
      }
      startExercises();
    },
    onSubmit: checkAnswer,
    onNext: nextQuestion,
    onHideTimer: hideTimerImmediately
  });

  initializeAnswerInput({
    onSubmit: checkAnswer
  });

  initializeMathKeyboard();

  const exportEvaluationButton =
    document.getElementById(
      "export-evaluation"
    );

  if (exportEvaluationButton) {
    exportEvaluationButton.addEventListener(
      "click",
      () => {
        openExportDialog({
          onExport({
            exportType,
            includeCorrection
          }) {
            exportExercise({
              exercice,
              userAnswers,

              questions:
                tableauSelectionne.slice(
                  0,
                  selectedQuestionCount
                ),

              exportType,
              includeCorrection,
              answerMode,
              // La répartition appartient à la séance, pas au réglage actuel du curseur.
              questionAnswerModes: answerMode === "mixed"
                ? mixedModeDistribution.slice(0, selectedQuestionCount)
                : undefined
            });
          }
        });
      }
    );
  }

  const pauseButton =
    document.getElementById(
      "pause-timer"
    );

  if (pauseButton) {
    pauseButton.addEventListener(
      "click",
      () => {
        if (getIsPaused()) {
          resumeTimer();
        } else {
          pauseTimer();
        }

        pauseButton.textContent =
          getIsPaused()
            ? "Reprendre"
            : "Pause";
      }
    );
  }

  initializeKeyboardShortcuts({
    isProgressiveCorrectionContext() {
      return exercice.correctionMode === "progressive" &&
        presentationMode === "slideshow" &&
        (waitingForCorrectionStart || inCorrectionMode || correctionStep === "final");
    },
    isWaitingForCorrection() {
      return waitingForCorrectionStart;
    },

    isInCorrectionMode() {
      return inCorrectionMode;
    },

    isAwaitingNextQuestion() {
      return awaitingNextQuestion;
    },

    getPresentationMode() {
      return presentationMode;
    },

    onStartCorrections: startCorrectionsMode,
    onAdvanceCorrection: advanceCorrectionStep,
    onPreviousCorrection: previousCorrectionStep,
    onNextQuestion: nextQuestion,
    onShowCompleteCorrection: showCompleteCorrection,
    onSkipSlideshowQuestion() {
      if (!tableauSelectionne.length || answeredCount >= selectedQuestionCount) return;
      stopTimer();
      handleTimeUp();
    },

    clearAwaitingNextQuestion() {
      awaitingNextQuestion = false;
    },

    getCorrectionStep() {
      return correctionStep;
    }
  });

  initializeSliders({
    maxQuestionCount:
      exercice.questions.length,

    onTimeChange(value) {
      selectedTime = value;
    },

    onQuestionCountChange(value) {
      selectedQuestionCount = Math.min(value, exercice.questions.length);
      const counter = document.getElementById("question-counter");
      if (counter) {
        counter.textContent = `Question ${selectedQuestionCount > 0 ? 1 : 0}/${selectedQuestionCount}`;
      }
    },

    onMixedQCMCountChange(value) {
      selectedMixedQCMCount = value;
    }
  });

  initializeModeControls({
    initialAnswerMode: answerMode,
    initialPresentationMode: presentationMode,

    onAnswerModeChange(mode, shouldRedisplayQuestion) {
      answerMode = mode;

      displayAnswerMode(answerMode);

      if (
        shouldRedisplayQuestion &&
        tableauSelectionne &&
        tableauSelectionne.length > 0
      ) {
        displayQuestion();
      }
    },

    onPresentationModeChange(
      mode,
      shouldRedisplayQuestion
    ) {
      disposeProgressiveCorrection();
      presentationMode = mode;

      displayPresentationMode(presentationMode);



      if (
        shouldRedisplayQuestion &&
        tableauSelectionne &&
        tableauSelectionne.length > 0
      ) {
        displayQuestion();
      }
    }
  });

});
