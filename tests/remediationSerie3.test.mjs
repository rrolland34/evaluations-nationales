import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import series,{largeNumberQuestion,decimalPositions,decimalLineQuestion,fractionLineQuestion,intervalQuestion,smallestQuestion,generateQuestions} from '../exercices/remediation_evaluations_nationales_6e_serie_3.js';
import {createNumberLineFigure} from '../exercices/figures/numberLineFigure.js';
import {evaluateCurrentAnswer,getCorrectQCMAnswer} from '../core/answerEvaluation.js';
import {formatQCMAnswer,displayQCMOptions} from '../core/qcm.js';
import {storeAnswerForCorrections} from '../core/answerHistory.js';
import {loadExercise} from '../core/exerciseLoader.js';
import {startExerciseSession} from '../core/session.js';
let input='';
const setup=()=>{globalThis.document={getElementById:()=>({value:input})};};
function check(q){
 input=q.answers[0].replace('.',',');assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
 input='';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);
 assert.equal(q.possible_answers.length,4);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
 const good=getCorrectQCMAnswer({question:q});assert.equal(good,q.qcmAnswer);
 assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[good]);
 for(const raw of [...q.answers,...q.possible_answers])assert.doesNotMatch(raw,/\\|\{|\}/);
 for(const raw of q.possible_answers)assert.match(formatQCMAnswer(raw,q),/\\\(/);
 for(const html of [q.question.direct,q.question.qcm,q.display_answer]){
  const outside=html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'');
  assert.equal(outside.trim(),'');assert.doesNotMatch(html,/NaN|undefined|tikz|\\frac\{/);
 }
 assert.equal(Object.hasOwn(q,'duration'),false);
}
function svgLines(html){return [...html.matchAll(/<line\b([^>]+)>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],Number(a[2])])));}
const xFor=(q,value)=>60+640*(value-q.figureConfig.range.min)/(q.figureConfig.range.max-q.figureConfig.range.min);
test('série 3 : 64 Q1, flèche uniquement sur une grande graduation, origine optionnelle',()=>{
 setup();let count=0;
 for(let million=1;million<=8;million++)for(let step=2;step<=9;step++){
  const q=largeNumberQuestion(million*1000000,step);check(q);count++;
  const answer=Number(q.answers[0]);assert.equal(answer,million*1000000+step*100000);
  assert.equal(q.figureConfig.arrows[2].value,answer);assert.equal((answer-q.figureConfig.divisions.origin)%100000,0);
  const lines=svgLines(q.question.direct),x=xFor(q,answer);
  assert.ok(lines.some(l=>Math.abs(l.x1-x)<1e-6&&l.y1===90&&l.y2===68&&l['stroke-width']===2));
  assert.ok(lines.some(l=>Math.abs(l.x1-x)<1e-6&&l.y1===16&&l.y2===60));
  assert.equal(lines.filter(l=>l.y1===90&&l.y2===68&&l['stroke-width']===2).length,11);
  assert.match(q.question.direct,/viewBox="\s*-20\s*-32\s+800\s+212\s*"/);
  for(const rect of q.question.direct.matchAll(/<rect\s+([^>]+)>/g)){
    const attrs=Object.fromEntries([...rect[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],Number(a[2])]));
    assert.ok(attrs.x>-20+15);assert.ok(attrs.x+attrs.width<780-15);
    assert.ok(attrs.y>=-32+8);assert.ok(attrs.y+attrs.height<180);
    if(attrs.y<0){assert.equal(attrs.y,-23);assert.equal(attrs.height,38);}else{assert.equal(attrs.y,121);}
  }
  // La pointe du marqueur dépasse de 2 unités l’extrémité de la ligne :
  // même avec son épaisseur, elle reste au-dessus du sommet y=68.
  assert.ok(60+2+1.5<68);

 }
 assert.equal(count,64);
 const others=[...decimalPositions.map(decimalLineQuestion),...Array.from({length:8},(_,i)=>fractionLineQuestion(i+2))];
 assert.equal(createHash('sha256').update(JSON.stringify(others.map(q=>q.question))).digest('hex'),'14bdecd5237682f719a29aba7a3eac2879669375b5ffca1436bd94a203462b9c');
 assert.equal(createNumberLineFigure(),createNumberLineFigure({viewportPaddingX:0,viewportPaddingTop:0}));
 assert.equal(createNumberLineFigure({arrows:[{value:1}]}),createNumberLineFigure({arrows:[{value:1,tipGap:3}]}));

 for(const min of [0,3,.2])assert.equal(createNumberLineFigure({range:{min,max:min+2}}),createNumberLineFigure({range:{min,max:min+2},divisions:{origin:min}}));
});
test('série 3 : Q2 et Q3 exhaustives, positions exactes et fractions équivalentes',()=>{
 setup();assert.equal(decimalPositions.length,12);
 for(const position of decimalPositions){const q=decimalLineQuestion(position);check(q);assert.equal(Number(q.answers[0]),(position-2)/5);assert.equal(q.figureConfig.points[0].value,Number(q.answers[0]));const x=xFor(q,Number(q.answers[0]));assert.ok(svgLines(q.question.direct).some(l=>l.y1===83&&l.y2===97&&Math.abs((l.x1+l.x2)/2-x)<1e-6));input=q.answers[0].replace('.',',')+(q.answers[0].includes('.')?'00':',00');assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);}
 for(let n=2;n<=9;n++){const q=fractionLineQuestion(n);check(q);assert.equal(q.figureConfig.points[0].value,n/10);const x=xFor(q,n/10);assert.ok(svgLines(q.question.direct).some(l=>l.y1===83&&l.y2===97&&Math.abs((l.x1+l.x2)/2-x)<1e-6));for(const answer of [`${n*3}/30`,`\\frac{${n*2}}{20}`]){input=answer;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);}input='1/0';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);}
});
test('série 3 : intervalle ouvert, bornes refusées et doublon QCM corrigé dans la plage',()=>{
 setup();for(let p=3;p<=5;p++){
  const lower=10**p,upper=lower*10,last=upper+lower;
  for(const inside of [lower+1,upper-1])for(const below of [lower-lower/10,lower-1])for(const above of [upper+1,last-1,last,last+1,10**(p+2)-1]){
   const q=intervalQuestion(p,inside,below,above);check(q);assert.equal(q.qcmOptions[2].value,above===last?above+1:above);
   for(const answer of [String(lower+.5),String(upper-.5),`${lower*2}/1`]){input=answer;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);}
   for(const answer of [String(lower),String(upper),String(lower-1),String(upper+1),'abc','1/0',String(inside)+' cm']){input=answer;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);}
  }
 }
});
test('série 3 : 46 656 comparaisons de nombres, distracteurs Python et ordre affiché',()=>{
 setup();let count=0;
 for(let a=1;a<=9;a++)for(let b=10;b<=80;b+=10)for(let offset=1;offset<=9;offset++)for(let tenth=1;tenth<=9;tenth++)for(let hundredth=1;hundredth<=8;hundredth++){
  const order=[2,0,3,1],q=smallestQuestion(a,b,offset,tenth,hundredth,order),expected=[(a*1000+b+offset)/1000,(a*10+tenth)/10,(a*1000+b+10)/1000,((a+1)*100+hundredth)/100];
  assert.deepEqual(q.qcmOptions.map(o=>o.value),expected);assert.equal(new Set(expected).size,4);assert.equal(Number(q.answers[0]),Math.min(...expected));assert.deepEqual(q.sourceData.order,order);
  if(count%379===0)check(q);count++;
 }
 assert.equal(count,46656);
});
test('série 3 : 1000 tirages, catalogue, curseur et conservation de l’ordre QCM',()=>{
 setup();let seed=20261024;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<1000;i++){
  const qs=generateQuestions(random);assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);qs.forEach(check);
  const q=qs[3],{exponent,inside,below,above}=q.sourceData;assert.ok(exponent>=3&&exponent<=5);assert.ok(inside>10**exponent&&inside<10**(exponent+1));assert.ok(below>=9*10**(exponent-1)&&below<10**exponent);assert.ok(above>10**(exponent+1)&&above<10**(exponent+2));
 }
 const node=()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){}}),container={...node(),appendChild(){}};
 globalThis.document={getElementById:()=>container,createElement:node};globalThis.window={};
 for(const q of generateQuestions(random)){displayQCMOptions(q);const order=[...q.qcmAnswersOrder];displayQCMOptions(q,true);assert.deepEqual(q.qcmAnswersOrder,order);const history=[];storeAnswerForCorrections({presentationMode:'slideshow',userAnswers:history,currentQuestion:q,answerMode:'qcm',correctAnswer:q.answers[0],correctQCMAnswer:q.qcmAnswer,displayAnswer:q.display_answer});assert.deepEqual(history[0].qcmAnswersOrder,order);assert.equal(history[0].qcmRenderAnswer,q.qcmRenderAnswer);for(const answer of order)assert.equal(formatQCMAnswer(answer,history[0]),formatQCMAnswer(answer,q));}
 assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_3'),series);assert.equal(series.shuffle,false);
 assert.match(readFileSync(new URL('../automatismes_6.html',import.meta.url),'utf8'),/data-exercise="remediation_evaluations_nationales_6e_serie_3"/);
 globalThis.document={getElementById:()=>node(),querySelector:()=>({})};globalThis.requestAnimationFrame=fn=>fn();
 for(const selectedTime of [30,45])startExerciseSession({exercice:series,selectedTime,onCloseCorrectionOverlay(){},onQuestionsReady(qs){assert.deepEqual(qs.map(q=>q.time),Array(5).fill(selectedTime));}});
});
