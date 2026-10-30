// core/export/exportCartesianFigures.js

import {
  displayCartesianPoint,
  displayCartesianPoints,
  highlightCartesianQCMPoints
} from "../cartesianPointSelection.js";

export function renderExportCartesianFigures({
  archiveWindow,
  userAnswers
}) {
  userAnswers.forEach(
    (
      correction,
      index
    ) => {
      if (
        !correction.figureConfig
      ) {
        return;
      }

      const questionContainer =
        archiveWindow.document.querySelector(
          `[data-question-index="${index}"]`
        );

      const svg =
        questionContainer?.querySelector(
          ".cartesian-plane"
        );

      if (!svg) {
        return;
      }

      /*
       * Lecture de coordonnées :
       * le point donné apparaît
       * dans le repère.
       */

      if (
        correction.givenPoint
      ) {
        displayCartesianPoint({
          svg,

          point:
            correction.givenPoint,

          width:
            correction.figureConfig.width,

          height:
            correction.figureConfig.height,

          range:
            correction.figureConfig.range,

          padding:
            correction.figureConfig.padding,

          name:
            correction.givenPoint.name,

          color:
            "currentColor"
        });

        return;
      }

      /*
       * Placement d'un point :
       * la solution apparaît
       * en rouge.
       */

      if (
        correction.answerMode === "point" &&
        correction.correctAnswer
      ) {
        displayCartesianPoint({
          svg,

          point:
            correction.correctAnswer,

          width:
            correction.figureConfig.width,

          height:
            correction.figureConfig.height,

          range:
            correction.figureConfig.range,

          padding:
            correction.figureConfig.padding,

          name:
            correction.correctAnswer.name,

          color:
            "red"
        });

        return;
      }

      /*
       * QCM graphique :
       * les quatre points apparaissent
       * et la bonne réponse est verte.
       */

      if (
        correction.answerMode === "qcm" &&
        Array.isArray(
          correction.qcmPoints
        )
      ) {
        displayCartesianPoints({
          svg,

          points:
            correction.qcmPoints,

          width:
            correction.figureConfig.width,

          height:
            correction.figureConfig.height,

          range:
            correction.figureConfig.range,

          padding:
            correction.figureConfig.padding
        });

        highlightCartesianQCMPoints({
          svg,

          selectedPoint:
            null,

          correctPoint:
            correction.correctAnswer
        });
      }
    }
  );
}