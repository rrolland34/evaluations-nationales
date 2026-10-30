import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import series,{animalSituations,unitQuestion,perimeterQuestion,comparisonQuestion,conversionQuestion,areaQuestion,generateQuestions,comparisonPowers} from '../exercices/remediation_evaluations_nationales_6e_serie_5.js';
import {createGridAreaFigure} from '../exercices/figures/gridAreaFigure.js';
import {evaluateCurrentAnswer} from '../core/answerEvaluation.js';
import {formatQCMAnswer,displayQCMOptions} from '../core/qcm.js';
import {storeAnswerForCorrections} from '../core/answerHistory.js';
import {loadExercise} from '../core/exerciseLoader.js';
import {startExerciseSession} from '../core/session.js';

let input='';
const setup=()=>{globalThis.document={getElementById:()=>({value:input})};};
function check(q) {
  input=q.answers[0];assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
  for(const wrong of ['',q.id==='q1'?'km':String(Number(q.answers[0])+1)]) {
    input=wrong;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
  }
  assert.equal(q.possible_answers.length,4);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
  assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[q.qcmAnswer]);
  for(const answer of [...q.answers,...q.possible_answers])assert.doesNotMatch(answer,/\\|NaN|Infinity|undefined/);
  for(const answer of q.possible_answers)assert.match(formatQCMAnswer(answer,q),/\\\(/);
  for(const html of [q.question.direct,q.question.qcm,q.display_answer]) {
    assert.equal(html.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'').trim(),'');
    assert.doesNotMatch(html,/textcolor|tikz|boxed/);
  }
}

test('série 5 : les 20 animaux et leurs unités originales, validation indépendante de MathJax',()=>{
  setup();assert.equal(animalSituations.length,20);
  const units=['mm','cm','cm','m','m','m','mm','mm','dm','dm','mm','m','m','mm','dm','dm','dm','cm','cm','cm'];
  const values=[7,2.5,1.4,1.7,9,4.2,7,5,1.5,5.1,4,1.4,27,3,4,3.8,7.1,2.3,1.3,7];
  for(let i=0;i<20;i++){
    const q=unitQuestion(i);check(q);assert.equal(q.answers[0],units[i]);assert.equal(q.sourceData.value,values[i]);
    assert.deepEqual(new Set(q.possible_answers),new Set(['mm','cm','dm','m']));
    input=' '+units[i].toUpperCase()+' ';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
    assert.ok(q.display_answer.includes('\\mathrm{'+units[i]+'}'));
  }
});

test('série 5 : les 12 périmètres et 14 aires, collisions corrigées uniquement pour 3 × 6',()=>{
  setup();const perimeters=new Set(),areas=new Set();let count=0;
  for(let a=3;a<=5;a++)for(let b=a+1;b<=8;b++){
    const p=perimeterQuestion(a,b),q=areaQuestion(a,b);check(p);check(q);count++;
    perimeters.add(p.answers[0]);areas.add(q.answers[0]);assert.equal(Number(p.answers[0]),a+a+b+b);assert.equal(Number(q.answers[0]),a*b);
    assert.deepEqual(p.qcmOptions.map(o=>o.value),[2*(a+b),2*b,2*b+a,a===3&&b===6?a+b:a*b]);
    assert.deepEqual(q.qcmOptions.map(o=>o.value),[a*b,a===3&&b===6?2*b:2*(a+b),a+b,a*b+2*a]);
    assert.match(p.question.direct,/fill="none"/);assert.match(p.question.direct,/stroke="black"/);
    assert.match(q.question.direct,/fill="blue"/);assert.match(q.question.direct,/fill-opacity="0.5"/);assert.match(q.question.direct,/stroke="none"/);
    for(const question of [p,q]){
      const svg=question.question.direct.match(/<svg[\s\S]*?<\/svg>/)[0];
      assert.equal((svg.match(/<line/g)||[]).length,19);assert.doesNotMatch(svg,/<rect|<text/);
      assert.ok(!question.display_answer.includes(svg));assert.ok(question.question.qcm.includes(svg));
      const points=svg.match(/points="([^"]+)"/)[1].split(' ').map(s=>s.split(',').map(Number));
      assert.ok(Math.abs(points[1][0]-points[0][0]-a*30)<1e-8);assert.ok(Math.abs(points[1][1]-points[2][1]-b*30)<1e-8);
      const box=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
      assert.deepEqual(box.slice(0,3),[0,0,222]);assert.ok(Math.abs(box[3]-312)<1e-8);
    }
  }
  for(const side of [3,5]){const q=areaQuestion(side,side);check(q);areas.add(q.answers[0]);assert.equal(q.sourceData.shape,'carré');}
  assert.equal(count,12);assert.equal(perimeters.size,7);assert.equal(areas.size,13);
  assert.deepEqual(perimeterQuestion(3,6).qcmOptions.map(o=>o.value),[18,12,15,9]);
  assert.deepEqual(areaQuestion(3,6).qcmOptions.map(o=>o.value),[18,12,9,24]);
});

