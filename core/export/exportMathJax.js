// Une préparation par document ; toute nouvelle tentative utilise une navigation.
const preparations = new WeakMap();
export const EXPORT_MATHJAX_URL = new URL("../../assets/vendor/mathjax-3.2.2/es5/tex-mml-chtml.js", import.meta.url).href;

export function loadExportMathJax({ archiveWindow, printButton, onRetry, timeoutMs = 20000 }) {
  const document = archiveWindow.document;
  if (preparations.has(document)) return preparations.get(document);
  const promise = new Promise(resolve => {
    let settled = false;
    const status = document.getElementById("export-status");
    const script = document.createElement("script");
    const cleanup = () => {
      archiveWindow.clearTimeout(timeout);
      script.onload = script.onerror = null;
      archiveWindow.removeEventListener("pagehide", onPageHide);
    };
    const finish = (ready, error) => {
      if (settled) return;
      settled = true;
      cleanup();
      printButton.disabled = !ready;
      printButton.textContent = ready ? "Imprimer / Enregistrer en PDF" : "Impression indisponible";
      if (ready) {
        document.documentElement.setAttribute("data-export-ready", "");
        if (status) status.textContent = "Document prêt à imprimer.";
      } else {
        if (status) {
          status.setAttribute("role", "alert");
          status.textContent = "La préparation du document a échoué. Vérifiez que les ressources du site sont accessibles, puis réessayez. Aucune formule non composée ne sera imprimée.";
        }
        if (onRetry) {
          const retry = document.createElement("button");
          retry.id = "export-retry";
          retry.type = "button";
          retry.textContent = "Réessayer la préparation";
          retry.addEventListener("click", () => {
            retry.disabled = true;
            onRetry();
          }, { once: true });
          printButton.insertAdjacentElement("afterend", retry);
        }
        console.error("Préparation de l'export :", error);
      }
      resolve(ready);
    };
    const onPageHide = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(false);
    };
    const timeout = archiveWindow.setTimeout(() => finish(false, new Error("Délai maximal de préparation dépassé.")), timeoutMs);
    document.documentElement.removeAttribute("data-export-ready");
    printButton.disabled = true;
    printButton.textContent = "Préparation du document…";
    archiveWindow.addEventListener("pagehide", onPageHide);
    // Pas de composition automatique concurrente, ni de ressources CDN implicites.
    const root = new URL("./", EXPORT_MATHJAX_URL).href;
    archiveWindow.MathJax = {
      loader: { paths: { mathjax: root } },
      startup: { typeset: false },
      chtml: { fontURL: new URL("output/chtml/fonts/woff-v2", root).href },
      tex: { formatError(_jax, error) { throw error; } }
    };
    script.src = EXPORT_MATHJAX_URL;
    script.onerror = () => finish(false, new Error("Chargement de MathJax impossible."));
    script.onload = async () => {
      script.onload = null;
      try {
        const mathJax = archiveWindow.MathJax;
        if (!mathJax?.startup?.promise?.then) throw new Error("Initialisation MathJax absente.");
        await mathJax.startup.promise;
        if (settled) return;
        if (typeof mathJax.typesetPromise !== "function") throw new Error("Composition MathJax indisponible.");
        await mathJax.typesetPromise([document.body]);
        if (settled) return;
        if (document.querySelector("mjx-merror, [data-mjx-error]")) throw new Error("Formule invalide.");
        // MathJax peut ignorer un bloc aux accolades déséquilibrées sans
        // produire de mjx-merror. Refuser aussi ces délimiteurs restés bruts.
        const textNodes = document.createTreeWalker(document.body, 4);
        let node;
        while ((node = textNodes.nextNode())) {
          if (node.parentElement?.closest("mjx-container, script, style, pre, code")) continue;
          if (/\\[()[\]]|\$\$/.test(node.nodeValue)) throw new Error("Une formule est restée non composée.");
        }
        if (document.querySelector("math:not(mjx-assistive-mml math)")) throw new Error("Une formule MathML est restée non composée.");
        // La composition déclenche les chargements de polices CHTML nécessaires.
        await document.fonts.ready;
        if ([...document.fonts].some(font => font.status === "error")) throw new Error("Police indisponible.");
        await Promise.all([...document.images].map(image => image.decode()));
        if (!settled) finish(true);
      } catch (error) { finish(false, error); }
    };
    try { document.head.appendChild(script); }
    catch (error) { finish(false, error); }
  });
  preparations.set(document, promise);
  return promise;
}
