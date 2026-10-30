// exercices/figures/numberLineFigure.js


import {
  formatAnswer
} from "../../core/answerFormatting.js";


function valueToX({
  value,
  minValue,
  maxValue,
  startX,
  endX
}) {
  return (
    startX +
    (
      value - minValue
    ) /
    (
      maxValue - minValue
    ) *
    (
      endX - startX
    )
  );
}


function createTick({
  x,
  axisY,
  height,
  strokeWidth,
  color,
  direction
}) {
  let y1;
  let y2;

  if (direction === "up") {
    y1 = axisY;
    y2 =
      axisY -
      height;
  } else if (
    direction === "down"
  ) {
    y1 = axisY;
    y2 =
      axisY +
      height;
  } else {
    y1 =
      axisY -
      height / 2;

    y2 =
      axisY +
      height / 2;
  }

  return `
    <line
      x1="${x}"
      y1="${y1}"
      x2="${x}"
      y2="${y2}"
      stroke="${color}"
      stroke-width="${strokeWidth}"
    />
  `;
}


function createPointMarker({
  x,
  axisY,
  marker = "cross",
  markerSize = 10,
  markerStrokeWidth = 2,
  markerColor = "currentColor"
}) {
  if (marker === "cross") {
    const halfSize =
      markerSize / 2;

    return `
      <g
        stroke="${markerColor}"
        stroke-width="${markerStrokeWidth}"
      >
        <line
          x1="${x - halfSize}"
          y1="${axisY - halfSize}"
          x2="${x + halfSize}"
          y2="${axisY + halfSize}"
        />

        <line
          x1="${x - halfSize}"
          y1="${axisY + halfSize}"
          x2="${x + halfSize}"
          y2="${axisY - halfSize}"
        />
      </g>
    `;
  }

  if (marker === "tick") {
    const halfSize =
      markerSize / 2;

    return `
      <line
        x1="${x}"
        y1="${axisY - halfSize}"
        x2="${x}"
        y2="${axisY + halfSize}"
        stroke="${markerColor}"
        stroke-width="${markerStrokeWidth}"
      />
    `;
  }

  return "";
}


function createAnnotationArrow({
  x,
  axisY,
  direction = "up",
  length = 35,
  tipGap = 3,
  strokeWidth = 2,
  color = "currentColor",

  label = "",
  labelColor = "currentColor",
  labelFontSize = 18,
  labelGap = 10,
  labelBox = false
}) {
  const startY =
    direction === "up"
      ? axisY + length
      : axisY - length;

  const endY =
    direction === "up"
      ? axisY + tipGap
      : axisY - tipGap;

  const labelY =
    direction === "up"
      ? startY + labelGap
      : startY - labelGap;

  let boxCode = "";

  if (
    label &&
    labelBox
  ) {
    const boxPaddingX =
      8;

    const boxPaddingY =
      5;

    const estimatedTextWidth =
      label.length *
      labelFontSize *
      0.6;

    const boxWidth =
      estimatedTextWidth +
      2 * boxPaddingX;

    const boxHeight =
      labelFontSize +
      2 * boxPaddingY;

    boxCode = `
      <rect
        x="${
          x -
          boxWidth / 2
        }"
        y="${
          labelY -
          boxHeight / 2
        }"
        width="${boxWidth}"
        height="${boxHeight}"
        fill="white"
        stroke="${labelColor}"
        stroke-width="1"
      />
    `;
  }

  const labelCode =
    label
      ? `
          ${boxCode}

          <text
            x="${x}"
            y="${labelY}"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="${labelColor}"
            font-size="${labelFontSize}"
          >
            ${label}
          </text>
        `
      : "";

  return `
    <line
      x1="${x}"
      y1="${startY}"
      x2="${x}"
      y2="${endY}"
      stroke="${color}"
      stroke-width="${strokeWidth}"
      marker-end="url(#number-line-arrow-head)"
    />

    ${labelCode}
  `;
}


