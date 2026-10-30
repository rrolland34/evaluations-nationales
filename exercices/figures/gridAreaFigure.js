// exercices/figures/gridAreaFigure.js

export function createGridAreaFigure({
  polygonPoints,
  gridWidth = 9,
  gridHeight = 6,
  cellSize = 50,
  gridBounds = null,
  gridColor = "currentColor",
  gridStrokeWidth = 1,
  gridOpacity = 0.35,
  stroke = "currentColor",
  strokeWidth = 3,
  fill = "gold",
  fillOpacity = 0.5,
  showUnitCell = true,
  showLegend = true
}) {
  const { xMin = 0, yMin = 0, xMax = gridWidth, yMax = gridHeight } = gridBounds ?? {};
  const width =
    (xMax - xMin) * cellSize;

  const height =
    (yMax - yMin) * cellSize;

  const points =
    polygonPoints
      .map(
        ([x, y]) =>
          `${(x - xMin) * cellSize},${(yMax - y) * cellSize}`
      )
      .join(" ");

  let gridLines = "";

  for (
    let x = Math.ceil(xMin);
    x <= xMax;
    x += 1
  ) {
    const px =
      (x - xMin) * cellSize;

    gridLines += `
      <line
        x1="${px}"
        y1="0"
        x2="${px}"
        y2="${height}"
        stroke="${gridColor}"
        stroke-width="${gridStrokeWidth}"
        opacity="${gridOpacity}"
      />
    `;
  }

  for (
    let y = Math.ceil(yMin);
    y <= yMax;
    y += 1
  ) {
    const py =
      gridBounds ? (yMax - y) * cellSize : y * cellSize;

    gridLines += `
      <line
        x1="0"
        y1="${py}"
        x2="${width}"
        y2="${py}"
        stroke="${gridColor}"
        stroke-width="${gridStrokeWidth}"
        opacity="${gridOpacity}"
      />
    `;
  }

  return `
    <svg
      viewBox="0 0 ${width} ${height + (showLegend ? 35 : 0)}"
      width="100%"
      style="max-width:${width}px;"
      xmlns="http://www.w3.org/2000/svg"
    >

      ${gridLines}

      <polygon
        points="${points}"
        fill="${fill}"
        fill-opacity="${fillOpacity}"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="round"
      />

      ${showUnitCell ? `<rect
        x="0"
        y="${height - cellSize}"
        width="${cellSize}"
        height="${cellSize}"
        fill="gold"
        fill-opacity="0.5"
        stroke="currentColor"
        stroke-width="3"
      />` : ''}

      ${showLegend ? `<text
        x="0"
        y="${height + 28}"
        font-size="20"
        fill="currentColor"
      >
        1 cm
      </text>` : ''}
    </svg>
  `;
}
