// exercices/figures/fractionsFigures.js

export function createGridFigure({
  rows,
  columns,
  coloredCells
}) {
  const margin = 20;

  const size = 200;

  const cellWidth =
    size / columns;

  const cellHeight =
    size / rows;

  let coloredRectangles = "";

  for (const [row, column] of coloredCells) {
    const x =
      margin + column * cellWidth;

    const y =
      margin + row * cellHeight;

    coloredRectangles += `
      <rect
        x="${x}"
        y="${y}"
        width="${cellWidth}"
        height="${cellHeight}"
        fill="rgba(255, 215, 0, 0.5)"
      />
    `;
  }

  let verticalLines = "";

  for (let i = 1; i < columns; i++) {
    const x =
      margin + i * cellWidth;

    verticalLines += `
      <line
        x1="${x}"
        y1="${margin}"
        x2="${x}"
        y2="${margin + size}"
        stroke="black"
        stroke-width="3"
      />
    `;
  }

  let horizontalLines = "";

  for (let i = 1; i < rows; i++) {
    const y =
      margin + i * cellHeight;

    horizontalLines += `
      <line
        x1="${margin}"
        y1="${y}"
        x2="${margin + size}"
        y2="${y}"
        stroke="black"
        stroke-width="3"
      />
    `;
  }

  return `
    <svg
      viewBox="0 0 240 240"
      width="240"
      height="240"
      role="img"
      aria-label="Figure quadrillée dont certaines cases sont coloriées"
    >
      ${coloredRectangles}

      <rect
        x="${margin}"
        y="${margin}"
        width="${size}"
        height="${size}"
        fill="none"
        stroke="black"
        stroke-width="3"
      />

      ${verticalLines}

      ${horizontalLines}
    </svg>
  `;
}

function pointOnCircle(
  centerX,
  centerY,
  radius,
  angleInDegrees
) {
  const angleInRadians =
    (angleInDegrees - 90) * Math.PI / 180;

  return {
    x:
      centerX +
      radius * Math.cos(angleInRadians),

    y:
      centerY +
      radius * Math.sin(angleInRadians)
  };
}

export function createDiskFigure({
  parts,
  coloredParts
}) {
  const angle =
    360 / parts;

  const geometry = {
    centerX: 120,
    centerY: 120,
    radius: 100
  };

  const {
    centerX,
    centerY,
    radius
  } = geometry;

  let coloredSectors = "";

  for (const part of coloredParts) {
    const startAngle =
      part * angle;

    const endAngle =
      startAngle + angle;

    const largeArcFlag =
      angle > 180 ? 1 : 0;

    const startPoint =
      pointOnCircle(
        centerX,
        centerY,
        radius,
        startAngle
      );

    const endPoint =
      pointOnCircle(
        centerX,
        centerY,
        radius,
        endAngle
      );

    coloredSectors += `
      <path
        d="
          M ${centerX} ${centerY}
          L ${startPoint.x} ${startPoint.y}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}
          Z
        "
        fill="rgba(255, 215, 0, 0.5)"
      />
    `;
  }

  let divisionLines = "";

  for (let i = 0; i < parts; i++) {
    const point =
      pointOnCircle(
        centerX,
        centerY,
        radius,
        i * angle
      );

    divisionLines += `
      <line
        x1="${centerX}"
        y1="${centerY}"
        x2="${point.x}"
        y2="${point.y}"
        stroke="black"
        stroke-width="3"
      />
    `;
  }

  return `
    <svg
      viewBox="0 0 240 240"
      width="240"
      height="240"
      role="img"
      aria-label="Disque partagé en parts égales, dont certaines sont coloriées"
    >
      ${coloredSectors}

      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="none"
        stroke="black"
        stroke-width="3"
      />

      ${divisionLines}
    </svg>
  `;
}

