import {remediationMathPresentation} from '../exercices/remediationMathPresentation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import series,{integerVariants,decimalVariants,unitVariants,integerQuestion,decimalQuestion,decompositionQuestion,fractionQuestion,unitQuestion,generateQuestions,unitValue,integerFamily,decimalFamily,unitFamily,frenchNumber} from '../exercices/remediation_evaluations_nationales_6e_serie_1.js';
import {evaluateCurrentAnswer,getCorrectQCMAnswer} from '../core/answerEvaluation.js';
import {displayQCMOptions,formatQCMAnswer} from '../core/qcm.js';
import {storeAnswerForCorrections} from '../core/answerHistory.js';
import {loadExercise} from '../core/exerciseLoader.js';
let input='';
function check(q){
 globalThis.document={getElementById:()=>({value:input})};
 assert.equal(q.possible_answers.length,4);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
 input=q.answers[0].replace('.',',');assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,JSON.stringify(q));
 input='';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
 const correct=getCorrectQCMAnswer({question:q});
 assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[correct]);
 assert.equal(correct,q.possible_answers[0]);assert.equal(Object.hasOwn(q,'duration'),false);assert.match(q.display_answer,/color:red/);
 assert.doesNotMatch(q.display_answer,/textcolor|boxed|tikz|undefined|NaN/);
 for(const text of q.possible_answers)assert.equal(formatQCMAnswer(text,q),remediationMathPresentation(text));
}
test('remédiation : dictionnaires PythonTeX complets, zéros finaux, variantes ambiguës identifiées',()=>{
 assert.equal(createHash('sha256').update(JSON.stringify([integerVariants,decimalVariants,unitVariants])).digest('hex'),'06857d98af046d923071bb38a51e680d5b4d1c90f546f5579d7a72c4b17cbd25');
 for(const list of [integerVariants,decimalVariants,unitVariants])assert.equal(list.length,20);
 const rejected=[];
 for(let i=0;i<20;i++){
  check(integerQuestion(i));check(unitQuestion(i));
  assert.ok(Math.abs(unitValue(unitVariants[i].choices[0])-unitVariants[i].value)<1e-12);
  if(new Set(decimalVariants[i].choices.map(s=>Number(s.replace(',','.')))).size<4){rejected.push(decimalVariants[i].value);assert.throws(()=>decimalQuestion(i),/ambigu/);}else check(decimalQuestion(i));
 }
 assert.deepEqual(rejected,[1.2,4.5,9.4,10.7,20.9]);
 assert.match(decimalQuestion(0).possible_answers[1],/0\{,\}200/);
 assert.match(decimalQuestion(11).possible_answers[1],/0\{,\}720/);
 assert.deepEqual(decimalVariants[15].choices,['1,2','0,12','12,1','12,10']);
 assert.equal(decimalVariants[11].choices[3],'72,1000');
});
test('remédiation : toutes les combinaisons Q3 et Q4, valeurs et distracteurs originaux',()=>{
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)for(let c=1;c<=2;c++){
  const q=decompositionQuestion(a,b,c);check(q);assert.equal(Number(q.answers[0]),a+b/10**c);
  assert.equal(q.qcmOptions[1].value,(a*10**c+b)/10**(c+1));
  assert.equal(q.qcmOptions[2].text,`\\(${a*10+b}{,}${'0'.repeat(c)}\\)`);
 }
 for(let a=2;a<=9;a++)for(let b=1;b<=3;b++){const q=fractionQuestion(a,b);check(q);assert.deepEqual(q.qcmOptions.map(o=>o.value),[a/10**b,a/(b===2?10:100),a,a*10**b]);assert.match(q.question.direct,/\\dfrac/);}
});
test('remédiation : 1000 séries ordonnées, familles valides et intégration',()=>{
 let seed=42;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<1000;i++){const qs=generateQuestions(rng);assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);qs.forEach(q=>assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4));}
 for(const constant of [0,.99])assert.equal(generateQuestions(()=>constant).length,5);
 let first=true;assert.equal(generateQuestions(()=>{if(first){first=false;return .99;}return 0;}).length,5);
 assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_1'),series);assert.equal(series.shuffle,false);
 assert.match(readFileSync(new URL('../automatismes_6.html',import.meta.url),'utf8'),/data-exercise="remediation_evaluations_nationales_6e_serie_1"/);
});
test('remédiation : mélange stable et ordre conservé dans historique et correction',()=>{
 const node=()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){}}),container={...node(),appendChild(){}};
 globalThis.document={getElementById:()=>container,createElement:node};globalThis.window={};
 for(const q of generateQuestions()){
  displayQCMOptions(q);const order=[...q.qcmAnswersOrder];displayQCMOptions(q,true);assert.deepEqual(q.qcmAnswersOrder,order);assert.deepEqual([...order].sort(),[...q.possible_answers].sort());
  const history=[];storeAnswerForCorrections({presentationMode:'slideshow',userAnswers:history,currentQuestion:q,answerMode:'qcm',correctAnswer:q.answers[0],displayAnswer:q.display_answer,correctQCMAnswer:q.qcmAnswer});
  assert.deepEqual(history[0].qcmAnswersOrder,order);assert.equal(history[0].displayAnswer,q.display_answer);assert.equal(history[0].correctQCMAnswer,q.qcmAnswer);
 }
});

