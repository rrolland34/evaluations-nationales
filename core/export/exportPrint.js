// core/export/exportPrint.js

export function initializeExportPrint({
  archiveWindow
}) {
  const printButton =
    archiveWindow.document.getElementById(
      "print-evaluation"
    );

  if (
    !printButton
  ) {
    return null;
  }

  printButton.disabled =
    true;

  printButton.textContent =
    "Préparation du document...";

  printButton.addEventListener(
    "click",
    () => {
      if (!printButton.disabled && archiveWindow.document.documentElement.hasAttribute("data-export-ready")) {
        archiveWindow.print();
      }
    }
  );

  return printButton;
}