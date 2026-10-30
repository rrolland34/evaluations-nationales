import {formatQCMAnswer} from '../core/qcm.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import series,{rankQuestion,sumQuestion,decompositionQuestion,unitsQuestion,equivalentFractionQuestion,fractionParameters,generateQuestions,initializeRankSelect,ranks} from '../exercices/remediation_evaluations_nationales_6e_serie_2.js';
import {evaluateCurrentAnswer,getCorrectQCMAnswer} from '../core/answerEvaluation.js';
import {loadExercise} from '../core/exerciseLoader.js';
import {startExerciseSession} from '../core/session.js';
let input='';
const setup=()=>{globalThis.document={getElementById:()=>({value:input})};};
function check(q){
 assert.equal(q.possible_answers.length,4);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
 input=q.answers[0].replace('.',',');assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,q.id+' '+input);
 input='';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
 const good=getCorrectQCMAnswer({question:q});assert.equal(good,q.qcmAnswer);
 assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[good]);
 assert.doesNotMatch(q.display_answer,/NaN|undefined|textcolor|tikz/);assert.match(q.display_answer,/color:red/);
}
test('série 2 : Q1, tous les rangs et menu local raccordé à Valider',()=>{
 setup();for(let position=0;position<4;position++){const q=rankQuestion([4,7,2,5,8,3],position);check(q);assert.equal(q.answers[0],ranks[position]);assert.equal(q.sourceData.value,4725.83);}
 const field={style:{display:'inline-block'},value:'ancienne réponse'},container={appendChild(e){this.child=e;}};
 const dom={getElementById:id=>id==='user-answer'?field:{querySelector:()=>container},createElement:()=>({style:{},children:[],setAttribute(){},appendChild(e){this.children.push(e);},addEventListener(type,fn){this.change=fn;},removeEventListener(){},remove(){this.removed=true;}})};
 const cleanup=initializeRankSelect({document:dom}),select=container.child;
 assert.deepEqual(select.children.map(o=>o.value),['',...ranks]);assert.equal(field.value,'');assert.equal(field.style.display,'none');
 globalThis.document=dom;const q=rankQuestion([4,7,2,5,8,3],1);
 assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
 select.value='centaines';select.change();assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
 select.value='milliers';select.change();assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
 select.value='centaines';select.change();cleanup();
 // checkAnswer nettoie l’interaction avant evaluateCurrentAnswer : préserver la saisie.
 assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
 assert.equal(field.style.display,'inline-block');assert.equal(field.value,'centaines');assert.equal(select.removed,true);
});
test('série 2 : Q2 et Q3 exhaustives, plages et distracteurs Python',()=>{
 setup();let sums=0,decompositions=0;
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)for(let c=1;c<=9;c++)for(let d=1;d<=9;d++){
  if(new Set([a,b,c,d]).size===4)for(let family=1;family<=2;family++){
   const q=sumQuestion([a,b,c,d],family);check(q);assert.deepEqual(q.qcmOptions.map(o=>o.value),[a*100000+b*10000+c*10**(3-family)+d,a*10000+b*1000+c*10**(3-family)+d,a*1000000+b*100000+c*10**(3-family)+d,a*1000+b*100+c*10+d]);sums++;
  }
 }
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)for(let c=1;c<=2;c++)for(let d=1;d<=9;d++){
  const q=decompositionQuestion(a,b,c,d);check(q);const expected=c===1?[a+b/10+d/1000,a+b/10+d/100,a*100+b*10+d,a*10+b+d/10]:[a+b/100+d/1000,a+b/10+d/100,a*100+b*10+d,a+b/10+d/1000];
  q.qcmOptions.forEach((o,i)=>assert.ok(Math.abs(o.value-expected[i])<1e-12));decompositions++;
 }
 assert.equal(sums,6048);assert.equal(decompositions,1458);
});
test('série 2 : Q4 exhaustive, dépassement de dix dixièmes ou cent centièmes',()=>{
 setup();let count=0,collisions=0;
 for(let a=2;a<=9;a++)for(const family of [0,1])for(let n=family===0?10:100;n<=(family===0?99:999);n++)if(n%10!==0){
  if(n===(family===0?11:111)*a){assert.throws(()=>unitsQuestion(a,n,family),/ambigu/);collisions++;continue;}
  const q=unitsQuestion(a,n,family);check(q);assert.equal(Number(q.answers[0]),(a*(family===0?10:100)+n)/(family===0?10:100));count++;
 }
 assert.equal(count,7112);assert.equal(collisions,16);assert.equal(unitsQuestion(3,24,0).answers[0],'5.4');
});
test('série 2 : 16 paramètres Q5, 16 valides, équivalences reconnues par le validateur partagé',()=>{
 setup();let repaired=0;
 for(let a=2;a<=5;a++)for(let b=2;b<=5;b++){

  const q=equivalentFractionQuestion(a,b);check(q);
  const changed=b===2||b-1===a;
  const pairs=[[b,a*b],[a*b,a*b],changed?[b+1,a*b]:[b-1,a],[a*b,a]];
  if(changed)repaired++;
  assert.deepEqual(q.possible_answers,pairs.map(([n,d])=>`\\(\\dfrac{${n}}{${d}}\\)`));
  // Vérification exacte par produits croisés, indépendante de la comparaison flottante.
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert.notEqual(pairs[i][0]*pairs[j][1],pairs[j][0]*pairs[i][1]);
  assert.equal(pairs.filter(([n,d])=>n*a===d).length,1);

  for(const text of [`${b}/${a*b}`,`${b*3}/${a*b*3}`,`\\frac{${b}}{${a*b}}`,`\\dfrac{${b}}{${a*b}}`]){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,text);}
  for(const text of ['','0/0','1/0',`${b+1}/${a*b}`,'abc',String(1/a)]){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false,text);}
 }
 assert.equal(repaired,7);assert.equal(fractionParameters.length,16);
 assert.equal(new Set(fractionParameters.map(p=>`${p.denominator}/${p.coefficient}`)).size,16);
});
test('série 2 : comparaison numérique partagée, génération et durée du curseur',()=>{
 setup();for(const q of [sumQuestion([1,2,3,4],1),decompositionQuestion(2,6,1,3),unitsQuestion(3,24,0)]){
  for(const text of [Number(q.answers[0]).toLocaleString('fr-FR'),q.answers[0].replace('.',','),q.answers[0]+(q.answers[0].includes('.')?'00':',00')]){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,text);}
  for(const text of [String(Number(q.answers[0])+0.01),'abc',q.answers[0]+' cm']){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);}
 }
 let seed=123;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<1000;i++){
  const qs=generateQuestions(rng);assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);
  for(const [index,n] of [[0,6],[1,4]]){const digits=qs[index].sourceData.digits;assert.equal(new Set(digits).size,n);digits.forEach(d=>assert.ok(d>=1&&d<=9));}
  assert.ok(qs[3].sourceData.a>=2&&qs[3].sourceData.a<=9);assert.notEqual(qs[3].sourceData.count%10,0);
  qs.forEach(q=>{assert.equal(Object.hasOwn(q,'duration'),false);check(q);});
 }
 assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_2'),series);assert.equal(series.shuffle,false);
 globalThis.document={getElementById:()=>({style:{},classList:{add(){}}}),querySelector:()=>({})};globalThis.requestAnimationFrame=fn=>fn();
 for(const selectedTime of [30,45])startExerciseSession({exercice:series,selectedTime,onCloseCorrectionOverlay(){},onQuestionsReady(qs){assert.deepEqual(qs.map(q=>q.time),Array(5).fill(selectedTime));}});
});

test('série 2 : présentation MathJax, gras et données de validation séparées',()=>{
 for(const q of generateQuestions()){
  assert.doesNotMatch(q.answers.join(''),/\\text|\\mathbf/);
  for(const html of [q.question.direct,q.question.qcm,q.display_answer,...q.possible_answers.map(a=>formatQCMAnswer(a,q))]){
   assert.equal(html.replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'').trim(),'');
   assert.doesNotMatch(html,/<strong>|\\frac\{/);
  }
 }
 const q=rankQuestion([4,7,2,5,8,3],1);assert.equal(q.answers[0],'centaines');assert.equal(q.possible_answers[1],'centaines');assert.match(q.display_answer,/\\mathbf\{\\text\{centaines\}\}/);assert.equal(q.initializeResponse,initializeRankSelect);
 assert.equal(fractionParameters.length,16);
});
