// exercices/figures/cartesianPlaneFigure.js

export function createCartesianPlaneSVG({
  width = 600,
  height = 400,

  textColor = "currentColor",

  padding = {
    left: 45,
    right: 20,
    top: 20,
    bottom: 40
  },

  range = {
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5
  },

  axes = {
    x: {
      show: true,
      step: 1,
      strokeWidth: 2
    },

    y: {
      show: true,
      step: 1,
      strokeWidth: 2
    }
  },

  grid = {
    main: {
      show: true,
      xStep: 1,
      yStep: 1,
      strokeWidth: 0.7,
      opacity: 0.45
    },

    sub: {
      show: false,
      xStep: 0.2,
      yStep: 0.2,
      strokeWidth: 0.4,
      opacity: 0.25
    },
  },

  points = [],

  polylines = [],

  texts = []
} = {}) {

  const {
    xMin,
    xMax,
    yMin,
    yMax
  } = range;

  const plotWidth =
    width -
    padding.left -
    padding.right;

  const plotHeight =
    height -
    padding.top -
    padding.bottom;


  // -------------------------
  // Coordonnées mathématiques
  // → coordonnées SVG
  // -------------------------

  function toSvgX(x) {
    return (
      padding.left +
      (
        (x - xMin) /
        (xMax - xMin)
      ) *
      plotWidth
    );
  }

  function toSvgY(y) {
    return (
      padding.top +
      (
        (yMax - y) /
        (yMax - yMin)
      ) *
      plotHeight
    );
  }


  // -------------------------
  // Formatage des graduations
  // -------------------------

  function formatTick(value) {
    if (
      Math.abs(value) < 1e-10
    ) {
      return "0";
    }

    return String(
      Number(
        value.toFixed(10)
      )
    ).replace(".", ",");
  }


  // -------------------------
  // Valeurs des graduations
  // -------------------------

  function getTicks(
    min,
    max,
    step
  ) {
    const ticks = [];

    if (
      !Number.isFinite(step) ||
      step <= 0
    ) {
      return ticks;
    }

    const first =
      Math.ceil(
        min / step - 1e-10
      ) * step;

    for (
      let value = first;
      value <= max + 1e-10;
      value += step
    ) {
      ticks.push(
        Number(
          value.toFixed(10)
        )
      );
    }

    return ticks;
  }

  function createGridLines(
    gridConfig
  ) {
    let svg = "";

    if (!gridConfig?.show) {
      return svg;
    }

    const xGridTicks =
      getTicks(
        xMin,
        xMax,
        gridConfig.xStep
      );

    const yGridTicks =
      getTicks(
        yMin,
        yMax,
        gridConfig.yStep
      );

    for (
      const x of xGridTicks
    ) {
      const svgX =
        toSvgX(x);

      svg += `
        <line
          x1="${svgX}"
          y1="${padding.top}"
          x2="${svgX}"
          y2="${padding.top + plotHeight}"
          stroke="currentColor"
          stroke-width="${gridConfig.strokeWidth}"
          opacity="${gridConfig.opacity}"
        />
      `;
    }

    for (
      const y of yGridTicks
    ) {
      const svgY =
        toSvgY(y);

      svg += `
        <line
          x1="${padding.left}"
          y1="${svgY}"
          x2="${padding.left + plotWidth}"
          y2="${svgY}"
          stroke="currentColor"
          stroke-width="${gridConfig.strokeWidth}"
          opacity="${gridConfig.opacity}"
        />
      `;
    }

    return svg;
  }


  // -------------------------
  // Quadrillage
  // -------------------------

  const subGridSvg =
    createGridLines(
      grid.sub
    );

  const mainGridSvg =
    createGridLines(
      grid.main
    );


  // -------------------------
  // Position des axes
  // -------------------------

  const xAxisValue =
    yMin <= 0 && yMax >= 0
      ? 0
      : yMin;

  const yAxisValue =
    xMin <= 0 && xMax >= 0
      ? 0
      : xMin;

  const xAxisY =
    toSvgY(xAxisValue);

  const yAxisX =
    toSvgX(yAxisValue);


  // -------------------------
  // Axe des abscisses
  // -------------------------

  let xAxisSvg = "";

  if (axes.x?.show) {
    xAxisSvg += `
      <line
        x1="${padding.left}"
        y1="${xAxisY}"
        x2="${padding.left + plotWidth}"
        y2="${xAxisY}"
        stroke="currentColor"
        stroke-width="${axes.x.strokeWidth}"
      />
    `;

    const xTicks =
      getTicks(
        xMin,
        xMax,
        axes.x.step
      );

    for (
      const x of xTicks
    ) {
      const svgX =
        toSvgX(x);

      xAxisSvg += `
        <line
          x1="${svgX}"
          y1="${xAxisY - 4}"
          x2="${svgX}"
          y2="${xAxisY + 4}"
          stroke="currentColor"
          stroke-width="1"
        />
      `;

      xAxisSvg += `
        <text
          x="${svgX}"
          y="${xAxisY + 18}"
          text-anchor="middle"
          font-size="12"
          fill="${textColor}"
        >
          ${formatTick(x)}
        </text>
      `;
    }
  }


  // -------------------------
  // Axe des ordonnées
  // -------------------------

  let yAxisSvg = "";

  if (axes.y?.show) {
    yAxisSvg += `
      <line
        x1="${yAxisX}"
        y1="${padding.top}"
        x2="${yAxisX}"
        y2="${padding.top + plotHeight}"
        stroke="currentColor"
        stroke-width="${axes.y.strokeWidth}"
      />
    `;

    const yTicks =
      getTicks(
        yMin,
        yMax,
        axes.y.step
      );

    for (
      const y of yTicks
    ) {
      const svgY =
        toSvgY(y);

      yAxisSvg += `
        <line
          x1="${yAxisX - 4}"
          y1="${svgY}"
          x2="${yAxisX + 4}"
          y2="${svgY}"
          stroke="currentColor"
          stroke-width="1"
        />
      `;

      /*
       * On n'affiche pas une deuxième
       * fois 0 à l'origine.
       */
      if (
        Math.abs(y) > 1e-10
      ) {
        yAxisSvg += `
          <text
            x="${yAxisX - 9}"
            y="${svgY + 4}"
            text-anchor="end"
            font-size="12"
            fill="${textColor}"
          >
            ${formatTick(y)}
          </text>
        `;
      }
    }
  }


  function createPointMarker({
    x,
    y,
    marker = "cross",
    markerSize = 8,
    markerStrokeWidth = 2,
    name = null,
    namePosition = "above-right",
    nameOffset = 10,
    nameColor = textColor
  }) {
    const svgX =
      toSvgX(x);

    const svgY =
      toSvgY(y);

    const halfSize =
      markerSize / 2;

    const namePositions = {
      above: {
        dx: 0,
        dy: -nameOffset,
        anchor: "middle"
      },

      below: {
        dx: 0,
        dy: nameOffset,
        anchor: "middle"
      },

      left: {
        dx: -nameOffset,
        dy: 4,
        anchor: "end"
      },

      right: {
        dx: nameOffset,
        dy: 4,
        anchor: "start"
      },

      "above-left": {
        dx: -nameOffset,
        dy: -nameOffset,
        anchor: "end"
      },

      "above-right": {
        dx: nameOffset,
        dy: -nameOffset,
        anchor: "start"
      },

      "below-left": {
        dx: -nameOffset,
        dy: nameOffset,
        anchor: "end"
      },

      "below-right": {
        dx: nameOffset,
        dy: nameOffset,
        anchor: "start"
      }
    };

    const nameConfig =
      namePositions[namePosition] ??
      namePositions["above-right"];

    const nameSvg =
      name
        ? `
          <text
            x="${svgX + nameConfig.dx}"
            y="${svgY + nameConfig.dy}"
            text-anchor="${nameConfig.anchor}"
            font-size="14"
            fill="${nameColor}"
          >
            ${name}
          </text>
        `
        : "";

    if (marker === "cross") {
      return `
        <g
          stroke="currentColor"
          stroke-width="${markerStrokeWidth}"
        >
          <line
            x1="${svgX - halfSize}"
            y1="${svgY - halfSize}"
            x2="${svgX + halfSize}"
            y2="${svgY + halfSize}"
          />

          <line
            x1="${svgX - halfSize}"
            y1="${svgY + halfSize}"
            x2="${svgX + halfSize}"
            y2="${svgY - halfSize}"
          />
        </g>

        ${nameSvg}
      `;
    }

    if (marker === "plus") {
      return `
        <g
          stroke="currentColor"
          stroke-width="${markerStrokeWidth}"
        >
          <line
            x1="${svgX - halfSize}"
            y1="${svgY}"
            x2="${svgX + halfSize}"
            y2="${svgY}"
          />

          <line
            x1="${svgX}"
            y1="${svgY - halfSize}"
            x2="${svgX}"
            y2="${svgY + halfSize}"
          />
        </g>

        ${nameSvg}
      `;
    }

    return "";
  }


  const pointsSvg =
    points
      .map(point =>
        createPointMarker(point)
      )
      .join("");


  function createPolyline({
    points,
    strokeWidth = 2
  }) {
    if (
      !Array.isArray(points) ||
      points.length < 2
    ) {
      return "";
    }

    const svgPoints =
      points
        .map(([x, y]) =>
          `${toSvgX(x)},${toSvgY(y)}`
        )
        .join(" ");

    return `
      <polyline
        points="${svgPoints}"
        fill="none"
        stroke="currentColor"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `;
  }

  const polylinesSvg =
    polylines
      .map(polyline =>
        createPolyline(polyline)
      )
      .join("");


  function createText({
    x,
    y,

    text,

    fontSize = 14,
    fontWeight = "normal",

    anchor = "middle",

    rotation = 0,

    dx = 0,
    dy = 0,

    opacity = 1,

    color = textColor,


    className = ""
  }) {
    const svgX =
      toSvgX(x) + dx;

    const svgY =
      toSvgY(y) + dy;

    const transform =
      rotation !== 0
        ? `transform="rotate(${rotation} ${svgX} ${svgY})"`
        : "";

    const classAttribute =
      className
        ? `class="${className}"`
        : "";

    return `
      <text
        x="${svgX}"
        y="${svgY}"

        text-anchor="${anchor}"

        font-size="${fontSize}"
        font-weight="${fontWeight}"

        opacity="${opacity}"

        fill="${color}"

        ${transform}
        ${classAttribute}
      >
        ${text}
      </text>
    `;
  }

  const textsSvg =
    texts
      .map(text =>
        createText(text)
      )
      .join("");


  // -------------------------
  // SVG final
  // -------------------------

  return `
    <svg
      class="cartesian-plane"
      viewBox="0 0 ${width} ${height}"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Repère cartésien"
    >
      <!-- Quadrillage secondaire -->
      <g>
        ${subGridSvg}
      </g>

      <!-- Quadrillage principal -->
      <g>
        ${mainGridSvg}
      </g>

      <!-- Axes -->
      <g>
        ${xAxisSvg}
        ${yAxisSvg}
      </g>

      <!-- Polylignes -->
      <g>
        ${polylinesSvg}
      </g>

      <!-- Points -->
      <g>
        ${pointsSvg}
      </g>

      <!-- Textes -->
      <g>
        ${textsSvg}
      </g>
    </svg>
  `;
}