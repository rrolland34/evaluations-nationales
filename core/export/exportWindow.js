// core/export/exportWindow.js

import {
  getExportStyles
} from "./exportStyles.js";

export function createExportWindow({
  title,
  currentDate,
  evaluationContent
}) {
  const archiveWindow =
    window.open(
      "",
      "_blank"
    );

  if (
    !archiveWindow
  ) {
    return null;
  }

  archiveWindow.document.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8">

      <title>
        Évaluation
      </title>

      <style>
        ${getExportStyles()}
      </style>
    </head>

    <body>
      <header class="evaluation-header">
        <h1>
          ${title}
        </h1>

        <p class="evaluation-date">
          ${currentDate}
        </p>
      </header>

      <button
        id="print-evaluation"
        type="button"
        style="
          margin-bottom:30px;
          padding:10px 18px;
          font-size:1rem;
          cursor:pointer;
        "
      >
        Imprimer / Enregistrer en PDF
      </button>

      ${evaluationContent}
    </body>
  `;

  return archiveWindow;
}