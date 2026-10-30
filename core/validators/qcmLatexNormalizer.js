// core/qcmLatexNormalizer.js

export function normalizeQCMLatex(
  value
) {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  return value
    .trim()

    // Délimiteurs MathJax.
    .replace(
      /^\\\(/,
      ""
    )
    .replace(
      /\\\)$/,
      ""
    )
    .replace(
      /^\\\[/,
      ""
    )
    .replace(
      /\\\]$/,
      ""
    )

    // Virgule décimale MathJax.
    .replace(
      /\{,\}/g,
      "."
    )

    // Opérations.
    .replace(
      /\\times/g,
      "*"
    )
    .replace(
      /\\div/g,
      "/"
    )

    // Fonctions trigonométriques.
    .replace(
      /\\cos/g,
      "cos"
    )
    .replace(
      /\\sin/g,
      "sin"
    )
    .replace(
      /\\tan/g,
      "tan"
    )

    // Degrés.
    .replace(
      /\^\\circ/g,
      ""
    )

    // Pourcentage.
    .replace(
      /\\%/g,
      "%"
    )

    // Texte et unités.
    .replace(
      /\\text\{([^{}]*)\}/g,
      "$1"
    )
    .replace(
      /\\mathrm\{([^{}]*)\}/g,
      "$1"
    )

    // Espaces LaTeX.
    .replace(
      /\\,/g,
      ""
    )
    .replace(
      /\\;/g,
      ""
    )
    .replace(
      /\\ /g,
      " "
    )
    .replace(
      /~/g,
      " "
    )

    // Exposants.
    .replace(
      /\^\{([^{}]+)\}/g,
      "^$1"
    )

    // Fractions simples.
    .replace(
      /\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g,
      (
        _,
        numerator,
        denominator
      ) => {

        const simpleTermPattern =
          /^(?:[+-]?\d+(?:[.,]\d+)?|[A-Za-z]+)$/;

        const normalizedNumerator =
          simpleTermPattern.test(
            numerator
          )
            ? numerator
            : `(${numerator})`;

        const normalizedDenominator =
          simpleTermPattern.test(
            denominator
          )
            ? denominator
            : `(${denominator})`;

        return (
          `${normalizedNumerator}` +
          "/" +
          `${normalizedDenominator}`
        );
      }
    )

    .trim();
}