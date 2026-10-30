// core/export/exportDialog.js

export function openExportDialog({
  onExport,

  showArchive =
    true
}) {
  const overlay =
    document.createElement(
      "div"
    );

  overlay.className =
    "export-dialog-overlay";

  overlay.innerHTML = `
    <div class="export-dialog">
      <h2>
        Exporter
      </h2>

      ${
        showArchive
          ? `
            <label>
              <input
                type="radio"
                name="export-type"
                value="archive"
                checked
              >
              Archive
            </label>
          `
          : ""
      }

      <label>
        <input
          type="radio"
          name="export-type"
          value="evaluation"
          ${showArchive ? "" : "checked"}
        >

        Évaluation
      </label>

      <div
        class="export-evaluation-options"
        ${showArchive ? "hidden" : ""}
      >
        <label>
          <input
            type="radio"
            name="evaluation-mode"
            value="statement"
            checked
          >

          Sujet
        </label>

        <label>
          <input
            type="radio"
            name="evaluation-mode"
            value="correction"
          >

          Sujet avec correction
        </label>
      </div>

      <div
        class="export-dialog-buttons"
      >
        <button
          type="button"
          data-action="cancel"
        >
          Annuler
        </button>

        <button
          type="button"
          data-action="export"
        >
          Exporter
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(
    overlay
  );

  const evaluationOptions =
    overlay.querySelector(
      ".export-evaluation-options"
    );

  const exportTypeInputs =
    overlay.querySelectorAll(
      'input[name="export-type"]'
    );

  exportTypeInputs.forEach(
    input => {
      input.addEventListener(
        "change",
        () => {
          evaluationOptions.hidden =
            input.value !==
            "evaluation";
        }
      );
    }
  );

  const cancelButton =
    overlay.querySelector(
      '[data-action="cancel"]'
    );

  const exportButton =
    overlay.querySelector(
      '[data-action="export"]'
    );

  cancelButton.addEventListener(
    "click",
    () => {
      overlay.remove();
    }
  );

  exportButton.addEventListener(
    "click",
    () => {
      const exportType =
        overlay.querySelector(
          'input[name="export-type"]:checked'
        )?.value;

      const evaluationMode =
        overlay.querySelector(
          'input[name="evaluation-mode"]:checked'
        )?.value;

      onExport({
        exportType,

        includeCorrection:
          exportType ===
            "evaluation" &&
          evaluationMode ===
            "correction"
      });

      overlay.remove();
    }
  );
}