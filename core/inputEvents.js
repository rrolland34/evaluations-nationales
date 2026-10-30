// core/inputEvents.js

export function initializeAnswerInput({
  onSubmit
}) {
  const userAnswerInput =
    document.getElementById("user-answer");

  if (userAnswerInput) {
    userAnswerInput.addEventListener(
      "keydown",
      function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          if (event.shiftKey) return;
          onSubmit();
        }
      }
    );
  }
}
