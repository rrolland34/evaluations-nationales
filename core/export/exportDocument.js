// core/export/exportDocument.js

import {
  createExportWindow
} from "./exportWindow.js";

import {
  initializeExportPrint
} from "./exportPrint.js";

import {
  loadExportMathJax
} from "./exportMathJax.js";

export async function exportDocument({
  title,
  content,
  afterRender
}) {
  const currentDate =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric"
      }
    ).format(
      new Date()
    );

  async function prepare(existingWindow = null) {
    let archiveWindow = existingWindow;
    try {
      archiveWindow = await createExportWindow({
        title, currentDate, evaluationContent: content, existingWindow
      });
      if (!archiveWindow) return null;
      const printButton = initializeExportPrint({ archiveWindow });
      if (typeof afterRender === "function") await afterRender({ archiveWindow });
      await loadExportMathJax({ archiveWindow, printButton, onRetry: () => prepare(archiveWindow) });
      return archiveWindow;
    } catch (error) {
      archiveWindow ||= error.exportWindow;
      console.error("Création de l'export :", error);
      if (archiveWindow && !archiveWindow.closed) {
        archiveWindow.document.documentElement.removeAttribute("data-export-ready");
        const button = archiveWindow.document.getElementById("print-evaluation");
        if (button) button.disabled = true;
        const notice = archiveWindow.document.getElementById("export-status") || archiveWindow.document.createElement("p");
        notice.id = "export-status";
        notice.setAttribute("role", "alert");
        notice.textContent = "Impossible de préparer l'export. Vérifiez l'accès aux ressources du site puis réessayez.";
        archiveWindow.document.body.appendChild(notice);
        const retry = archiveWindow.document.createElement("button");
        retry.id = "export-retry";
        retry.textContent = "Réessayer la préparation";
        retry.addEventListener("click", () => {
          retry.disabled = true;
          prepare(archiveWindow);
        }, { once: true });
        archiveWindow.document.body.appendChild(retry);
      }
      return null;
    }
  }
  return prepare();
}
