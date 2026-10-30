import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMath, clearMath } from '../core/mathRendering.js';
import { renderStepCorrection } from '../core/stepCorrectionRenderer.js';
const deferred = () => { let resolve; const promise = new Promise(r => resolve=r); return {promise,resolve}; };
function setup(mathJax) {
  globalThis.window={MathJax:mathJax};
  const doc={createElement(){return {children:[],style:{}, appendChild(child){this.children.push(child);}, set innerHTML(v){this.html=v;this.children=[];},get innerHTML(){return this.html;}};}};
  globalThis.document=doc;return doc.createElement();
}
test('service : cible précise, déduplication et promesse de fin',async()=>{
  const pending=deferred(), calls=[];const container=setup({typesetPromise(nodes){calls.push(nodes);return pending.promise;}});
  const a=renderMath(container),b=renderMath(container);assert.equal(a,b);assert.deepEqual(calls,[[container]]);
  let ended=false;a.then(()=>ended=true);await Promise.resolve();assert.equal(ended,false);
  pending.resolve();assert.equal(await a,true);assert.equal(ended,true);
});
test('service : disponibilité différée, attente bornée et absence',async()=>{
  const startup=deferred();let calls=0;
  const root=setup({startup:{promise:startup.promise},typesetPromise(){calls++;return Promise.resolve();}});
  const work=renderMath(root);assert.equal(calls,0);startup.resolve();assert.equal(await work,true);assert.equal(calls,1);
  setup({startup:{promise:new Promise(()=>{})}});assert.equal(await renderMath({}, {timeoutMs:5}),false);
  setup(undefined);assert.equal(await renderMath({}),false);
});
test('service : erreur signalée, navigation suivante possible',async()=>{
  const warnings=[],original=console.warn;console.warn=(...args)=>warnings.push(args);
  try {
    const root=setup({typesetPromise(){throw Error('fixture');}});
    assert.equal(await renderStepCorrection({container:root,scene:{html:'a'}}),false);
    assert.equal(warnings.length,1);
    window.MathJax={typesetPromise:()=>Promise.resolve()};
    assert.equal(await renderStepCorrection({container:root,scene:{html:'b'}}),true);
  } finally {console.warn=original;}
});
test('renderer : html et contenu latéral, cibles isolées, nettoyage avant remplacement et après travail tardif',async()=>{
  const pending=[],calls=[],cleared=[];
  const root=setup({typesetPromise(nodes){calls.push(nodes);const d=deferred();pending.push(d);return d.promise;},typesetClear(nodes){cleared.push(nodes);}});
  const ready=[];
  const draw=id=>renderStepCorrection({container:root,scene:{id,html:id,sideContent:{html:'side',color:'red'}},onReady:()=>ready.push(id)});
  const old=draw('old');assert.equal(calls[0][0].children[0].innerHTML,'side');assert.equal(calls[0][1].innerHTML,'old');
  const current=draw('current');assert.deepEqual(cleared[0],calls[0]);assert.notEqual(calls[0][0],calls[1][0]);
  pending[1].resolve();await current;pending[0].resolve();await old;
  assert.deepEqual(ready,['current']);assert.equal(cleared.length,2);
  clearMath(root);
});
test('renderer : remplacement externe et fermeture interdisent les rappels tardifs, scène vide acceptée',async()=>{
  const d=deferred();const root=setup({typesetPromise:()=>d.promise});let called=0;
  const p=renderStepCorrection({container:root,scene:{},onReady:()=>called++});
  root.innerHTML='question';d.resolve();await p;assert.equal(called,0);
  const q=renderStepCorrection({container:root,scene:{html:'closed'},onReady:()=>called++});root.isConnected=false;await q;assert.equal(called,0);
});
