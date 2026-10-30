// core/export/exportMathJax.js

// Une seule tentative par document, même après un échec : retirer un script
// ne suffit pas à annuler les chargements internes ou les promesses de MathJax.
const exportMathJaxDocuments = new WeakSet();

export function loadExportMathJax({ archiveWindow, printButton }) {
  const document = archiveWindow.document;
  if (exportMathJaxDocuments.has(document)) {
    return;
  }
  exportMathJaxDocuments.add(document);

  if (printButton) {
    printButton.disabled = true;
    printButton.textContent = "Préparation du document...";
  }

  const mathJaxScript = document.createElement("script");
  mathJaxScript.src =
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

  let settled = false;
  let timeout;

  function cleanup() {
    archiveWindow.clearTimeout(timeout);
    mathJaxScript.onload = null;
    mathJaxScript.onerror = null;
    archiveWindow.removeEventListener("pagehide", onPageHide);
  }

  function onPageHide() {
    settled = true;
    cleanup();
  }

  function fail(message, error) {
    if (settled) return;
    settled = true;
    cleanup();
    if (printButton) {
      printButton.disabled = true;
      printButton.textContent = "Impression indisponible";
    }
    const notice = document.createElement("p");
    notice.setAttribute("role", "alert");
    notice.textContent = `${message} L'impression reste désactivée. Fermez cette fenêtre puis relancez l'export pour réessayer.`;
    if (printButton) {
      printButton.insertAdjacentElement("afterend", notice);
    } else {
      document.body.appendChild(notice);
    }
    console.error("Erreur MathJax dans l'export :", error || message);
  }

  mathJaxScript.onerror = () => {
    fail("Impossible de télécharger MathJax. Vérifiez votre connexion ou le filtrage réseau.");
  };

  mathJaxScript.onload = async () => {
    if (settled) return;
    // Un éventuel second événement load ne doit pas lancer une autre attente.
    mathJaxScript.onload = null;
    try {
      const mathJax = archiveWindow.MathJax;
      if (!mathJax || typeof mathJax.startup?.promise?.then !== "function") {
        throw new Error("MathJax ou sa promesse d'initialisation est absent.");
      }

      // Le contenu est déjà présent et le démarrage standard de MathJax 3
      // compose la page. Cette promesse inclut la composition initiale :
      // un second typesetPromise() serait redondant.
      await mathJax.startup.promise;
      if (settled) return;

      // MathJax peut afficher une erreur de formule sans rejeter sa promesse.
      if (document.querySelector("mjx-merror, [data-mjx-error]")) {
        throw new Error("Une formule n'a pas pu être composée.");
      }
      settled = true;
      cleanup();
      if (printButton) {
        printButton.disabled = false;
        printButton.textContent = "Imprimer / Enregistrer en PDF";
      }
    } catch (error) {
      fail("La préparation des formules mathématiques a échoué.", error);
    }
  };

  archiveWindow.addEventListener("pagehide", onPageHide);
  timeout = archiveWindow.setTimeout(() => {
    fail("La préparation des formules dépasse le délai maximal de 15 secondes.");
  }, 15000);

  try {
    document.head.appendChild(mathJaxScript);
  } catch (error) {
    fail("Impossible de charger MathJax dans cette fenêtre.", error);
  }
}