export function createStripFigure({
  parts,
  coloredParts,
  partWidth: requestedPartWidth,
  rectangleHeight = 40,
  fillColor = "rgba(255, 215, 0, 0.5)"
}) {
  const margin = 20;

  const rectangleWidth = requestedPartWidth === undefined ? 280 : parts * requestedPartWidth;


  const partWidth =
    rectangleWidth / parts;

  let coloredRectangles = "";

  for (const part of coloredParts) {
    const x =
      margin + part * partWidth;

    coloredRectangles += `
      <rect
        x="${x}"
        y="${margin + 30}"
        width="${partWidth}"
        height="${rectangleHeight}"
        fill="${fillColor}"
      />
    `;
  }

  let divisionLines = "";

  for (let i = 1; i < parts; i++) {
    const x =
      margin + i * partWidth;

    divisionLines += `
      <line
        x1="${x}"
        y1="${margin + 30}"
        x2="${x}"
        y2="${margin + 30 + rectangleHeight}"
        stroke="black"
        stroke-width="3"
      />
    `;
  }

  return `
    <svg
      viewBox="0 0 ${rectangleWidth + 2 * margin} ${rectangleHeight + 80}"
      width="${rectangleWidth + 2 * margin}"
      height="${rectangleHeight + 80}"
      role="img"
      aria-label="Bande partagée en parts égales"
    >
      ${coloredRectangles}

      <rect
        x="${margin}"
        y="${margin + 30}"
        width="${rectangleWidth}"
        height="${rectangleHeight}"
        fill="none"
        stroke="black"
        stroke-width="3"
      />

      ${divisionLines}
    </svg>
  `;
}

function createTriangle(points) {
  const svgPoints = points
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return `
    <polygon
      points="${svgPoints}"
      fill="rgba(255, 215, 0, 0.5)"
    />
  `;
}

export function createDiagonalRectangleFigure({
  coloredHalves
}) {
  const margin = 20;

  const rectangleWidth = 200;

  const rectangleHeight = 140;

  const figureWidth =
    rectangleWidth + 2 * margin;

  const figureHeight =
    rectangleHeight + 2 * margin;

  const halfWidth =
  rectangleWidth / 2;

  const halfHeight =
    rectangleHeight / 2;

  const A = [margin, margin];
  const B = [margin + halfWidth, margin];
  const C = [margin + rectangleWidth, margin];

  const D = [margin, margin + halfHeight];
  const E = [margin + halfWidth, margin + halfHeight];
  const F = [margin + rectangleWidth, margin + halfHeight];

  const G = [margin, margin + rectangleHeight];
  const H = [margin + halfWidth, margin + rectangleHeight];
  const I = [margin + rectangleWidth, margin + rectangleHeight];

  const rectangles = [
    // Haut gauche
    [
      [A, B, E],
      [A, D, E]
    ],

    // Haut droit
    [
      [B, C, F],
      [B, E, F]
    ],

    // Bas gauche
    [
      [D, E, H],
      [D, G, H]
    ],

    // Bas droit
    [
      [E, F, I],
      [E, H, I]
    ]
  ];

  let coloredTriangles = "";

  for (const coloredHalf of coloredHalves) {
    const rectangleIndex =
      Math.floor(coloredHalf / 2);

    const triangleIndex =
      coloredHalf % 2;

    coloredTriangles += createTriangle(
      rectangles[rectangleIndex][triangleIndex]
    );
  }

  return `
    <svg
      viewBox="0 0 ${figureWidth} ${figureHeight}"
      width="${figureWidth}"
      height="${figureHeight}"
      role="img"
      aria-label="Rectangle partagé en deux par une diagonale"
    >
      ${coloredTriangles}

      <rect
        x="${margin}"
        y="${margin}"
        width="${rectangleWidth}"
        height="${rectangleHeight}"
        fill="none"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin + rectangleWidth / 2}"
        y1="${margin}"
        x2="${margin + rectangleWidth / 2}"
        y2="${margin + rectangleHeight}"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin}"
        y1="${margin + rectangleHeight / 2}"
        x2="${margin + rectangleWidth}"
        y2="${margin + rectangleHeight / 2}"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin}"
        y1="${margin}"
        x2="${margin + rectangleWidth / 2}"
        y2="${margin + rectangleHeight / 2}"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin + rectangleWidth / 2}"
        y1="${margin}"
        x2="${margin + rectangleWidth}"
        y2="${margin + rectangleHeight / 2}"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin}"
        y1="${margin + rectangleHeight / 2}"
        x2="${margin + rectangleWidth / 2}"
        y2="${margin + rectangleHeight}"
        stroke="black"
        stroke-width="3"
      />

      <line
        x1="${margin + rectangleWidth / 2}"
        y1="${margin + rectangleHeight / 2}"
        x2="${margin + rectangleWidth}"
        y2="${margin + rectangleHeight}"
        stroke="black"
        stroke-width="3"
      />
    </svg>
  `;
}