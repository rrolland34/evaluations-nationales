import { createStepCorrection } from "./stepCorrection.js";
import { renderStepCorrection, createCompleteCorrectionScene } from "./stepCorrectionRenderer.js";

// Données éditoriales de confiance, comme question et display_answer.
// Les kinds inconnus restent des corrections classiques.
export function getProgressiveCorrectionSteps({
  correctionMode,
  presentationMode,
  correction
}) {
  const descriptor = correction?.progressiveCorrection;
  if (
    correctionMode !== "progressive" ||
    presentationMode !== "slideshow" ||
    descriptor?.kind !== "steps" ||
    !Array.isArray(descriptor.steps) ||
    descriptor.steps.length === 0 ||
    !Array.from(descriptor.steps).every(step =>
      step && typeof step.html === "string" && step.html.trim().length > 0
    )
  ) {
    return null;
  }
  return descriptor.steps.map(step => ({ html: step.html }));
}

// Le lecteur possède sa vue et son nettoyage. Un futur lecteur animé pourra
// proposer le même contrat sans reconstruire sa vue à chaque instruction.
export function createProgressiveCorrectionPlayer({
  container,
  steps,
  render = renderStepCorrection,
  beforeRender = () => {}
}) {
  const progression = createStepCorrection({ stepCount: steps.length });
  let slot = null;
  let disposed = false;

  function clearView() {
    if (slot) {
      globalThis.MathJax?.typesetClear?.([slot]);
      slot.remove();
      slot = null;
    }
  }

  function display({ complete = false } = {}) {
    clearView();
    beforeRender({ isLastStep: progression.getIsLastStep() });
    // Une cible distincte par rendu : un ancien travail MathJax ne peut pas
    // remplacer le contenu de l'étape courante après une navigation rapide.
    slot = container.ownerDocument.createElement("section");
    slot.className = "progressive-correction";
    slot.setAttribute("aria-live", "polite");
    const label = container.ownerDocument.createElement("p");
    label.className = "progressive-correction-counter";
    label.textContent = complete ? "Correction complète" : `Étape ${progression.getCurrentStepIndex() + 1}/${steps.length}`;
    const content = container.ownerDocument.createElement("div");
    slot.append(label, content);
    container.replaceChildren(slot);
    render({ container: content, scene: complete
      ? createCompleteCorrectionScene(steps)
      : steps[progression.getCurrentStepIndex()] });
  }

  return {
    start({ atEnd = false } = {}) {
      if (disposed) return;
      progression.start();
      if (atEnd) {
        while (!progression.getIsLastStep()) progression.next();
      }
      display();
    },
    next() {
      if (disposed || !progression.getIsActive() || progression.getIsLastStep()) return false;
      progression.next();
      display();
      return true;
    },
    previous() {
      if (disposed || !progression.getIsActive() || progression.getCurrentStepIndex() === 0) return false;
      progression.previous();
      display();
      return true;
    },
    showAll() {
      if (disposed || !progression.showAll()) return false;
      display({ complete: true });
      return true;
    },
    dispose() {
      progression.stop();
      disposed = true;
      clearView();
    }
  };
}
