// core/mixedMode.js

import {
  melangerTableau
} from "./tableaux.js";


/**
 * Crée la répartition des modes de réponse
 * pour une session en mode Mixte.
 *
 * @param {number} questionCount
 * @param {number} qcmCount
 *
 * @returns {Array<"direct"|"qcm">}
 */
export function createMixedModeDistribution(
  questionCount,
  qcmCount
) {
  const modes = [];

  for (
    let i = 0;
    i < qcmCount;
    i++
  ) {
    modes.push("qcm");
  }

  for (
    let i = qcmCount;
    i < questionCount;
    i++
  ) {
    modes.push("direct");
  }

  return melangerTableau(modes);
}