test('série 5 : les six comparaisons et les 2430 conversions, résultats exacts sans unité',()=>{
  setup();const expected=[1000,100,10,10,100,1000],results=new Set();let count=0;
  for(let i=0;i<6;i++){const q=comparisonQuestion(i);check(q);assert.equal(Number(q.answers[0]),expected[i]);assert.deepEqual(new Set(q.possible_answers),new Set(['10','100','1000','10000']));assert.ok(q.question.direct.includes(i<3?'petit':'grand'));}
  const unitExponents={km:3,hm:2,dam:1,m:0,dm:-1,cm:-2,mm:-3};
  for(let a=11;a<=99;a++)if(a%10!==0)for(const power of [-3,-2,-1,1,2,3])for(let c=Math.max(0,-power);c<=Math.min(6,6-power);c++){
    const q=conversionQuestion(a,power,c);check(q);count++;results.add(q.answers[0]);
    const {from,to}=q.sourceData;assert.equal(unitExponents[from]-unitExponents[to],power);
    // Comparaison rationnelle indépendante : aucune approximation attendue dans les chaînes techniques.
    const rational=text=>{const [whole,decimal='']=text.split('.');return [BigInt(whole+decimal),10n**BigInt(decimal.length)];};
    const [n,d]=rational(q.answers[0]);assert.equal(power>0?n:n*10n**BigInt(-power),power>0?BigInt(a)*10n**BigInt(power)*d:BigInt(a)*d);
    const exponents=power>0?[power,power+1,-power,-power-1]:[power,power-1,-power,-power+1];
    assert.deepEqual(q.qcmOptions.map(o=>o.value),exponents.map(p=>p>0?a*10**p:a/10**(-p)));
    input=q.answers[0].replace('.',',');assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
  }
  assert.equal(count,2430);assert.equal(results.size,486);
});

test('série 5 : le SVG historique reste strictement identique, options de bornes et couleurs indépendantes',()=>{
  const figures=[{}, {gridWidth:5,gridHeight:8,cellSize:25}].map(c=>createGridAreaFigure({polygonPoints:[[1,1],[1,3],[4,3],[4,1]],...c}));
  assert.equal(createHash('sha256').update(JSON.stringify(figures)).digest('hex'),'8818b5978fcd62b943be7b3e5f0470f8081eac0e9f5dca210d887e9fed81a332');
  assert.match(figures[0],/viewBox="0 0 450 335"/);assert.match(figures[0],/1 cm/);assert.match(figures[0],/fill="gold"/);
});

test('série 5 : tirages conditionnels, bornes et familles rectangle/carré équiprobables',()=>{
  setup();let seed=5941;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  let squares=0;const seen=new Set();
  for(let i=0;i<2000;i++){
    const qs=generateQuestions(random);assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);if(i%37===0)qs.forEach(check);
    const p=qs[1].sourceData,c=qs[3].sourceData,a=qs[4].sourceData;
    assert.ok(p.a>=3&&p.a<=5&&p.b>p.a&&p.b<=8);assert.ok(c.a>=11&&c.a<=99&&c.a%10!==0);assert.ok(comparisonPowers.includes(c.power));assert.ok(c.unitIndex>=0&&c.unitIndex+c.power>=0&&c.unitIndex+c.power<=6);
    if(a.a===a.b){squares++;assert.ok([3,5].includes(a.a));}else assert.ok(a.a>=3&&a.a<=5&&a.b>a.a&&a.b<=8);
    seen.add(`${a.a},${a.b}`);
  }
  assert.equal(seen.size,14);assert.ok(squares>900&&squares<1100);
  for(const random of [()=>0,()=>1-Number.EPSILON])generateQuestions(random).forEach(check);
});

test('série 5 : catalogue, six boutons, durée et historique QCM natifs',()=>{
  assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_5'),series);assert.equal(series.shuffle,false);
  const page=readFileSync(new URL('../automatismes_6.html',import.meta.url),'utf8');
  const section=page.match(/<section[^>]+aria-labelledby="remediation-evaluations-nationales-title"[\s\S]*?<\/section>/)[0];
  assert.deepEqual([...section.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]),[1,2,3,4,5,6].map(n=>'remediation_evaluations_nationales_6e_serie_'+n));
  assert.doesNotMatch(page,/aria-labelledby="sixieme-domain-[12]"/);
  const ids=[...page.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
  const node=()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){}}),container={...node(),appendChild(){}};
  globalThis.document={getElementById:()=>container,createElement:node};globalThis.window={};
  for(const q of generateQuestions()){
    displayQCMOptions(q);const order=[...q.qcmAnswersOrder];assert.deepEqual(new Set(order),new Set(q.possible_answers));
    displayQCMOptions(q,true);assert.deepEqual(q.qcmAnswersOrder,order);
    const history=[];storeAnswerForCorrections({presentationMode:'slideshow',userAnswers:history,currentQuestion:q,answerMode:'qcm',correctAnswer:q.answers[0],correctQCMAnswer:q.qcmAnswer,displayAnswer:q.display_answer});
    assert.deepEqual(history[0].qcmAnswersOrder,order);for(const answer of order)assert.equal(formatQCMAnswer(answer,history[0]),formatQCMAnswer(answer,q));
  }
  globalThis.document={getElementById:()=>node(),querySelector:()=>({})};globalThis.requestAnimationFrame=fn=>fn();
  for(const selectedTime of [30,45])startExerciseSession({exercice:series,selectedTime,onCloseCorrectionOverlay(){},onQuestionsReady(qs){assert.deepEqual(qs.map(q=>q.time),Array(5).fill(selectedTime));}});
});


test('série 5 : figures conservées dans les énoncés uniquement',()=>{
 for(const q of generateQuestions()) for(const mode of ['direct','qcm']){
  const correction=typeof q.display_answer==='string'?q.display_answer:q.display_answer[mode];
  assert.doesNotMatch(correction,/<svg/);
  assert.match(correction,/color:red/);
  if(['q2','q5'].includes(q.id)) assert.match(q.question[mode],/<svg/);
 }
});
