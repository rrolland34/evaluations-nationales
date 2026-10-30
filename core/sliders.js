// core/sliders.js

export function initializeSliders({
  onTimeChange,
  onQuestionCountChange,
  onMixedQCMCountChange,
  maxQuestionCount
}) {
  // Liaison du curseur de temps
  const slider = document.getElementById("time-slider");
  const timeValue = document.getElementById("time-value");

  if (slider && timeValue) {
    const selectedTime = parseInt(slider.value, 10);

    onTimeChange(selectedTime);
    timeValue.textContent = String(selectedTime);

    slider.addEventListener("input", function(e) {
      const selectedTime = parseInt(e.target.value, 10);

      onTimeChange(selectedTime);
      timeValue.textContent = String(selectedTime);
    });
  }

  // Liaison du curseur du nombre de questions
  const questionCountSlider =
    document.getElementById("question-count-slider");

  if (questionCountSlider) {
    questionCountSlider.max =
      String(maxQuestionCount);
  }

  // Liaison du curseur du nombre de QCM en mode Mixte
  const mixedQCMSlider =
    document.getElementById(
      "mixed-qcm-slider"
    );

  const mixedQCMValue =
    document.getElementById(
      "mixed-qcm-value"
    );

  if (
    mixedQCMSlider &&
    mixedQCMValue &&
    questionCountSlider
  ) {
    const updateMixedSliderMax =
      () => {
        const selectedQuestionCount =
          parseInt(
            questionCountSlider.value,
            10
          );

        mixedQCMSlider.max =
          String(
            selectedQuestionCount
          );

        const currentMixedValue =
          parseInt(
            mixedQCMSlider.value,
            10
          );

        if (
          currentMixedValue >
          selectedQuestionCount
        ) {
          mixedQCMSlider.value =
            String(
              selectedQuestionCount
            );
        }

        const mixedQCMCount =
          parseInt(
            mixedQCMSlider.value,
            10
          );

        mixedQCMValue.textContent =
          String(mixedQCMCount);

        onMixedQCMCountChange(
          mixedQCMCount
        );
      };

    updateMixedSliderMax();

    mixedQCMSlider.addEventListener(
      "input",
      function(e) {
        const mixedQCMCount =
          parseInt(
            e.target.value,
            10
          );

        onMixedQCMCountChange(
          mixedQCMCount
        );

        mixedQCMValue.textContent =
          String(mixedQCMCount);
      }
    );

    questionCountSlider.addEventListener(
      "input",
      updateMixedSliderMax
    );
  }

  const questionCountValue =
    document.getElementById("question-count-value");

  if (questionCountSlider && questionCountValue) {
    const selectedQuestionCount = Math.min(
      parseInt(questionCountSlider.value, 10),
      maxQuestionCount
    );

    questionCountSlider.value =
      String(selectedQuestionCount);

    onQuestionCountChange(selectedQuestionCount);
    questionCountValue.textContent =
      String(selectedQuestionCount);

    questionCountSlider.addEventListener("input", function(e) {
      const selectedQuestionCount =
        parseInt(e.target.value, 10);

      onQuestionCountChange(selectedQuestionCount);
      questionCountValue.textContent =
        String(selectedQuestionCount);
    });
  }
}