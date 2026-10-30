// core/questionControls.js

import { displayQCMOptions }
  from "./qcm.js";

export function configureQuestionControls({
  question,
  answerMode,
  presentationMode,
  onQCMSelection
}) {
  // Gérer la visibilité des contrôles
  // selon le mode de présentation
  const submitBtn =
    document.getElementById("submit");

  const nextBtn =
    document.getElementById("next");

  if (presentationMode === "slideshow") {
    // En diaporama : cacher les boutons
    // mais garder l'input
    if (submitBtn) {
      submitBtn.style.display = "none";
    }

    if (nextBtn) {
      nextBtn.style.display = "none";
    }
  } else {
    // En mode réponse : afficher submit,
    // masquer next jusqu'à validation
    if (submitBtn) {
      submitBtn.style.display = "inline-block";
    }

    if (nextBtn) {
      nextBtn.style.display = "none";
    }
  }

  const userAnswerInput =
    document.getElementById("user-answer");

  const multiAnswerContainer =
    document.getElementById(
      "multi-answer-container"
    );

  multiAnswerContainer.classList.remove(
    "proportionality-answer-fields"
  );

  if (
    question.answerFieldsClass
  ) {
    multiAnswerContainer.classList.add(
      question.answerFieldsClass
    );
  }

  const qcmOptions =
    document.getElementById("qcm-options");

  if (
    Array.isArray(
      question.answerFields
    ) &&
    question.answerFields.length > 0
  ) {
    multiAnswerContainer.innerHTML =
      question.answerFields
        .map(
          (
            field,
            index
          ) => {

            if (
              field.type ===
              "select"
            ) {
              return `
                <label>
                  ${field.label}

                  <select
                    class="multi-answer-input"
                    data-index="${index}"
                  >
                    <option
                      value=""
                      selected
                    >
                      Choisir...
                    </option>

                    ${
                      field.options
                        .map(
                          option => `
                            <option
                              value="${option.value}"
                            >
                              ${option.label}
                            </option>
                          `
                        )
                        .join("")
                    }
                  </select>
                </label>
              `;
            }

            return `
              <label>
                ${field.label}

                <input
                  type="text"
                  class="multi-answer-input"
                  data-index="${index}"
                >
              </label>
            `;
          }
        )
        .join("");

    multiAnswerContainer
      .querySelectorAll(
        ".multi-answer-input"
      )
      .forEach(input => {
        input.addEventListener(
          "keydown",
          event => {
            if (event.key !== "Enter") {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (event.shiftKey) return;

            const submitBtn =
              document.getElementById(
                "submit"
              );

            const nextBtn =
              document.getElementById(
                "next"
              );

            if (
              nextBtn &&
              nextBtn.style.display !== "none"
            ) {
              nextBtn.click();
              return;
            }

            if (
              submitBtn &&
              submitBtn.style.display !== "none"
            ) {
              submitBtn.click();
            }
          }
        );
      });
  } else {
    multiAnswerContainer.innerHTML = "";
  }

  if (
    presentationMode === "response" &&
    answerMode === "direct"
  ) {
    // Mode réponse directe
    // en mode réponse
    if (
      Array.isArray(question.answerFields) &&
      question.answerFields.length > 0
    ) {
      userAnswerInput.style.display = "none";

      multiAnswerContainer.style.display =
        "flex";

      const firstInput =
        multiAnswerContainer.querySelector(
          ".multi-answer-input"
        );

      if (firstInput) {
        firstInput.focus();
      }
    } else {
      multiAnswerContainer.style.display =
        "none";

      userAnswerInput.style.display = "block";
      userAnswerInput.value = "";
      userAnswerInput.disabled = false;
      userAnswerInput.focus();
    }

    qcmOptions.style.display = "none";

  } else if (
    presentationMode === "response" &&
    answerMode === "qcm" &&
    !Array.isArray(
      question.qcmPoints
    )
  ) {
    /*
    * QCM classique
    * en mode réponse.
    */

    userAnswerInput.style.display =
      "none";

    multiAnswerContainer.style.display =
      "none";

    qcmOptions.style.display =
      "block";

    displayQCMOptions(
      question,
      false,
      onQCMSelection
    );

  } else if (
    presentationMode === "slideshow" &&
    answerMode === "qcm"
  ) {
    userAnswerInput.style.display = "none";

    multiAnswerContainer.style.display =
      "none";

    if (
      Array.isArray(
        question.qcmPoints
      )
    ) {
      /*
      * QCM graphique :
      * les propositions sont déjà
      * affichées dans le repère.
      */

      qcmOptions.style.display =
        "none";

    } else {
      /*
      * QCM classique :
      * afficher les propositions
      * désactivées.
      */

      qcmOptions.style.display =
        "block";

      displayQCMOptions(
        question,
        true
      );
    }

  } else if (
    answerMode === "point"
  ) {
    /*
    * Réponse graphique :
    * le repère sert directement
    * de zone de réponse.
    */

    userAnswerInput.style.display = "none";

    multiAnswerContainer.style.display =
      "none";

    qcmOptions.style.display = "none";

  } else {
    // Mode diaporama direct : rien
    userAnswerInput.style.display = "none";

    multiAnswerContainer.style.display =
      "none";

    qcmOptions.style.display = "none";
  }
}
