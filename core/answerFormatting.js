// core/answerFormatting.js

export function formatAnswer(
  answer,
  mode = "html",
  minimumFractionDigits,
  maximumFractionDigits
) {
  if (!["html", "math"].includes(mode)) {
    throw new Error(
      `Mode de formatage inconnu : ${mode}`
    );
  }

  if (answer === null || answer === undefined) {
    return "";
  }

  const stringAnswer =
    String(answer)
      .trim();


  if (mode === "math") {

    const powerMatch =
      stringAnswer.match(
        /^\(?(-?\d+)\)?\^(-?\d+)$/
      );

    if (powerMatch) {
      const base =
        powerMatch[1];

      const exponent =
        powerMatch[2];

      const formattedBase =
        Number(base) < 0
          ? `(${base})`
          : base;

      return (
        `${formattedBase}` +
        `^{${exponent}}`
      );
    }


    if (
      stringAnswer.includes("*")
    ) {
      return stringAnswer
        .replace(
          ".",
          ","
        )
        .replace(
          /\^(-?\d+)/g,
          "^{$1}"
        )
        .replace(
          /\*/g,
          "\\times "
        );
    }
  }

  const value = Number(answer);

  if (Number.isNaN(value)) {
    return String(answer);
  }

  const effectiveMaximumFractionDigits =
    maximumFractionDigits ??
    minimumFractionDigits ??
    9;

  const effectiveMinimumFractionDigits =
    minimumFractionDigits ?? 0;

  const formattedValue = new Intl.NumberFormat(
    "fr-FR",
    {
      minimumFractionDigits:
        effectiveMinimumFractionDigits,

      maximumFractionDigits:
        effectiveMaximumFractionDigits
    }
  ).format(value);

  const [integerPart, decimalPart] =
    formattedValue.split(",");

  const formattedIntegerPart =
    mode === "math"
      ? integerPart.replace(
          /[\s\u202f\u00a0]/g,
          "~"
        )
      : integerPart;

  if (!decimalPart) {
    return formattedIntegerPart;
  }

  const decimalSeparator =
    mode === "math" ? "{,}" : ",";

  const decimalGroupSeparator =
    mode === "math" ? "~" : " ";

  const groupedDecimalPart =
    decimalPart.match(/.{1,3}/g)?.join(
      decimalGroupSeparator
    ) ?? decimalPart;

  return (
    formattedIntegerPart +
    decimalSeparator +
    groupedDecimalPart
  );
}