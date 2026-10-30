// core/mathKeyboard.js

function insertAtCursor(
  inputElement,
  text
) {
  const selectionStart =
    inputElement.selectionStart ??
    inputElement.value.length;

  const selectionEnd =
    inputElement.selectionEnd ??
    selectionStart;

  inputElement.value =
    inputElement.value.slice(
      0,
      selectionStart
    ) +
    text +
    inputElement.value.slice(
      selectionEnd
    );

  const newCursorPosition =
    selectionStart +
    text.length;

  inputElement.setSelectionRange(
    newCursorPosition,
    newCursorPosition
  );

  inputElement.focus();
}

export function initializeMathKeyboard() {

  let lastAnswerInput =
    document.getElementById(
      "user-answer"
    );

  document.addEventListener(
    "focusin",
    event => {

      const target =
        event.target;

      if (
        target.id ===
        "user-answer" ||
        (
          target.classList?.contains(
            "multi-answer-input"
          ) &&
          (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA"
          )
        )
      ) {
        lastAnswerInput =
          target;
      }
    }
  );

  const piButton =
    document.getElementById(
      "math-key-pi"
    );

  const powerButton =
    document.getElementById(
      "math-key-power"
    );

  const notEqualButton =
    document.getElementById(
      "math-key-not-equal"
    );

  if (
    !piButton ||
    !powerButton ||
    !notEqualButton
  ) {
    return;
  }

  piButton.addEventListener(
    "click",
    () => {

      if (
        lastAnswerInput
      ) {
        insertAtCursor(
          lastAnswerInput,
          "π"
        );
      }
    }
  );

  powerButton.addEventListener(
    "click",
    () => {

      if (
        lastAnswerInput
      ) {
        insertAtCursor(
          lastAnswerInput,
          "^"
        );
      }
    }
  );

  notEqualButton.addEventListener(
    "click",
    () => {

      if (
        lastAnswerInput
      ) {
        insertAtCursor(
          lastAnswerInput,
          "≠"
        );
      }
    }
  );
}

export function updateMathKeyboard(
  question,
  answerMode,
  presentationMode
) {
  const mathKeyboard =
    document.getElementById(
      "math-keyboard"
    );

  const piButton =
    document.getElementById(
      "math-key-pi"
    );

  const powerButton =
    document.getElementById(
      "math-key-power"
    );

  const notEqualButton =
    document.getElementById(
      "math-key-not-equal"
    );

  if (
    !mathKeyboard ||
    !piButton ||
    !powerButton ||
    !notEqualButton
  ) {
    return;
  }

  const inputTools =
    question?.inputTools ?? [];

  const showPiButton =
    answerMode === "direct" &&
    presentationMode === "response" &&
    inputTools.includes("pi");

  const showPowerButton =
    answerMode === "direct" &&
    presentationMode === "response" &&
    inputTools.includes("power");

  const showNotEqualButton =
    answerMode === "direct" &&
    presentationMode === "response" &&
    inputTools.includes(
      "notEqual"
    );

  piButton.style.display =
    showPiButton
      ? "inline-block"
      : "none";

  powerButton.style.display =
    showPowerButton
      ? "inline-block"
      : "none";

  notEqualButton.style.display =
    showNotEqualButton
      ? "inline-block"
      : "none";

  mathKeyboard.style.display =

    showPiButton ||
    showPowerButton ||
    showNotEqualButton

      ? "flex"
      : "none";
}