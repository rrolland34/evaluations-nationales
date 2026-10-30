import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import series,{flatVolumeQuestion,angleQuestion,angleConfigurations,angleSelectionOptions,initializeAngleSelect,suitableUnitQuestion,unitSituations,trainQuestion,volumeQuestion,generateQuestions} from '../exercices/remediation_evaluations_nationales_6e_serie_6.js';
import {clockSVG} from '../exercices/reperage_temps_durees.js';
import {evaluateCurrentAnswer} from '../core/answerEvaluation.js';
import {getDisplayAnswer} from '../core/answerDisplay.js';
import {formatQCMAnswer,displayQCMOptions} from '../core/qcm.js';
import {storeAnswerForCorrections} from '../core/answerHistory.js';
import {loadExercise} from '../core/exerciseLoader.js';

let input='';const setup=()=>{globalThis.document={getElementById:()=>({value:input})};};
const correct=q=>evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect;
function check(q,{qcm=true}={}){
  input=q.answers[0];assert.equal(correct(q),true,q.id+' '+input);
  for(const wrong of ['',q.id==='q2'?'?':q.id==='q3'?'123':'9999']){input=wrong;assert.equal(correct(q),false,q.id+' '+wrong);}
  for(const raw of [...q.answers,...q.possible_answers])assert.doesNotMatch(raw,/\\|NaN|undefined/);
  if(qcm){assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);assert.equal(q.possible_answers.length,4);assert.deepEqual(q.possible_answers.filter(selectedQCMAnswer=>evaluateCurrentAnswer({question:q,answerMode:'qcm',selectedQCMAnswer}).isCorrect),[q.qcmAnswer]);}
  for(const value of q.possible_answers)assert.match(formatQCMAnswer(value,q),/\\\(/);
  for(const html of [q.question.direct,q.question.qcm,getDisplayAnswer(q,'direct'),getDisplayAnswer(q,'qcm')]){
    assert.equal(html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/\\\([\s\S]*?\\\)/g,'').replace(/<[^>]*>/g,'').trim(),'');
    assert.doesNotMatch(html,/NaN|undefined|tikz|boxed|textcolor/);
  }
}
test('série 6 : 24 volumes Q1, cubes fidèles et aucune collision',()=>{
  setup();let count=0;for(let a=3;a<=6;a++)for(let b=1;b<=6;b++){
    const q=flatVolumeQuestion(a,b);check(q);count++;
    assert.equal(Number(q.answers[0]),(a+1)*(b+1));assert.match(q.question.direct,new RegExp(`data-cube-count="${(a+1)*(b+1)}"`));
    assert.deepEqual(q.qcmOptions.map(o=>o.value),[(a+1)*(b+1),b+1,a+b+2,(a+2)*(b+1)]);assert.match(q.display_answer,/\\mathrm\{cm\}\^3/);
  }assert.equal(count,24);
});
test('série 6 : dix comparaisons, sommets et mesures réelles indépendantes des longueurs',()=>{
  setup();const expected=['=','=','>','<','=','=','>','<','=','='];
  const degrees=(p,v,q)=>Math.acos(((p[0]-v[0])*(q[0]-v[0])+(p[1]-v[1])*(q[1]-v[1]))/(Math.hypot(p[0]-v[0],p[1]-v[1])*Math.hypot(q[0]-v[0],q[1]-v[1])));
  for(let i=0;i<10;i++){
    const q=angleQuestion(i);check(q);assert.equal(q.answers[0],expected[i]);const [C,A,F,D]=angleConfigurations[i];
    const delta=degrees(A,[5,1],C)-degrees(D,[12,1],F);assert.equal(Math.abs(delta)<1e-12?'=':delta>0?'>':'<',expected[i]);
    assert.equal(q.qcmClass,'qcm-two-columns');assert.equal(q.initializeResponse,initializeAngleSelect);
    assert.match(q.question.qcm,/widehat\{\\mathrm\{ABC\}\}/);assert.match(q.question.qcm,/widehat\{\\mathrm\{DEF\}\}/);
    assert.deepEqual(angleSelectionOptions.map(([value])=>value),['<','>','=','?']);
    for(const [,html] of angleSelectionOptions.slice(0,3)){assert.match(html,/widehat\{\\mathrm\{ABC\}\}/);assert.match(html,/widehat\{\\mathrm\{DEF\}\}/);}
    for(const label of ['A','B','C','D','E','F'])assert.ok(q.question.direct.includes(label));
    assert.equal((q.question.direct.match(/<polyline/g)||[]).length,2);assert.equal((q.question.direct.match(/<path/g)||[]).length,2);
    assert.deepEqual(new Set(q.possible_answers),new Set(['=','>','<','?']));
    input=q.answers[1];assert.equal(correct(q),true);
  }
});
test('série 6 : les 20 situations originales, unités obligatoires et graphies équivalentes',()=>{
  setup();assert.equal(unitSituations.length,20);
  const expected=['g','g','kg','g','kg','kg','g','m','m','cm','mm','km','m','km','cL','L','L','mL','L','mL'];
  const values=[2.7,450,1240,.05,2,12,100,400,312,5,6,42.195,4806,6378,24,45,150,2,50,10];
  for(let i=0;i<20;i++){
    const q=suitableUnitQuestion(i);check(q);assert.equal(q.answers[0],expected[i]);assert.equal(q.sourceData.value,values[i]);
    for(const answer of q.answers){input=answer;assert.equal(correct(q),true);}
    input=String(values[i]);assert.equal(correct(q),false);input=' '+expected[i].toUpperCase()+' ';assert.equal(correct(q),true);
    assert.ok(q.display_answer.includes('\\mathrm{'+expected[i]+'}'));
  }
});
test('Q2 : menu MathJax, quatre sélections raccordées au lecteur et nettoyage pour les dix figures',()=>{
  for(let index=0;index<10;index++){
    const input={style:{display:'inline-block'},value:'ancienne réponse'},container={children:[],appendChild(e){this.children.push(e);}};
    const node=tag=>({tag,style:{},dataset:{},children:[],listeners:{},innerHTML:'',
      appendChild(e){this.children.push(e);},contains(e){return this.children.includes(e);},focus(){this.focused=true;},
      addEventListener(type,fn){this.listeners[type]=fn;},removeEventListener(type){delete this.listeners[type];},remove(){this.removed=true;}});
    const document={createElement:node,getElementById:id=>id==='user-answer'?input:{querySelector:()=>container}};
    globalThis.document=document;const q=angleQuestion(index),dispose=q.initializeResponse({document}),menu=container.children[0];
    assert.equal(menu.tag,'details');assert.equal(input.value,'');assert.equal(input.style.display,'none');
    const [summary,...buttons]=menu.children;assert.equal(buttons.length,4);
    assert.deepEqual(buttons.map(b=>b.dataset.value),['<','>','=','?']);
    for(const button of buttons){
      assert.match(button.innerHTML,/\\\(/);menu.open=true;
      menu.listeners.click({target:{closest:()=>button}});
      assert.equal(input.value,button.dataset.value);assert.equal(summary.innerHTML,button.innerHTML);assert.equal(menu.open,false);
      assert.equal(evaluateCurrentAnswer({question:q,answerMode:'direct'}).isCorrect,button.dataset.value===q.qcmAnswer);
    }
    let stopped=false;menu.open=true;menu.listeners.keydown({key:'Escape',stopPropagation(){stopped=true;}});
    assert.equal(stopped,true);assert.equal(menu.open,false);dispose();
    assert.equal(input.style.display,'inline-block');assert.equal(menu.removed,true);assert.deepEqual(menu.listeners,{});
  }
});
test('série 6 : les 4263 horaires, retenue systématique et distracteur équivalent remplacé',()=>{
  setup();let count=0;
  for(let wait=39;wait<=59;wait++)for(let h=4;h<=10;h++)for(let minute=31;minute<=59;minute++){
    const q=trainQuestion(wait,h,minute),expected=60*h+minute+wait;count++;
    assert.equal(q.qcmOptions[0].value,expected);assert.equal(new Set(q.qcmOptions.map(o=>o.value)).size,4);
    assert.equal(q.sourceData.endHour,Math.floor(expected/60));assert.equal(q.sourceData.endMinute,expected%60);
    assert.deepEqual(q.qcmOptions.slice(2).map(o=>o.id),[`${h}h${minute}`,`${h+1}h00`]);
    if(count%37===0||wait===59&&h===10&&minute===59){
      check(q);for(const answer of [`${h+1}h${expected%60}`,`${h+1}:${String(expected%60).padStart(2,'0')}`,`${h+1} H ${expected%60} MIN`]){input=answer;assert.equal(correct(q),true);}
      for(const answer of [`${h+1}h60`,`${h}h${minute+wait}`,`${h+13}h${expected%60}`]){input=answer;assert.equal(correct(q),false);}
    }
  }assert.equal(count,4263);
});
test('série 6 : horloge réutilisée, seconde rouge fixe et option désactivée par défaut',()=>{
  const normal=clockSVG(7,58),decorated=clockSVG(7,58,{secondsHand:true});
  assert.equal(clockSVG(7,58,{secondsHand:false}),normal);assert.doesNotMatch(normal,/data-hand="seconds"/);
  const seconds=decorated.match(/<line data-hand="seconds"[^>]+\/>/)[0];assert.match(seconds,/data-angle="0"/);assert.match(seconds,/stroke="red"/);
  assert.equal(decorated.replace(seconds,''),normal);assert.doesNotMatch(decorated,/animate|setInterval|setTimeout/);
});
test('série 6 : 27 volumes directs, quatre QCM distincts, figures et corrections propres au mode',()=>{
  setup();let direct=0,qcm=0;
  for(let a=3;a<=5;a++)for(let b=1;b<=3;b++)for(let c=1;c<=3;c++){
    const q=volumeQuestion(a,b,c);check(q,{qcm:false});assert.equal(Number(q.answers[0]),(a+1)*(b+1)*(c+1));direct++;
    if(a<=4&&b<=2&&c<=2&&b!==c){check(q);qcm++;}
  }assert.equal(direct,27);assert.equal(qcm,4);
  let seed=612;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  const seenDirect=new Set(),seenQCM=new Set();
  for(let i=0;i<1000;i++){
    const qs=generateQuestions(random),q=qs[4],d=q.sourceData.direct,c=q.sourceData.qcm;
    assert.deepEqual(qs.map(q=>q.id),['q1','q2','q3','q4','q5']);if(i%37===0)qs.forEach(q=>check(q));
    assert.ok(d.a>=3&&d.a<=5&&d.b>=1&&d.b<=3&&d.c>=1&&d.c<=3);assert.ok(c.a>=3&&c.a<=4&&c.b>=1&&c.b<=2&&c.c>=1&&c.c<=2&&c.b!==c.c);
    seenDirect.add([d.a,d.b,d.c].join(','));seenQCM.add([c.a,c.b,c.c].join(','));
    assert.equal(Number(q.answers[0]),(d.a+1)*(d.b+1)*(d.c+1));assert.equal(Number(q.qcmAnswer),(c.a+1)*(c.b+1)*(c.c+1));
    assert.match(q.question.direct,new RegExp(`data-cube-count="${q.answers[0]}"`));assert.match(q.question.qcm,new RegExp(`data-cube-count="${q.qcmAnswer}"`));
    assert.match(getDisplayAnswer(q,'direct'),new RegExp(`=${q.answers[0]}~`));assert.match(getDisplayAnswer(q,'qcm'),new RegExp(`=${q.qcmAnswer}~`));
  }assert.equal(seenDirect.size,27);assert.equal(seenQCM.size,4);
});
test('série 6 : catalogue, six boutons et historique QCM du moteur',()=>{
  assert.equal(loadExercise('remediation_evaluations_nationales_6e_serie_6'),series);
  const page=readFileSync(new URL('../automatismes_6.html',import.meta.url),'utf8'),section=page.match(/<section[^>]+aria-labelledby="remediation-evaluations-nationales-title"[\s\S]*?<\/section>/)[0];
  assert.deepEqual([...section.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]),[1,2,3,4,5,6].map(n=>'remediation_evaluations_nationales_6e_serie_'+n));
  const ids=[...page.matchAll(/data-exercise="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
  const node=()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){}}),container={...node(),appendChild(){}};
  globalThis.document={getElementById:()=>container,createElement:node};globalThis.window={};
  for(const q of generateQuestions()){
    displayQCMOptions(q);const order=[...q.qcmAnswersOrder];displayQCMOptions(q,true);assert.deepEqual(q.qcmAnswersOrder,order);
    const history=[];storeAnswerForCorrections({presentationMode:'slideshow',userAnswers:history,currentQuestion:q,answerMode:'qcm',correctAnswer:q.answers[0],correctQCMAnswer:q.qcmAnswer,displayAnswer:getDisplayAnswer(q,'qcm')});
    assert.deepEqual(history[0].qcmAnswersOrder,order);for(const answer of order)assert.equal(formatQCMAnswer(answer,history[0]),formatQCMAnswer(answer,q));
    assert.equal(history[0].displayAnswer,getDisplayAnswer(q,'qcm'));
  }
});


test('série 6 : figures conservées dans les énoncés uniquement',()=>{
 for(const q of generateQuestions()) for(const mode of ['direct','qcm']){
  const correction=typeof q.display_answer==='string'?q.display_answer:q.display_answer[mode];
  assert.doesNotMatch(correction,/<svg/);
  assert.match(correction,/color:red/);
  if(['q1','q2','q4','q5'].includes(q.id)) assert.match(q.question[mode],/<svg/);
 }
});
