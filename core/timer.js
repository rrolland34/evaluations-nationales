// core/timer.js

let timerInterval = null;
let timerGeneration = 0;
let timeLeft = 0;

let timerCallback = null;
let isPaused = false;


/**
 * Affiche le timer avec son animation.
 */
export function showTimer() {
  const timerElement =
    document.getElementById("timer");

  if (!timerElement) {
    return;
  }

  timerElement.style.display = "block";

  requestAnimationFrame(() => {
    timerElement.classList.add("visible");
  });
}


/**
 * Masque le timer avec son animation.
 */
export function hideTimer() {
  const timerElement =
    document.getElementById("timer");

  if (!timerElement) {
    return;
  }

  timerElement.classList.remove("visible");

  timerElement.addEventListener(
    "transitionend",
    () => {
      if (
        !timerElement.classList.contains(
          "visible"
        )
      ) {
        timerElement.style.display =
          "none";
      }
    },
    { once: true }
  );
}


/**
 * Masque immédiatement le timer,
 * sans attendre l'animation.
 */
export function hideTimerImmediately() {
  const timerElement =
    document.getElementById("timer");

  if (!timerElement) {
    return;
  }

  timerElement.classList.remove("visible");
  timerElement.style.display = "none";
}


/**
 * Arrête uniquement l'intervalle
 * du compte à rebours.
 */
function clearTimerInterval() {
  timerGeneration++;
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}


/**
 * Lance le compte à rebours
 * à partir de la valeur actuelle
 * de timeLeft.
 */
function startTimerInterval() {
  clearTimerInterval();
  const generation = timerGeneration;

  timerInterval = setInterval(() => {
    if (generation !== timerGeneration) return;
    timeLeft -= 1;

    updateTimerDisplay();

    if (timeLeft <= 0) {
      stopTimer();

      executeTimeUpCallback(
        timerCallback
      );
    }
  }, 1000);
}


/**
 * Arrête le compte à rebours en cours.
 */
export function stopTimer() {
  clearTimerInterval();

  isPaused = false;
}


/**
 * Met le compte à rebours en pause
 * sans modifier le temps restant.
 */
export function pauseTimer() {
  if (timerInterval === null) {
    return;
  }

  clearTimerInterval();

  isPaused = true;
}


/**
 * Reprend le compte à rebours
 * là où il avait été interrompu.
 */
export function resumeTimer() {
  if (
    !isPaused ||
    timeLeft <= 0 ||
    timerInterval !== null
  ) {
    return;
  }

  isPaused = false;

  startTimerInterval();
}


/**
 * Démarre ou redémarre
 * le compte à rebours.
 *
 * @param {number} seconds
 * Durée en secondes.
 *
 * @param {Function} onTimeUp
 * Fonction appelée lorsque
 * le temps est écoulé.
 */
export function resetTimer(
  seconds,
  onTimeUp
) {
  stopTimer();

  timerCallback = onTimeUp;

  const parsedSeconds =
    Number(seconds);

  timeLeft =
    Number.isFinite(
      parsedSeconds
    ) &&
    parsedSeconds > 0
      ? Math.floor(
          parsedSeconds
        )
      : 0;

  updateTimerDisplay();

  if (timeLeft <= 0) {
    executeTimeUpCallback(
      timerCallback
    );

    return;
  }

  startTimerInterval();
}


/**
 * Retourne le temps restant.
 */
export function getTimeLeft() {
  return timeLeft;
}


/**
 * Indique si le timer
 * est actuellement en pause.
 */
export function getIsPaused() {
  return isPaused;
}


function updateTimerDisplay() {
  const timerElement =
    document.getElementById("timer");

  if (timerElement) {
    timerElement.textContent =
      String(timeLeft);
  }
}


function executeTimeUpCallback(
  callback
) {
  if (
    typeof callback === "function"
  ) {
    callback();
  }
}
