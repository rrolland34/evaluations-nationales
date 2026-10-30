// core/exerciseButtons.js

import {
  getExerciseTitle
} from "./exerciseLoader.js";

const buttons =
  document.querySelectorAll(
    "[data-exercise]"
  );

for (const button of buttons) {
  const exerciseName =
    button.dataset.exercise;

  button.textContent =
    getExerciseTitle(
      exerciseName
    );
}