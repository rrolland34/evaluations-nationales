// core/export/exportWindow.js

import {
  getExportStyles
} from "./exportStyles.js";

export async function createExportWindow({
  title,
  currentDate,
  evaluationContent,
  existingWindow = null
}) {
  const shellURL = new URL("./exportShell.html", import.meta.url);
  let archiveWindow = existingWindow;
  // Écouter dans la fenêtre principale : une navigation détruit les écouteurs
  // du document précédent, en particulier lors d'une nouvelle tentative.
  await new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener("message", loaded);
    };
    const loaded = event => {
      if (event.source !== archiveWindow || event.origin !== shellURL.origin ||
          event.data !== "math-export-shell-ready") return;
      cleanup(); resolve();
    };
    const timeout = setTimeout(() => {
      cleanup(); reject(new Error("La fenêtre d'export ne répond pas (15 secondes)."));
    }, 15000);
    window.addEventListener("message", loaded);
    try {
      if (existingWindow) existingWindow.location.replace(shellURL.href);
      else archiveWindow = window.open(shellURL.href, "_blank");
      if (!archiveWindow) { cleanup(); resolve(); }
    } catch (error) { cleanup(); reject(error); }
  }).catch(error => {
    error.exportWindow = archiveWindow;
    throw error;
  });
  if (!archiveWindow) return null;

  archiveWindow.document.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8">

      <title>
        Évaluation
      </title>

      <style>
        ${getExportStyles()}
        @media print {
          html:not([data-export-ready]) body > :not(#export-status) { display: none !important; }
          #export-retry { display: none !important; }
          html[data-export-ready] #export-status { display: none !important; }
        }
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

      <p id="export-status" role="status">Préparation du document…</p>
      ${evaluationContent}
    </body>
  `;

  return archiveWindow;
}