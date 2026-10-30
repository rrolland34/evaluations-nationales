// core/export/exportFigureStyles.js

export function getExportFigureStyles() {
  return `
    .dnb-right-triangle svg {
      width: 320px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 15px auto;
    }

    .dnb-triangle svg {
      width: 240px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 15px auto;
    }

    .dnb-thales svg {
      width: 320px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 15px auto;
    }

    .thales-figure .thales-lines {
      stroke: #111;
      stroke-width: 2;
      fill: none;
    }

    .thales-figure .thales-length-arrows {
      stroke: #111;
      stroke-width: 1.5;
      fill: none;
    }

    .thales-figure .thales-point-labels,
    .thales-figure .thales-length-labels,
    .thales-figure .thales-angle-labels {
      fill: #111;
    }

    .dnb-quadrilateral svg {
      width: 260px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 15px auto;
    }

    .dnb-cartesian-plane svg {
      width: 360px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 15px auto;
    }

    .cartesian-plane text[fill="white"] {
      fill: #111 !important;
    }

    .cartesian-plane .axis-label,
    .cartesian-plane .tick-label {
      fill: #111 !important;
    }

    .proportionality-graph {
      width: 340px;
      max-width: 90%;
      height: auto;
      display: block;
      margin: 12px auto;
    }

    .proportionality-graph-grid {
      stroke: #111;
      stroke-width: 0.5;
      opacity: 0.25;
    }

    .proportionality-graph-axis {
      stroke: #111;
      stroke-width: 1.5;
    }

    .proportionality-graph-arrow {
      fill: #111;
    }

    .proportionality-graph-line {
      stroke: #111;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .proportionality-graph-label {
      fill: #111;
      font-size: 14px;
    }

    .proportionality-graph-title {
      fill: #111;
      font-size: 15px;
    }

    .evaluation-figure {
      text-align: center;
      margin: 15px 0;
    }

    .evaluation-figure svg {
      width: 320px;
      max-width: 100%;
      height: auto;
    }
  `;
}