import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); } catch {}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prefix = process.env.PAGES_PREFIX || '/mon-site/';

for (const engine of ['chromium', 'firefox']) {
  test(`export et clavier réels sous ${prefix} : ${engine}`, { skip: !playwright && 'Playwright requis (PLAYWRIGHT_MODULE).', timeout: 120000 }, async t => {
    const server = http.createServer(async (req, res) => {
      try {
        const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        assert.ok(pathname.startsWith(prefix));
        const file = resolve(root, pathname.slice(prefix.length));
        assert.ok(file.startsWith(root + '\\') || file.startsWith(root + '/'));
        const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.woff': 'font/woff', '.svg': 'image/svg+xml' };
        res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
        res.end(await readFile(file));
      } catch { res.writeHead(404).end(); }
    });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    let browser;
    try {
      browser = await playwright[engine].launch({ headless: true, ...(process.env[`${engine.toUpperCase()}_TEST_EXECUTABLE`] ? { executablePath: process.env[`${engine.toUpperCase()}_TEST_EXECUTABLE`] } : {}) });
      t.diagnostic(`Version ${engine} : ${browser.version()}`);
      const base = `http://127.0.0.1:${server.address().port}${prefix}`;
      async function session() {
        const context = await browser.newContext();
        const failures = [], external = [];
        context.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) failures.push(r.url()); });
        await context.route('**/*', route => {
          if (!route.request().url().startsWith(base)) { external.push(route.request().url()); return route.abort(); }
          return route.continue();
        });
        const page = await context.newPage();
        await page.goto(base + 'index.html');
        return { context, page, failures, external };
      }
      async function openExport(page, mode = 'direct') {
        const popup = page.waitForEvent('popup');
        await page.evaluate(async ({ mode, hasSpreadsheet }) => {
          const { exportDocument } = await import('./core/export/exportDocument.js');
          const { createEvaluationWithCorrection } = await import('./core/export/exportEvaluationContent.js');
          const series = await Promise.all([2, 4, 6].map(n => import(`./exercices/remediation_evaluations_nationales_6e_serie_${n}.js`)));
          const questions = series.flatMap(s => s.default.generateQuestions(() => 0));
          const content = createEvaluationWithCorrection({ exercice: { questions }, answerMode: mode, questionAnswerModes: questions.map((_, i) => i % 2 ? 'qcm' : 'direct') });
          const sheet = hasSpreadsheet ? (await import('./exercices/figures/spreadsheetFigure.js')).createSpreadsheetFigure({ orientation: 'horizontal', values: [2, 3, 4], results: [4, 9, 16] }) : '<section class="spreadsheet-figure"><table aria-label="Feuille de calcul"><tr><th></th><th>A</th><th>B</th></tr><tr><th>1</th><td>Prix</td><td>Quantité</td></tr><tr><th>2</th><td>2</td><td>3</td></tr></table></section>';
          window.exportJob = exportDocument({ title: 'Test export', content: content + sheet });
        }, { mode, hasSpreadsheet: existsSync(resolve(root, 'exercices/figures/spreadsheetFigure.js')) });
        return popup;
      }
      const ready = pop => pop.waitForFunction(() => document.documentElement.hasAttribute('data-export-ready'));
      for (const mode of ['direct', 'qcm', 'mixed']) await t.test(`formules, figures, tableaux, plusieurs pages, export répété : ${mode}`, async () => {
        const { context, page, failures, external } = await session();
        try {
          for (let attempt = 0; attempt < 2; attempt++) {
            const pop = await openExport(page, mode);
            await ready(pop);
            assert.equal(await pop.locator('#print-evaluation').isEnabled(), true);
            assert.ok(await pop.locator('mjx-container').count() > 0);
            assert.ok(await pop.locator('svg').count() > 0);
            assert.ok(await pop.locator('table').count() > 0);
            assert.equal(await pop.locator('mjx-merror,[data-mjx-error]').count(), 0);
            assert.ok(await pop.evaluate(() => document.body.scrollHeight > 1100));
            await pop.evaluate(() => { window.printCalls = 0; window.print = () => window.printCalls++; });
            await pop.locator('#print-evaluation').click();
            assert.equal(await pop.evaluate(() => window.printCalls), 1);
            if (engine === 'chromium') {
              const pdf = await pop.pdf({ preferCSSPageSize: true });
              assert.ok((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length > 1);
            } else {
              await pop.emulateMedia({ media: 'print' });
              assert.equal(await pop.locator('.evaluation-question').first().isVisible(), true);
            }
            await pop.close();
          }
          assert.deepEqual(failures, []);
          assert.deepEqual(external, [], 'aucun CDN, y compris polices/extensions');
        } finally { if (engine === 'chromium') await context.close();
          else for (const openPage of context.pages()) await openPage.close(); }
      });
      for (const scenario of ['slow', 'unavailable', 'typeset', 'startup-timeout', 'font']) await t.test(`préparation ${scenario} et nouvelle tentative`, async () => {
        const { context, page } = await session();
        try {
          if (scenario === 'startup-timeout') await context.route('**/exportMathJax.js', async route => {
            const code = await readFile(resolve(root, 'core/export/exportMathJax.js'), 'utf8');
            await route.fulfill({ body: code.replace('timeoutMs = 20000', 'timeoutMs = globalThis.__exportTimeoutTestUsed ? 20000 : (globalThis.__exportTimeoutTestUsed = true, 700)'), contentType: 'text/javascript' });
          });
          const pattern = scenario === 'font' ? '**/*.woff' : '**/tex-mml-chtml.js';
          await context.route(pattern, async route => {
            if (scenario === 'unavailable' || scenario === 'font') return route.abort();
            if (scenario === 'slow') { await new Promise(r => setTimeout(r, 800)); return route.continue(); }
            const code = await readFile(resolve(root, 'assets/vendor/mathjax-3.2.2/es5/tex-mml-chtml.js'), 'utf8');
            const extra = scenario === 'typeset'
              ? ';MathJax.startup.promise.then(()=>{MathJax.typesetPromise=()=>Promise.reject(new Error("test composition"));});'
              : ';MathJax.startup.promise=new Promise(()=>{});';
            return route.fulfill({ body: code + extra, contentType: 'text/javascript' });
          });
          const pop = await openExport(page);
          assert.equal(await pop.locator('#print-evaluation').isDisabled(), true);
          if (scenario === 'slow') { await ready(pop); return; }
          await pop.locator('#export-retry').waitFor();
          assert.equal(await pop.locator('#print-evaluation').isDisabled(), true);
          await pop.emulateMedia({ media: 'print' });
          assert.equal(await pop.locator('.evaluation-question').first().isVisible(), false, 'le raccourci natif ne peut imprimer les formules brutes');
          await pop.emulateMedia({ media: 'screen' });
          await context.unroute(pattern);
          if (scenario === 'startup-timeout') await context.unroute('**/exportMathJax.js');
          await pop.locator('#export-retry').click();
          await ready(pop);
          assert.equal(await pop.locator('#print-evaluation').isEnabled(), true);
          assert.equal(await pop.locator('script[src*="tex-mml-chtml"]').count(), 1);
          assert.equal(await pop.locator('#export-retry').count(), 0);
        } finally { if (engine === 'chromium') await context.close();
          else for (const openPage of context.pages()) await openPage.close(); }
      });
      await t.test('formule TeX invalide : aucune impression de formule brute', async () => {
        const { context, page } = await session();
        try {
          const pending = page.waitForEvent('popup');
          await page.evaluate(async () => {
            const { exportDocument } = await import('./core/export/exportDocument.js');
            window.exportJob = exportDocument({ title: 'Formule invalide', content: String.raw`<p>\(\frac{\)</p>` });
          });
          const pop = await pending;
          await pop.locator('#export-retry').waitFor();
          assert.equal(await pop.locator('#print-evaluation').isDisabled(), true);
          assert.equal(await pop.evaluate(() => document.documentElement.hasAttribute('data-export-ready')), false);
        } finally {
          if (engine === 'chromium') await context.close();
          else for (const openPage of context.pages()) await openPage.close();
        }
      });
      if (existsSync(resolve(root, 'scratchblocks.min.js'))) await t.test('attendre aussi les figures Scratch avant impression', async () => {
        const { context, page, failures } = await session();
        try {
          const pending = page.waitForEvent('popup');
          await page.evaluate(async () => {
            const { exportDocument } = await import('./core/export/exportDocument.js');
            window.exportJob = exportDocument({ title: 'Scratch', content: '<pre class="blocks">avancer de (10) pas</pre>' });
          });
          const pop = await pending;
          await ready(pop);
          assert.ok(await pop.locator('svg').count() > 0);
          assert.deepEqual(failures, []);
        } finally {
          if (engine === 'chromium') await context.close();
          else for (const openPage of context.pages()) await openPage.close();
        }
      });
      await t.test('clic Pause/Reprendre, vrai focus, plusieurs questions et cycles', async () => {
        const { context, page } = await session();
        try {
          // Le MathJax du lecteur est hors du périmètre de l'export ; servir sa
          // distribution locale dans ce test hors ligne du clavier.
          await context.route('https://cdn.jsdelivr.net/npm/mathjax@3/es5/**', async route => {
            const relative = route.request().url().split('/es5/')[1];
            await route.fulfill({ path: resolve(root, 'assets/vendor/mathjax-3.2.2/es5', relative) });
          });
          await page.goto(base + 'questions_flash.html?table=remediation_evaluations_nationales_6e_serie_2');
          await page.locator('#mode-slideshow').click();
          await page.locator('#start').click();
          await page.locator('body').click({ position: { x: 2, y: 2 } });
          const counter = page.locator('#question-counter');
          await page.keyboard.press('Shift+Enter');
          await counter.filter({ hasText: '2/5' }).waitFor();
          for (const question of [2, 3]) {
            for (let cycle = 0; cycle < 3; cycle++) {
              await page.locator('#pause-timer').click();
              await page.keyboard.press('Shift+Enter');
              assert.match(await counter.textContent(), new RegExp(`${question}/5`));
              await page.locator('#pause-timer').click();
              assert.equal(await page.evaluate(() => document.activeElement.id), 'pause-timer');
            }
            await page.keyboard.press('Shift+Enter');
            await counter.filter({ hasText: `${question + 1}/5` }).waitFor();
          }
        } finally { if (engine === 'chromium') await context.close();
          else for (const openPage of context.pages()) await openPage.close(); }
      });
    } finally {
      if (browser) await browser.close();
      await new Promise(r => server.close(r));
    }
  });
}
