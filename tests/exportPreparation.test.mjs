import test from 'node:test';
import assert from 'node:assert/strict';
import { loadExportMathJax, EXPORT_MATHJAX_URL } from '../core/export/exportMathJax.js';
import { initializeExportPrint } from '../core/export/exportPrint.js';
function fixture() {
  const attrs = new Map(), scripts = [], listeners = new Map(), extras = [];
  const element = () => ({ disabled: false, handlers: {}, setAttribute() {}, addEventListener(name, fn) { this.handlers[name] = fn; }, insertAdjacentElement(_, el) { extras.push(el); } });
  const printButton = element(), status = element();
  const document = {
    createTreeWalker: () => ({ nextNode: () => null }),
    body: {}, images: [], fonts: Object.assign([], { ready: Promise.resolve() }),
    documentElement: { setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k), hasAttribute: k => attrs.has(k) },
    getElementById: id => id === 'print-evaluation' ? printButton : status,
    querySelector: () => null,
    createElement: element,
    head: { appendChild: script => scripts.push(script) }
  };
  const archiveWindow = { document, setTimeout, clearTimeout, printCalls: 0, print() { this.printCalls++; },
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  let retries = 0, typesets = 0;
  const start = options => loadExportMathJax({ archiveWindow, printButton, timeoutMs: 100, onRetry: () => retries++, ...options });
  async function loaded(options = {}) {
    archiveWindow.MathJax = { startup: { promise: Promise.resolve() }, typesetPromise(targets) { typesets++; assert.deepEqual(targets, [document.body]); return Promise.resolve(); }, ...options };
    await scripts[0].onload();
  }
  return { document, archiveWindow, printButton, scripts, listeners, extras, start, loaded, get typesets() { return typesets; }, get retries() { return retries; } };
}
test('export : initialisation, composition explicite, polices et déduplication', async () => {
  const f = fixture();
  let fontsReady;
  f.document.fonts.ready = new Promise(r => fontsReady = r);
  const job = f.start();
  assert.equal(f.start(), job);
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0].src, EXPORT_MATHJAX_URL);
  assert.equal(f.archiveWindow.MathJax.startup.typeset, false);
  const loaded = f.loaded();
  await new Promise(r => setImmediate(r));
  assert.equal(f.printButton.disabled, true);
  fontsReady();
  await loaded;
  assert.equal(await job, true);
  assert.equal(f.typesets, 1);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.document.documentElement.hasAttribute('data-export-ready'), true);
});
for (const failure of ['network', 'startup', 'typeset', 'merror', 'font', 'raw']) test(`export : échec ${failure}, impression interdite et nouvelle tentative proposée`, async () => {
  const f = fixture();
  initializeExportPrint({ archiveWindow: f.archiveWindow });
  const job = f.start({ timeoutMs: 20 });
  if (failure === 'network') f.scripts[0].onerror();
  if (failure === 'startup') await f.loaded({ startup: { promise: Promise.reject(new Error('startup')) } });
  if (failure === 'typeset') await f.loaded({ typesetPromise: () => Promise.reject(new Error('typeset')) });
  if (failure === 'merror') { f.document.querySelector = () => ({}); await f.loaded(); }
  if (failure === 'raw') {
    let remaining = true;
    f.document.createTreeWalker = () => ({ nextNode() {
      if (!remaining) return null;
      remaining = false;
      return { nodeValue: String.raw`\(\frac{\)` };
    } });
    await f.loaded();
  }
  if (failure === 'font') { f.document.fonts.push({ status: 'error' }); await f.loaded(); }
  assert.equal(await job, false);
  assert.equal(f.printButton.disabled, true);
  f.printButton.handlers.click();
  assert.equal(f.archiveWindow.printCalls, 0);
  assert.equal(f.document.documentElement.hasAttribute('data-export-ready'), false);
  assert.equal(f.extras.length, 1);
  f.extras[0].handlers.click();
  assert.equal(f.retries, 1);
});
test('export : délai maximal, résultat tardif ignoré, fermeture nettoyée', async () => {
  const f = fixture();
  let resolveStartup;
  const job = f.start({ timeoutMs: 10 });
  const loaded = f.loaded({ startup: { promise: new Promise(r => resolveStartup = r) } });
  assert.equal(await job, false);
  resolveStartup(); await loaded;
  assert.equal(f.typesets, 0);
  assert.equal(f.printButton.disabled, true);
  const closed = fixture();
  const pending = closed.start();
  closed.listeners.get('pagehide')();
  assert.equal(await pending, false);
  assert.equal(closed.listeners.size, 0);
});

test('distribution locale : tous les composants, extensions et polices correspondent à leur empreinte', async () => {
  const { readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  const root = new URL('../assets/vendor/mathjax-3.2.2/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('SHA256SUMS.json', root), 'utf8'));
  assert.ok(Object.keys(manifest).length > 100);
  await Promise.all(Object.entries(manifest).map(async ([name, expected]) => {
    const actual = createHash('sha256').update(await readFile(new URL(name, root))).digest('hex');
    assert.equal(actual, expected, name);
  }));
});