function createBackgroundGrid({
  width,
  height,
  axisY,
  startX,
  endX,
  gridTop,
  gridBottom,

  spacing,
  subdivisions,
  main,
  sub
}) {
  let gridCode = "";

  const subSpacing =
    spacing /
    subdivisions;

  /*
   * Lignes verticales.
   */

  for (
    let x = startX;
    x <= endX + 1e-9;
    x += subSpacing
  ) {
    const index =
      Math.round(
        (
          x - startX
        ) /
        subSpacing
      );

    const isMain =
      index %
        subdivisions ===
      0;

    const style =
      isMain
        ? main
        : sub;

    gridCode += `
      <line
        x1="${x}"
        y1="${gridTop}"
        x2="${x}"
        y2="${gridBottom}"
        stroke="${style.color}"
        stroke-width="${style.strokeWidth}"
        opacity="${style.opacity}"
      />
    `;
  }

  /*
   * Lignes horizontales.
   *
   * On part de axisY afin que
   * la droite graduée soit exactement
   * posée sur une ligne du quadrillage.
   */

  for (
    let y = axisY;
    y >= gridTop;
    y -= subSpacing
  ) {
    const distance =
      axisY - y;

    const index =
      Math.round(
        distance / subSpacing
      );

    const isMain =
      index %
        subdivisions ===
      0;

    const style =
      isMain
        ? main
        : sub;

    gridCode += `
      <line
        x1="${startX}"
        y1="${y}"
        x2="${endX}"
        y2="${y}"
        stroke="${style.color}"
        stroke-width="${style.strokeWidth}"
        opacity="${style.opacity}"
      />
    `;
  }

  for (
    let y =
      axisY + subSpacing;
    y <= gridBottom + 1e-9;
    y += subSpacing
  ) {
    const distance =
      y - axisY;

    const index =
      Math.round(
        distance / subSpacing
      );

    const isMain =
      index %
        subdivisions ===
      0;

    const style =
      isMain
        ? main
        : sub;

    gridCode += `
      <line
        x1="${startX}"
        y1="${y}"
        x2="${endX}"
        y2="${y}"
        stroke="${style.color}"
        stroke-width="${style.strokeWidth}"
        opacity="${style.opacity}"
      />
    `;
  }

  return gridCode;
}