test('remédiation : familles enrichies exhaustives et valeurs mathématiques distinctes',()=>{
 const integers=new Set(),decimals=new Set(),relations=new Set();
 for(const base of [70,90])for(let t=base;t<base+10;t++)for(let n=1;n<=99;n++){
  const q=integerFamily(t,n);check(q);assert.equal(Number(q.answers[0]),t*1000+n);integers.add(q.question.direct);
  assert.equal(q.qcmOptions[1].value,Number(`${t}${1000+n}`));
 }
 for(let n=1;n<=99;n++){
  const tenths=decimalFamily(n,1);
  assert.deepEqual(tenths.qcmOptions.map(o=>o.value),[n/10,n/100,n+0.1,n+0.01]);
  assert.equal(tenths.possible_answers[3],`\\(${n}{,}01\\)`);
  for(const c of [1,2,3]){const q=decimalFamily(n,c);check(q);assert.equal(Number(q.answers[0]),n/10**c);decimals.add(q.question.direct);}
 }
 for(let m=0;m<6;m++)for(let n=1;n<=9;n++){
  const q=unitFamily(m,n);check(q);relations.add(q.question.direct);
  const statement=q.question.direct.replace(/\\text\{([^{}]*)\}/g,'$1').replace(/\\\(|\\\)/g,'').replace(/<[^>]*>/g,'').split(' est égal à ');
  const left=unitValue(statement[0]);assert.ok(Math.abs(left-q.qcmOptions[0].value)<1e-12);
  assert.match(q.possible_answers[0],/^(10|100|1 000) fois /);
 }
 assert.deepEqual([integers.size,decimals.size,relations.size],[1980,297,54]);
 assert.deepEqual(decimalFamily(12,1).qcmOptions.map(o=>o.value),[1.2,0.12,12.1,12.01]);
 assert.match(decimalFamily(2,3).possible_answers[1],/0\{,\}200/);assert.match(decimalFamily(72,3).possible_answers[1],/0\{,\}720/);assert.match(decimalFamily(3,2).possible_answers[1],/0\{,\}30/);
 assert.equal(frenchNumber(71),'soixante-et-onze');assert.equal(frenchNumber(80),'quatre-vingts');assert.equal(frenchNumber(91),'quatre-vingt-onze');
});
test('remédiation : tolérance locale numérique et orthographique sans confusion',()=>{
 globalThis.document={getElementById:()=>({value:input})};
 for(const q of [integerFamily(70,13),decimalFamily(26,2),decompositionQuestion(2,6,1),fractionQuestion(6,1)]){
  for(const text of [q.answers[0],q.answers[0].replace('.',','),q.answers[0].includes('.')?q.answers[0]+'00':q.answers[0]+',00',Number(q.answers[0]).toLocaleString('fr-FR')]){
   input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,text);
  }
  for(const text of ['',String(Number(q.answers[0])+0.01),String(Number(q.answers[0])+1e-10),q.answers[0]+' cm']){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false,text);}
 }
 const q=unitFamily(0,5);
 for(const text of ['5 millièmes','5 milliemes','5 millième','5milliemes','5milieme','5 milièmes',' 5 MILIÈMES ']){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,text);}
 for(const text of ['5 centièmes','5 dixièmes','5 unités','5 dizaines','5 centaines','6 millièmes','millièmes','5 mil','5 millièmes de seconde','5.0 millièmes']){input=text;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false,text);}
 for(const [model,answer] of [[1,'3 milliemes'],[2,'3 centiemes'],[3,'3 milliemes'],[4,'3 dixiemes'],[5,'3 unites']]){const q=unitFamily(model,3);input=answer;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);input='3 millièmes';if(answer!=='3 milliemes')assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);}
});

test('série 1 : textes MathJax uniquement dans la présentation, données brutes intactes',()=>{
 for(const q of generateQuestions()){
  assert.doesNotMatch(q.answers.join(''),/\\text|\\mathbf/);
  for(const html of [q.question.direct,q.question.qcm,q.display_answer,...q.possible_answers.map(a=>formatQCMAnswer(a,q))]){
   const outside=html.replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'');
   assert.equal(outside.trim(),'');assert.doesNotMatch(html,/<strong>|\\frac\{/);
  }
 }
 const q=unitFamily(0,5);assert.equal(q.answers[0],'5 millièmes');assert.equal(q.possible_answers[0],'10 fois 5 millièmes');
 assert.match(formatQCMAnswer(q.possible_answers[0],q),/\\text\{millièmes\}/);
});
