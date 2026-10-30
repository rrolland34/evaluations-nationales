import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getExportStyles } from "../core/export/exportStyles.js";
import { createEvaluationWithCorrection } from "../core/export/exportEvaluationContent.js";
import series from "../exercices/remediation_evaluations_nationales_6e_serie_2.js";

// Contrôle navigateur optionnel hors de l'environnement disposant de Chrome/MathJax.
const script = process.env.MATHJAX_TEST_SCRIPT;
const chrome = process.env.CHROME_TEST_EXECUTABLE ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch {
  try { ({ chromium } = require(resolve(dirname(process.execPath), "../node_modules/playwright"))); }
  catch { /* Le test signale explicitement la dépendance manquante. */ }
}

test("impression MathJax : page blanche supprimée, MathML et arbre accessible conservés", {
  skip: !script || !existsSync(script) || !existsSync(chrome) || !chromium
    ? "Configurer MATHJAX_TEST_SCRIPT, Chrome et Playwright pour le contrôle PDF réel." : false
}, async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage({ viewport: { width: 658, height: 987 } });
    // Même origine locale que les fenêtres d'export ; about:blank bloque les polices locales.
    await page.goto(new URL("../index.html", import.meta.url).href);
    const styles = getExportStyles();
    const previousStyles = styles.replace(/\s*mjx-assistive-mml\s*\{[^}]*\}/, "");
    await page.setContent(`<style id="export-style">${previousStyles}</style><header class="evaluation-header"><h1>${series.title}</h1><p class="evaluation-date">29/10/2026</p></header>${createEvaluationWithCorrection({ exercice: { questions: series.generateQuestions(() => 0) }, answerMode: "direct" })}`);
    await page.evaluate(fontURL => { window.MathJax = { chtml: { fontURL } }; }, pathToFileURL(dirname(script)).href + "/");
    await page.addScriptTag({ path: script });
    await page.evaluate(async () => { await MathJax.startup.promise; await document.fonts.ready; });
    const cdp = await page.context().newCDPSession(page);
    const ax = async () => (await cdp.send("Accessibility.getFullAXTree")).nodes.filter(n => !n.ignored).map(n => [n.role?.value, n.name?.value, n.properties]);
    const mathML = () => page.locator("mjx-assistive-mml").evaluateAll(es => es.map(e => e.outerHTML));
    const pages = buffer => (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
    await page.emulateMedia({ media: "print" });
    const beforeAX = await ax(), beforeMath = await mathML();
    const beforePDF = await page.pdf({ preferCSSPageSize: true, tagged: true });
    assert.equal(pages(beforePDF), 2, "reproduction de la page finale blanche");
    await page.locator("#export-style").evaluate((e, css) => { e.textContent = css; }, styles);
    const afterPDF = await page.pdf({ preferCSSPageSize: true, tagged: true });
    assert.equal(pages(afterPDF), 1);
    assert.deepEqual(await mathML(), beforeMath);
    assert.deepEqual(await ax(), beforeAX);
    assert.ok(beforeAX.some(([role]) => role === "MathMLFraction"));
    assert.equal(await page.locator("mjx-merror,[data-mjx-error]").count(), 0);
    await page.emulateMedia({ media: "screen" });
    assert.equal(await page.locator("mjx-assistive-mml").last().evaluate(e => getComputedStyle(e).maxHeight), "none", "aucune limitation à l'écran");
  } finally { await browser.close(); }
});