export function createNumberLineFigure({
  viewportPaddingX = 0,
  viewportPaddingTop = 0,
  support = {
    arrowStart: false,
    arrowEnd: false,
    strokeWidth: 2,
    color: "currentColor"
  },

  backgroundGrid = {
    show: false,
    followScale: false,

    spacing: 20,
    subdivisions: 1,
    height: 140,

    main: {
      strokeWidth: 0.8,
      color: "currentColor",
      opacity: 0.5
    },

    sub: {
      strokeWidth: 0.5,
      color: "currentColor",
      opacity: 0.35
    }
  },

  range = {
    min: 0,
    max: 2
  },

  divisions = {
    mainStep: 1,
    subdivisions: 5,
    subSubdivisions: 1,

    main: {
      height: 20,
      strokeWidth: 2,
      color: "currentColor"
    },

    sub: {
      height: 14,
      strokeWidth: 1.5,
      color: "currentColor"
    },

    subSub: {
      height: 8,
      strokeWidth: 1,
      color: "currentColor"
    }
  },

  tickDirection = "both",

  points = [],

  labels = [],

  arrows = []
} = {}) {

  const width =
    760;

  const height =
    180;

  const startX =
    60;

  const endX =
    width - 60;

  const axisY =
    90;


  const minValue =
    range.min;

  const maxValue =
    range.max;


  const resolvedSupport = {
    arrowStart:
      support.arrowStart ??
      false,

    arrowEnd:
      support.arrowEnd ??
      false,

    strokeWidth:
      support.strokeWidth ??
      3,

    color:
      support.color ??
      "currentColor"
  };


  const resolvedBackgroundGrid = {
    show:
      backgroundGrid.show ??
      false,

    followScale:
      backgroundGrid.followScale ??
      false,

    spacing:
      backgroundGrid.spacing ??
      20,

    subdivisions:
      backgroundGrid.subdivisions ??
      1,

    height:
      backgroundGrid.height ??
      140,

    main: {
      strokeWidth:
        backgroundGrid.main?.strokeWidth ??
        0.8,

      color:
        backgroundGrid.main?.color ??
        "currentColor",

      opacity:
        backgroundGrid.main?.opacity ??
        0.5
    },

    sub: {
      strokeWidth:
        backgroundGrid.sub?.strokeWidth ??
        0.5,

      color:
        backgroundGrid.sub?.color ??
        "currentColor",

      opacity:
        backgroundGrid.sub?.opacity ??
        0.35
    }
  };


    const resolvedDivisions = {
      // Origine des rangs de graduation, indépendante du bord visible.
      origin: divisions.origin ?? minValue,
      mainStep:
        divisions.mainStep ??
        1,

      subdivisions:
        divisions.subdivisions ??
        5,

      subSubdivisions:
        divisions.subSubdivisions ??
        1,

      main: {
        height:
          divisions.main?.height ??
          20,

        strokeWidth:
          divisions.main?.strokeWidth ??
          2,

        color:
          divisions.main?.color ??
          "currentColor"
      },

      sub: {
        height:
          divisions.sub?.height ??
          14,

        strokeWidth:
          divisions.sub?.strokeWidth ??
          1.5,

        color:
          divisions.sub?.color ??
          "currentColor"
      },

      subSub: {
        height:
          divisions.subSub?.height ??
          8,

        strokeWidth:
          divisions.subSub?.strokeWidth ??
          1,

        color:
          divisions.subSub?.color ??
          "currentColor"
      }
    };


  let gridSpacing =
    resolvedBackgroundGrid.spacing;

  if (
    resolvedBackgroundGrid.show &&
    resolvedBackgroundGrid.followScale
  ) {
    const gridValueStep =
      resolvedDivisions.mainStep /
      resolvedDivisions.subdivisions;

    const firstX =
      valueToX({
        value:
          minValue +
          gridValueStep,

        minValue,
        maxValue,
        startX,
        endX
      });

    gridSpacing =
      firstX -
      startX;
  }

  const gridTop =
    axisY -
    resolvedBackgroundGrid.height / 2;

  const gridBottom =
    axisY +
    resolvedBackgroundGrid.height / 2;

  const backgroundGridCode =
    resolvedBackgroundGrid.show
      ? createBackgroundGrid({
          width,
          height,
          axisY,

          startX,
          endX,

          gridTop,
          gridBottom,

          spacing:
            gridSpacing,

          subdivisions:
            resolvedBackgroundGrid.subdivisions,

          main:
            resolvedBackgroundGrid.main,

          sub:
            resolvedBackgroundGrid.sub
        })
      : "";


  const mainStep =
    resolvedDivisions.mainStep;

  const subdivisionStep =
    mainStep /
    resolvedDivisions.subdivisions;

  const subSubdivisionStep =
    subdivisionStep /
    resolvedDivisions.subSubdivisions;


  let ticksCode = "";


  for (
    let value = minValue;
    value <= maxValue + 1e-9;
    value += subSubdivisionStep
  ) {
    const x =
      valueToX({
        value,
        minValue,
        maxValue,
        startX,
        endX
      });


    const mainIndex =
      (
        value -
        resolvedDivisions.origin
      ) /
      mainStep;

    const subIndex =
      (
        value -
        resolvedDivisions.origin
      ) /
      subdivisionStep;


    const isMain =
      Math.abs(
        mainIndex -
        Math.round(
          mainIndex
        )
      ) <
      1e-9;


    const isSub =
      Math.abs(
        subIndex -
        Math.round(
          subIndex
        )
      ) <
      1e-9;


    const tickStyle =
      isMain
        ? resolvedDivisions.main
        : isSub
          ? resolvedDivisions.sub
          : resolvedDivisions.subSub;


    ticksCode +=
      createTick({
        x,
        axisY,

        height:
          tickStyle.height,

        strokeWidth:
          tickStyle.strokeWidth,

        color:
          tickStyle.color,

        direction:
          tickDirection
      });
  }


  const labelsCode =
    labels
      .map(
        label => {
          const x =
            valueToX({
              value:
                label.value,

              minValue,
              maxValue,
              startX,
              endX
            });

          const y =
            label.position ===
              "above"
              ? axisY - 30
              : axisY + 35;

          return `
            <text
              x="${x}"
              y="${y}"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="${
                label.color ??
                "currentColor"
              }"
              font-size="${
                label.fontSize ??
                18
              }"
            >
              ${
                label.text ??
                formatAnswer(
                  label.value
                )
              }
            </text>
          `;
        }
      )
      .join("");


  const pointsCode =
    points
      .map(
        point => {
          const x =
            valueToX({
              value:
                point.value,

              minValue,
              maxValue,
              startX,
              endX
            });

          const markerCode =
            createPointMarker({
              x,
              axisY,

              marker:
                point.marker,

              markerSize:
                point.markerSize,

              markerStrokeWidth:
                point.markerStrokeWidth,

              markerColor:
                point.markerColor
            });

          const nameCode =
            point.name
              ? `
                  <text
                    x="${x}"
                    y="${
                      point.namePosition ===
                        "below"
                        ? axisY + 30
                        : axisY - 25
                    }"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="${
                      point.nameColor ??
                      "currentColor"
                    }"
                    font-size="${
                      point.nameFontSize ??
                      18
                    }"
                  >
                    ${point.name}
                  </text>
                `
              : "";

          const valueCode =
            point.showValue
              ? `
                  <text
                    x="${x}"
                    y="${
                      point.valuePosition ===
                        "above"
                        ? axisY - 25
                        : axisY + 30
                    }"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="${
                      point.valueColor ??
                      "currentColor"
                    }"
                    font-size="${
                      point.valueFontSize ??
                      18
                    }"
                  >
                    ${
                      point.valueText ??
                      formatAnswer(
                        point.value
                      )
                    }
                  </text>
                `
              : "";

          return `
            ${markerCode}
            ${nameCode}
            ${valueCode}
          `;
        }
      )
      .join("");


  const arrowsCode =
    arrows
      .map(
        arrow => {
          const x =
            valueToX({
              value:
                arrow.value,

              minValue,
              maxValue,
              startX,
              endX
            });

          return createAnnotationArrow({
            x,
            axisY,

            direction:
              arrow.direction,

            length:
              arrow.length,

            tipGap:
              arrow.tipGap,

            strokeWidth:
              arrow.strokeWidth,

            color:
              arrow.color,

            label:
              arrow.label ??
              (
                arrow.labelValue !== undefined
                  ? formatAnswer(
                      arrow.labelValue
                    )
                  : undefined
              ),

            labelColor:
              arrow.labelColor,

            labelFontSize:
              arrow.labelFontSize,

            labelGap:
              arrow.labelGap,

            labelBox:
              arrow.labelBox
          });
        }
      )
      .join("");


  return `
    <svg
      class="number-line-figure"
      viewBox="
        ${-viewportPaddingX}
        ${-viewportPaddingTop}
        ${width + 2 * viewportPaddingX}
        ${height + viewportPaddingTop}
      "
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Droite graduée"
    >

      <defs>
        <marker
          id="number-line-arrow-head"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 8 4 L 0 8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </marker>

        <marker
          id="number-line-axis-arrow-head"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 8 4 L 0 8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </marker>
      </defs>

      ${backgroundGridCode}

      <line
        x1="${startX}"
        y1="${axisY}"
        x2="${endX}"
        y2="${axisY}"
        stroke="${resolvedSupport.color}"
        stroke-width="${resolvedSupport.strokeWidth}"

        marker-start="${
          resolvedSupport.arrowStart
            ? "url(#number-line-axis-arrow-head)"
            : ""
        }"

        marker-end="${
          resolvedSupport.arrowEnd
            ? "url(#number-line-axis-arrow-head)"
            : ""
        }"
      />

      ${ticksCode}

      ${labelsCode}

      ${pointsCode}

      ${arrowsCode}

    </svg>
  `;
}