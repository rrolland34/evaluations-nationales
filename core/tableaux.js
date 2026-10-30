// core/tableaux.js

/**
 * Retourne une nouvelle copie mélangée du tableau.
 * Le tableau d'origine n'est pas modifié.
 */
export function melangerTableau(tableau, random = Math.random) {
  if (!Array.isArray(tableau)) {
    return [];
  }

  const tableauMelange = [...tableau];

  for (let i = tableauMelange.length - 1; i > 0; i--) {
    const indexAleatoire = Math.floor(random() * (i + 1));

    [tableauMelange[i], tableauMelange[indexAleatoire]] =
      [tableauMelange[indexAleatoire], tableauMelange[i]];
  }

  return tableauMelange;
}