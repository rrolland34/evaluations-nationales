import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import series,{coloredFigureQuestion,complementQuestion,halfQuestion,powerQuestion,timesFiveQuestion,timesFiveParameters,scaledDecimal,generateQuestions} from '../exercices/remediation_evaluations_nationales_6e_serie_4.js';
import {createStripFigure} from '../exercices/figures/fractionsFigures.js';
import {evaluateCurrentAnswer,getCorrectQCMAnswer} from '../core/answerEvaluation.js';
import {formatQCMAnswer,displayQCMOptions} from '../core/qcm.js';
import {storeAnswerForCorrections} from '../core/answerHistory.js';
import {loadExercise} from '../core/exerciseLoader.js';
import {startExerciseSession} from '../core/session.js';
let input='';const setup=()=>{globalThis.document={getElementById:()=>({value:input})};};
function check(q){
 input=q.answers[0];assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true,q.id+' '+input);
 for(const wrong of ['',q.id==='q1'?'1/1':String(q.qcmOptions[0].value+1)]){input=wrong;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,false);}
 assert.equal(q.possible_answers.length,4);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
 const good=getCorrectQCMAnswer({question:q});assert.equal(good,q.qcmAnswer);assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[good]);
 for(const text of [...q.answers,...q.possible_answers])assert.doesNotMatch(text,/\\|NaN|undefined|Infinity/);
 for(const text of q.possible_answers)assert.match(formatQCMAnswer(text,q),/\\\(/);
 for(const html of [q.question.direct,q.question.qcm,q.display_answer])assert.equal(html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'').trim(),'');
 assert.equal(Object.hasOwn(q,'duration'),false);
}
test('série 4 : 38 figures admissibles, bandes égales et composant antérieur inchangé',()=>{
 setup();let count=0;
 for(let a=5;a<=11;a++)for(let b=2;b<=a-1;b++)if(b*2!==a+1){
  const q=coloredFigureQuestion(a,b);check(q);count++;const config=q.sourceData.figureConfig;
  assert.equal(config.parts,a+1);assert.equal(config.coloredParts.length,b);assert.equal(config.partWidth,22);assert.equal(config.rectangleHeight,160);
  assert.deepEqual(q.qcmOptions.map(o=>o.value),[b/(a+1),b/(a+1-b),1,(a+1-b)/(a+1)]);
  assert.equal((q.question.direct.match(/fill="rgba\(255, 255, 0, 0.5\)"/g)||[]).length,b);
  assert.equal((q.question.direct.match(/<line\b/g)||[]).length,a);assert.equal(q.question.direct.slice(q.question.direct.indexOf('<svg')),q.question.qcm.slice(q.question.qcm.indexOf('<svg')));
  assert.match(q.display_answer,new RegExp('dfrac\\{'+b+'\\}\\{'+(a+1)+'\\}'));
  input=`${b*2}/${(a+1)*2}`;assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
 }
 assert.equal(count,38);
 assert.equal(createHash('sha256').update(JSON.stringify(Array.from({length:20},(_,i)=>createStripFigure({parts:i+1,coloredParts:Array.from({length:i},(_,j)=>j)})))).digest('hex'),'d91375321789f74db217a5eafc05914c9f8080a86c4bd8f080a1d3afd8a565dd');
});
test('série 4 : 405 compléments et 30 moitiés, écritures originales et doublon ciblé',()=>{
 setup();let complements=0,halves=0;
 for(let a=11;a<=99;a++)if(a%10!==0)for(let b=4;b<=8;b++){const q=complementQuestion(a,b);check(q);assert.deepEqual(q.qcmOptions.map(o=>o.value),[b,b-1,b-2,b+1]);assert.ok(q.display_answer.includes(`${10*a-b}+${b}=${10*a}`));complements++;}
 for(let a=2;a<=20;a+=2)for(let family=1;family<=3;family++){
  const q=halfQuestion(a,family);check(q);const half=a/2;
  assert.equal(q.sourceData.input,`${a},1${'0'.repeat(family)}`);
  assert.deepEqual(q.qcmOptions.slice(0,3).map(o=>o.display),q.sourceData.originalDisplays.slice(0,3));
  assert.equal(q.qcmOptions[2].value,Number(q.sourceData.originalDisplays[3].replace(',','.')));
  assert.equal(q.qcmOptions[3].display,`${half},005${'0'.repeat(family-1)}`);
  assert.equal(q.answers[0],`${half},05`);assert.ok(q.question.direct.includes(`${a}{,}1${'0'.repeat(family)}`));assert.ok(q.display_answer.includes(`${a}{,}1${'0'.repeat(family)}`));
  halves++;
 }
 assert.equal(complements,405);assert.equal(halves,30);
});
test('série 4 : 161820 calculs de puissances, exactitude des écritures sans arrondi',()=>{
 setup();let count=0;
 for(let whole=101;whole<=999;whole++)for(let tenth=0;tenth<=9;tenth++)for(let hundredth=1;hundredth<=9;hundredth++)for(const power of [1,2]){
  const cents=whole*100+tenth*10+hundredth,exponents=power===1?[1,-1,-2,2]:[2,1,-1,-2];
  for(const exponent of exponents){const raw=scaledDecimal(cents,2-exponent),digits=raw.replaceAll(' ','').split(',');const places=digits[1]?.length||0,numerator=BigInt(digits.join(''));assert.equal(numerator*10n**BigInt(2-exponent),BigInt(cents)*10n**BigInt(places));}
  if(count%499===0||whole===999&&tenth===9&&hundredth===9){const q=powerQuestion(cents,power);check(q);assert.deepEqual(q.qcmOptions.map(o=>o.display),exponents.map(e=>scaledDecimal(cents,2-e)));}
  count++;
 }
 assert.equal(count,161820);
});
test('série 4 : 32 multiplications par 5, concaténations et zéro final conservés',()=>{
 setup();assert.equal(timesFiveParameters.length,32);
 for(const n of timesFiveParameters){assert.ok(n>=21&&n<=98&&n%2===0&&n%10!==0);const q=timesFiveQuestion(n);check(q);const whole=Math.floor(n/10)*5,rest=n%10/2;
  assert.deepEqual(q.qcmOptions.map(o=>o.display),[String(n/2),scaledDecimal(n*5,2),`${whole},${rest}`,`${whole}${rest},0`]);assert.match(formatQCMAnswer(q.possible_answers[3],q),/\{,\}0/);
  input=q.answers[0]+',00';assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,true);
 }
 assert.deepEqual(timesFiveQuestion(22).qcmOptions.map(o=>o.display),['11','1,1','10,1','101,0']);
});
test('série 4 : 1000 séries, intégration, rubrique et conservation de l’ordre QCM',()=>{
 setup();let seed=1234;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<1000;i++){const qs=generateQuestions(random);assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);qs.forEach(check);assert.notEqual(qs[0].sourceData.b*2,qs[0].sourceData.a+1);assert.notEqual(qs[1].sourceData.a%10,0);assert.ok(qs[3].sourceData.cents>=10101&&qs[3].sourceData.cents<=99999&&qs[3].sourceData.cents%10!==0);}
 assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_4'),series);
 const page=readFileSync(new URL('../automatismes_6.html',import.meta.url),'utf8'),section=page.match(/<section[^>]+aria-labelledby="remediation-evaluations-nationales-title"[\s\S]*?<\/section>/)[0];
 assert.doesNotMatch(page,/aria-labelledby="sixieme-domain-[12]"/);assert.match(section,/>Remédiation des évaluations nationales<\/h1>/);assert.doesNotMatch(section,/domain-number/);
 assert.deepEqual([...section.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]),[1,2,3,4,5,6].map(i=>'remediation_evaluations_nationales_6e_serie_'+i));
 const ids=[...page.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
 const node=()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){}}),container={...node(),appendChild(){}};
 globalThis.document={getElementById:()=>container,createElement:node};globalThis.window={};
 for(const q of generateQuestions(random)){displayQCMOptions(q);const order=[...q.qcmAnswersOrder];displayQCMOptions(q,true);assert.deepEqual(q.qcmAnswersOrder,order);const history=[];storeAnswerForCorrections({presentationMode:'slideshow',userAnswers:history,currentQuestion:q,answerMode:'qcm',correctAnswer:q.answers[0],correctQCMAnswer:q.qcmAnswer,displayAnswer:q.display_answer});assert.deepEqual(history[0].qcmAnswersOrder,order);for(const answer of order)assert.equal(formatQCMAnswer(answer,history[0]),formatQCMAnswer(answer,q));}
 globalThis.document={getElementById:()=>node(),querySelector:()=>({})};globalThis.requestAnimationFrame=fn=>fn();for(const selectedTime of [30,45])startExerciseSession({exercice:series,selectedTime,onCloseCorrectionOverlay(){},onQuestionsReady(qs){assert.deepEqual(qs.map(q=>q.time),Array(5).fill(selectedTime));}});
});
