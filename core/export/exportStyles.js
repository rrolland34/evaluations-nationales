// core/export/exportStyles.js

import {
  getExportFigureStyles
} from "./exportFigureStyles.js";

export function getExportStyles() {
  return `
    @page {
      size: A4;
      margin: 18mm;
    }

    body {
      font-family:
        Arial,
        sans-serif;

      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      color: #111;
      line-height: 1.4;
    }

    .evaluation-header {
      margin-bottom: 35px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
      text-align: center;
    }

    .evaluation-header h1 {
      margin: 0 0 8px;
    }

    .evaluation-date {
      margin: 0;
      color: #555;
    }

    .evaluation-student-identity {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }

    .evaluation-identity-item {
      display: flex;
      align-items: baseline;
      flex: 1;
      gap: 8px;
    }

    .evaluation-identity-line {
      flex: 1;
      border-bottom: 2px dotted #111;
    }

    .evaluation-response-space {
      margin-top: 18px;
    }

    .evaluation-response-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 10px;
    }

    .evaluation-response-row:first-child {
      margin-top: 0;
    }

    .evaluation-response-label-spacer {
      width: 70px;
      flex-shrink: 0;
    }

    .evaluation-response-line {
      flex: 1;
      border-bottom: 2px dotted #111;
    }

    .evaluation-question {
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .evaluation-question h2 {
      font-size: 1em;
      margin-top: 0;
      margin-bottom: 10px;
    }

    .evaluation-answer {
      margin-top: 16px;
      font-weight: 700;
      color: red;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Conserver currentColor des figures, sans recolorer les formules MathJax. */
    .evaluation-answer svg:not(mjx-container svg) {
      color: #111;
    }

    .archive-qcm {
      margin-top: 18px;
      margin-left: 20px;
    }

    .archive-qcm > div {
      margin: 8px 0;
    }

    .proportionality-table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 440px;
      max-width: 100%;
      margin: 15px auto;
    }

    .proportionality-table td {
      width: 110px;
      height: 45px;
      padding: 0 6px;
      box-sizing: border-box;
      border: 1px solid #111;
      text-align: center;
      vertical-align: middle;
      white-space: nowrap;
      font-size: 1.1em;
    }

    ${getExportFigureStyles()}

    @media print {
      body {
        max-width: none;
        margin: 0;
        padding: 0;
      }

      #print-evaluation {
        display: none;
      }

      /* La couche MathML reste accessible, mais sa boîte déjà découpée
         ne doit pas déborder sur une page supplémentaire. */
      mjx-assistive-mml {
        max-height: 1px;
        max-width: 1px;
      }
    }

    .proof-box {
      display: inline-block;
      border: 2px solid red;
      padding: 4px 10px;
    }

    .proof-display {
      color: red;
      font-size: 1.1em;
      line-height: 1.5;
    }
  `;
}
