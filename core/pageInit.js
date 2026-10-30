// core/pageInit.js

export function initializePage({
  title,
  onStart,
  onRestart,
  onSubmit,
  onNext,
  onHideTimer
}) {
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");
  const submitBtn = document.getElementById("submit");
  const nextBtn = document.getElementById("next");

  if (submitBtn) {
    submitBtn.addEventListener("click", onSubmit);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", onNext);
  }

  // Cacher le timer tant que l'utilisateur
  // n'a pas cliqué sur Start
  onHideTimer();

  if (restartBtn) {
    restartBtn.style.display = "none";
    restartBtn.addEventListener("click", onRestart);
  }

  const questionTitleEl =
    document.querySelector(".question-title");

  if (questionTitleEl) {
    questionTitleEl.textContent = title;
  }

  if (startBtn) {
    startBtn.addEventListener("click", onStart);
  } else {
    onStart();
  }
}