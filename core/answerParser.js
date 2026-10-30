// core/answerParser.js

/**
 * Normalise une réponse saisie par l'utilisateur.
 *
 * Exemples :
 * " 01,5 "       -> "1.5"
 * "\\frac{1}{2}" -> "1/2"
 * "\\dfrac{1}{2}" -> "1/2"
 * "10^3"         -> "1000"
 */
export function normalizeAnswer(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/\{,\}/g, ".")
    .replace(",", ".")
    .replace(/^0+(\d)/, "$1")
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\\,|~/g, "")
    .replace(/\\(?:d)?frac{(-?\d+(?:\.\d+)?)}{(-?\d+(?:\.\d+)?)}/g,"$1/$2")
    .replace(/10\^(-?\d+)/g, (_, exponent) =>
      String(Math.pow(10, Number(exponent)))
    );
}

/**
 * Transforme une réponse normalisée en valeur numérique et unité.
 */
export function parseAnswer(value) {
  const normalizedValue = normalizeAnswer(value);

  const match = normalizedValue.match(
    /^(.+?)([a-z]*|%)$/
  );

  if (!match) {
    return {
      valid: false,
      value: null,
      unit: ""
    };
  }

  const valueString = match[1];
  const unit = match[2];

  let numericValue;

  /*
  * Cas d'une somme de plusieurs termes :
  *
  * 50+508/1000
  * 508/1000+50
  * 72+3/10+6/100+9/1000
  */
  if (valueString.includes("+")) {
    const terms = valueString.split("+");

    let sum = 0;

    for (const term of terms) {
      let termValue;

      if (
        /^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(term)
      ) {
        const [numerator, denominator] =
          term.split("/").map(Number);

        if (denominator === 0) {
          return {
            valid: false,
            value: null,
            unit
          };
        }

        termValue =
          numerator / denominator;
      } else if (
        /^-?\d+(?:\.\d+)?$/.test(term)
      ) {
        termValue = Number(term);
      } else {
        return {
          valid: false,
          value: null,
          unit
        };
      }

      if (!Number.isFinite(termValue)) {
        return {
          valid: false,
          value: null,
          unit
        };
      }

      sum += termValue;
    }

    numericValue = sum;
  }

  /*
   * Cas d'une fraction simple :
   * 508/1000
   */
  else if (
    /^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(valueString)
  ) {
    const [numerator, denominator] = valueString
      .split("/")
      .map(Number);

    if (denominator === 0) {
      return {
        valid: false,
        value: null,
        unit
      };
    }

    numericValue = numerator / denominator;
  }

  /*
   * Cas d'un nombre simple :
   * 50
   * 50.508
   */
  else if (
    /^-?\d+(?:\.\d+)?$/.test(valueString)
  ) {
    numericValue = Number(valueString);
  }

  /*
   * Toute autre expression est invalide.
   */
  else {
    return {
      valid: false,
      value: null,
      unit
    };
  }

  if (!Number.isFinite(numericValue)) {
    return {
      valid: false,
      value: null,
      unit
    };
  }

  if (unit === "%") {
    numericValue /= 100;
  }

  return {
    valid: true,
    value: numericValue,
    unit
  };
}