// Ne touche qu'aux zones de réponse : les corrections et la navigation restent actives.
const guardedContainers = new WeakSet();

export function setAnswerControlsLocked(locked, { containers, submitButton }) {
  for (const container of containers.filter(Boolean)) {
    if (!guardedContainers.has(container)) {
      // Un événement déjà en attente ne doit pas modifier une sélection figée.
      for (const type of ["click", "beforeinput", "input", "change"]) {
        container.addEventListener(type, event => {
          if (!container.inert) return;
          event.preventDefault();
          event.stopImmediatePropagation();
        }, true);
      }
      guardedContainers.add(container);
    }
    container.inert = locked;
    if (container.matches("input, textarea, select, button")) container.disabled = locked;
    for (const control of container.querySelectorAll("input, textarea, select, button")) {
      control.disabled = locked;
    }
    if (locked && container.contains(document.activeElement)) document.activeElement.blur();
  }
  if (submitButton) submitButton.disabled = locked;
}
