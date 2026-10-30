import { renderMath, clearMath } from "./mathRendering.js";
// core/stepCorrectionRenderer.js

// Les scènes cumulatives contiennent déjà toute la démonstration courante.
// Une scène sans texte sépare deux démonstrations (par exemple le parallélisme
// puis Thalès) : conserver la version complète de chacune, sans répétitions.
export function createCompleteCorrectionScene(scenes, { cumulative = false } = {}) {
  const contents = [];
  let pending = "";
  for (const scene of scenes) {
    if (cumulative) {
      if (scene.html) pending = scene.html;
      else if (pending) { contents.push(pending); pending = ""; }
    } else if (scene.html) contents.push(scene.html);
  }
  if (pending) contents.push(pending);
  return {
    ...scenes[scenes.length - 1],
    html: contents.map(html => `<div>${html}</div>`).join("")
  };
}

export function renderStepCorrection({
  container,
  scene,
  renderFigure,
  onReady
}) {
  if (!container || !scene) {
    return;
  }

  clearMath(container);
  container.innerHTML = "";

  const sceneLayout =
    document.createElement(
      "div"
    );

  sceneLayout.className =
    "step-correction-layout";

  if (
    scene.figure &&
    typeof renderFigure === "function"
  ) {
    const figureContainer =
      document.createElement(
        "div"
      );

    figureContainer.className =
      "step-correction-figure";

    figureContainer.innerHTML =
      renderFigure(
        scene.figure
      );

    sceneLayout.appendChild(
      figureContainer
    );
  }

  if (scene.sideContent) {
    const sideContainer =
      document.createElement(
        "div"
      );

    sideContainer.className =
      "step-correction-side";

    sideContainer.innerHTML =
      scene.sideContent.html ?? "";

    if (scene.sideContent.color) {
      sideContainer.style.color =
        scene.sideContent.color;
    }

    sceneLayout.appendChild(
      sideContainer
    );
  }

  container.appendChild(
    sceneLayout
  );

  if (scene.html) {
    const contentContainer =
      document.createElement(
        "div"
      );

    contentContainer.className =
      "step-correction-content";

    contentContainer.innerHTML =
      scene.html;

    container.appendChild(
      contentContainer
    );
  }

  // Snapshot targets: late MathJax work only sees the old, detached scene.
  const targets = Array.from(container.children);
  const isCurrent = () => container.isConnected !== false &&
    targets.every(target => Array.from(container.children).includes(target));
  return renderMath(container, { targets }).then(rendered => {
    if (isCurrent()) onReady?.({ rendered, isCurrent });
    return rendered;
  });
}
