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
      archiveWindow.print();
    }
  );

  return printButton;
}