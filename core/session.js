// core/session.js

import { melangerTableau }
  from "./tableaux.js";

import {
  showTimer,
  stopTimer
} from "./timer.js";

import { setModeButtonsDisabled }
  from "./modes.js";

export function startExerciseSession({
  exercice,
  selectedTime,
  onCloseCorrectionOverlay,
  onQuestionsReady,
  isolateQuestions = false
}) {
  const questionCounter =
    document.getElementById("question-counter");

  if (questionCounter) {
    questionCounter.style.display = "";
  }

  onCloseCorrectionOverlay();
  stopTimer();

  // Désactiver le curseur de temps
  // une fois la session démarrée
  const sliderOnStart =
    document.getElementById("time-slider");

  if (sliderOnStart) {
    sliderOnStart.disabled = true;
  }

  // Désactiver le curseur du nombre de questions
  // une fois la session démarrée
  const questionCountSliderOnStart =
    document.getElementById("question-count-slider");

  if (questionCountSliderOnStart) {
    questionCountSliderOnStart.disabled = true;
  }

  // Afficher le timer quand on démarre
  showTimer();

  // Désactiver les boutons de mode
  setModeButtonsDisabled(true);

  let tableauSelectionne =

    exercice.shuffle === false

      ? [...exercice.questions]

      : melangerTableau(
          exercice.questions
        );

  // Les propriétés complètes sont conservées ; seuls les états du lecteur sont isolés.
  tableauSelectionne = tableauSelectionne.map(q => {
    const question = { ...q };
    delete question.qcmAnswersOrder;
    return question;
  });

  // Donner priorité à la durée propre à la question,
  // sinon utiliser la durée sélectionnée par l'utilisateur.
  if (Array.isArray(tableauSelectionne)) {
    tableauSelectionne.forEach(q => {
      q.time = q.duration ?? selectedTime;
    });
  }

  // Mettre à jour le titre
  document.querySelector(".question-title").textContent =
    exercice.title;

  const resultEl =
    document.getElementById("result");

  if (resultEl) {
    resultEl.innerHTML = "";
  }

  const submit =
    document.getElementById("submit");

  const next =
    document.getElementById("next");

  if (submit) {
    submit.disabled = false;
  }

  if (next) {
    next.disabled = false;
  }

  const startBtn =
    document.getElementById("start");

  if (startBtn) {
    startBtn.style.display = "none";
  }

  const restartBtn =
    document.getElementById("restart");

  if (restartBtn) {
    restartBtn.style.display = "none";
  }

  onQuestionsReady(tableauSelectionne);
}
