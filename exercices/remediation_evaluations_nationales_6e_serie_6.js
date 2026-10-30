import {createCuboidSVG} from './figures/cuboidFigure.js';
import {createCartesianPlaneSVG} from './figures/cartesianPlaneFigure.js';
import {createAngleCoding} from './figures/angleCoding.js';
import {clockSVG} from './reperage_temps_durees.js';
import {validateClockTime} from './timeClockInteraction.js';
import {remediationMathPresentation as presentation} from './remediationMathPresentation.js';
import {formatAnswer} from '../core/answerFormatting.js';

const math=s=>`\\(${s}\\)`;
const number=n=>formatAnswer(n,'math');
const time=(h,m)=>math(`${h}~\\mathrm{h}~${String(m).padStart(2,'0')}`);
const angle=name=>math(`\\widehat{\\mathrm{${name}}}`);
const wrap=html=>`<div class="remediation-number remediation-series6" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
const red=text=>wrap(`<span style="color:red">${presentation(text)}</span>`);
const numericOptions=values=>values.map(value=>({id:String(value),value,text:math(`${number(value)}~\\mathrm{cm}^3`)}));
function question(id,text,options,correction,sourceData,image='',answerRule={type:'decimal',numberOnly:true}) {
  // Q5 directe possède une plage plus large ; ses propositions ne sont jamais
  // affichées : generateQuestions lui associe le QCM restreint du PythonTeX.
  if(options.length!==4||(id!=='q5'&&new Set(options.map(o=>o.value)).size!==4))throw new Error(`QCM ambigu : ${id}`);
  const html=wrap(presentation(text)+image);
  return {id,question:{direct:html,qcm:html},answers:[options[0].id],answerRule,
    possible_answers:options.map(o=>o.id),qcmAnswer:options[0].id,qcmAnswerRule:{type:'symbolicExact'},qcmOptions:options,
    qcmRenderAnswer:answer=>options.find(o=>o.id===String(answer))?.text??presentation(answer),sourceData,display_answer:red(correction)};
}
const volumeText=`Le pavé droit ci-dessous est composé de petits cubes de ${math('1~\\mathrm{cm}^3')}.<br>Quel est le volume de ce pavé droit ?`;
const cuboidFigure=dimensions=>`<div style="width:fit-content;max-width:100%;background:white;margin:16px auto">${createCuboidSVG(dimensions)}</div>`;
export function flatVolumeQuestion(a,b) {
  const columns=a+1,rows=b+1,volume=columns*rows;
  return question('q1',volumeText,numericOptions([volume,rows,a+b+2,(a+2)*rows]),
    `Une couche contient ${math(`${columns}\\times${rows}=${volume}`)} petits cubes.<br>Le volume de ce pavé droit est ${math(`${columns}\\times${rows}\\times1=${volume}~\\mathrm{cm}^3`)}.`,
    {a,b},cuboidFigure({columns,rows,layers:1}));
}

// Sommets C, A, F, D des dix dessins D2 ; B=(5,1), E=(12,1).
export const angleConfigurations=[
  [[2,1],[1,3],[8,1],[10,2]], [[1,1],[3,2],[9,1],[8,3]],
  [[1,1],[4,3],[9,1],[8,3]], [[2,1],[1,3],[8,1],[11,3]],
  [[3,2],[5,3],[8,3],[12,2]], [[1,3],[5,2],[10,2],[12,3]],
  [[1,2],[5,2],[9,2],[12,3]], [[2,2],[5,3],[8,2],[12,2]],
  [[1,3],[4,2],[10,2],[10,3]], [[3,2],[3,3],[8,3],[11,2]]
];
export function angleFigure(index) {
  const [C,A,F,D]=angleConfigurations[index],B=[5,1],E=[12,1];
  const points={A,B,C,D,E,F},toSvg=([x,y])=>({x:3+(x+.1)*30,y:3+(4.1-y)*30});
  const figure=createCartesianPlaneSVG({width:432,height:132,padding:{left:3,right:3,top:3,bottom:3},
    range:{xMin:-.1,xMax:14.1,yMin:-.1,yMax:4.1},axes:{x:{show:false},y:{show:false}},
    grid:{main:{show:true,xStep:1,yStep:1,strokeWidth:.8,opacity:1}},
    polylines:[[C,B,A],[F,E,D]].map(points=>({points,strokeWidth:1.4})),
    points:[C,A,F,D].map(([x,y])=>({x,y,marker:'cross',markerSize:5,markerStrokeWidth:1})),
    texts:Object.entries(points).map(([text,[x,y]])=>({x:x+(['B','E'].includes(text)&&index>=4&&index<=7?.3:.16),y:y+.42,text,fontSize:16}))});
  const arcs=[[A,B,C],[D,E,F]].map(([p,v,q])=>createAngleCoding({vertex:toSvg(v),point1:toSvg(p),point2:toSvg(q),radius:24})).join('');
  return `<div class="series6-angles" style="color:black;background:white;max-width:700px;margin:16px auto"><style>.series6-angles .cartesian-plane > g:nth-child(2){color:gray}</style>${figure.replace('</svg>',arcs+'</svg>')}</div>`;
}
const angleStatements=[
  `Les angles ${angle('ABC')} et ${angle('DEF')} sont égaux.`,
  `L’angle ${angle('ABC')} est plus grand que l’angle ${angle('DEF')}.`,
  `L’angle ${angle('ABC')} est plus petit que l’angle ${angle('DEF')}.`,
  'On ne peut pas savoir.'
];
export const angleSelectionOptions=[
  ['<',math('\\widehat{\\mathrm{ABC}}<\\widehat{\\mathrm{DEF}}')],
  ['>',math('\\widehat{\\mathrm{ABC}}>\\widehat{\\mathrm{DEF}}')],
  ['=',math('\\widehat{\\mathrm{ABC}}=\\widehat{\\mathrm{DEF}}')],
  ['?',presentation('Impossible de comparer les deux angles')]
];
export function initializeAngleSelect({document}) {
  // Même contrat initializeResponse que le menu natif de la série 2 :
  // le champ technique transmet la valeur au lecteur et à son validateur.
  // <details> autorise le HTML MathJax, contrairement aux <option> natifs.
  const input=document.getElementById('user-answer'),previousDisplay=input.style.display;
  input.style.display='none';input.value='';
  const menu=document.createElement('details');menu.id='remediation-angle-select';
  menu.style.cssText='display:block;max-width:100%;margin:16px auto;color:black;background:white;border:1px solid #777;border-radius:4px;text-align:center';
  const summary=document.createElement('summary');summary.style.cssText='padding:12px;cursor:pointer';
  summary.innerHTML=presentation('Choisir une proposition…');menu.appendChild(summary);
  const buttons=angleSelectionOptions.map(([value,html])=>{
    const button=document.createElement('button');button.type='button';button.dataset.value=value;
    button.style.cssText='display:block;width:100%;padding:12px;border:0;border-top:1px solid #ccc;background:white;color:black;font:inherit;cursor:pointer;white-space:normal';
    button.innerHTML=html;menu.appendChild(button);return button;
  });
  const choose=event=>{
    const button=event.target.closest('button[data-value]');if(!button||!menu.contains(button))return;
    input.value=button.dataset.value;
    // Réutiliser le rendu déjà composé, sans afficher un instant du LaTeX brut.
    summary.innerHTML=button.innerHTML;menu.open=false;summary.focus();
  };
  const keydown=event=>{
    event.stopPropagation();
    if(event.key==='Escape'){menu.open=false;summary.focus();}
  };
  menu.addEventListener('click',choose);menu.addEventListener('keydown',keydown);
  document.getElementById('question').querySelector('.remediation-number').appendChild(menu);
  return ()=>{menu.removeEventListener('click',choose);menu.removeEventListener('keydown',keydown);menu.remove();input.style.display=previousDisplay;};
}
export function angleQuestion(index) {
  const result=[0,0,1,2,0,0,1,2,0,0][index],ids=['=','>','<','?'];
  const order=[result,...[0,1,2,3].filter(i=>i!==result)];
  const options=order.map(i=>({id:ids[i],value:ids[i],text:presentation(angleStatements[i])}));
  const correction=angleStatements[result]+`<br>La mesure dépend de l’ouverture des deux côtés, et non de leur longueur ou de leur orientation.`;
  const q=question('q2',`Comparer les deux angles ${angle('ABC')} et ${angle('DEF')}.`,options,correction,{index,result},angleFigure(index),{type:'symbolicExact'});
  q.answers.push(['égaux','plus grand','plus petit'][result],['Les angles ABC et DEF sont égaux.','L’angle ABC est plus grand que l’angle DEF.','L’angle ABC est plus petit que l’angle DEF.'][result]);
  q.qcmClass='qcm-two-columns';
  q.initializeResponse=initializeAngleSelect;
  q.question.direct=wrap(presentation('Comparer les deux angles représentés en choisissant la bonne proposition.')+angleFigure(index));
  return q;
}
const unitNames={g:'grammes',kg:'kilogrammes',m:'mètres',km:'kilomètres',cm:'centimètres',mm:'millimètres',L:'litres',cL:'centilitres',mL:'millilitres'};
// Les 20 situations originales comprennent masses, longueurs et capacités.
export const unitSituations=[
  ['Une balle de tennis de table pèse',2.7,['g','kg','mm','cL']],
  ['Un ballon de football pèse',450,['g','kg','mm','cL']],
  ['Une voiture pèse en moyenne',1240,['kg','g','m','L']],
  ['Une goutte d’eau pèse en moyenne',.05,['g','kg','mm','cL']],
  ['Un ananas pèse en moyenne',2,['kg','g','m','L']],
  ['Une trotinette électrique pèse en moyenne',12,['kg','g','m','L']],
  ['Une pomme pèse en moyenne',100,['g','kg','mm','cL']],
  ['Le tour d’une piste d’athlétisme mesure',400,['m','km','kg','L']],
  ['La hauteur de la tour Eiffel est de',312,['m','km','kg','L']],
  ['La longueur d’une allumette est de',5,['cm','m','g','cL']],
  ['Le diamètre moyen d’un câble de fibre optique est de',6,['mm','m','g','cL']],
  ['La distance parcourue lors d’un marathon est de',42.195,['km','m','kg','L']],
  ['La hauteur du mont Blanc est de',4806,['m','km','kg','L']],
  ['Le rayon de la Terre est de',6378,['km','m','kg','L']],
  ['Un verre à eau contient',24,['cL','L','g','cm']],
  ['La quantité d’eau contenue dans le corps d’un adulte est environ de',45,['L','mL','kg','m']],
  ['La quantité d’eau contenue dans une baignore classique est environ de',150,['L','cL','kg','m']],
  ['La quantité de liquide que peut contenir une petite seringue est environ de',2,['mL','L','g','mm']],
  ['La quantité de carburant que peut contenir le réservoir d’une voiture est environ de',50,['L','cL','kg','m']],
  ['La quantité d’eau pour fabriquer un glaçon est de',10,['mL','L','g','mm']]
];
const unitReasons=[
  'Une balle aussi légère a une masse de quelques grammes.', 'Un ballon pèse moins d’un kilogramme.',
  'Une voiture a une masse de l’ordre d’une tonne.', 'Une goutte a une masse bien inférieure à un gramme.',
  'Un gros fruit peut peser quelques kilogrammes.', 'Un véhicule transportable pèse plusieurs kilogrammes.',
  'Un fruit a une masse de l’ordre d’un dixième de kilogramme.', 'Un tour de piste représente quelques centaines de mètres.',
  'Un monument de cette hauteur mesure quelques centaines de mètres.', 'Une allumette est longue de quelques centimètres.',
  'Le diamètre d’un câble fin se mesure en millimètres.', 'Un marathon représente plusieurs dizaines de kilomètres.',
  'Un sommet de haute montagne atteint plusieurs milliers de mètres.', 'Le rayon d’une planète est de plusieurs milliers de kilomètres.',
  'Un verre contient une fraction de litre.', 'L’eau contenue dans le corps représente plusieurs dizaines de litres.',
  'Une baignoire peut contenir plus d’une centaine de litres.', 'Une petite seringue ne contient qu’une petite fraction de litre.',
  'Un réservoir de voiture contient plusieurs dizaines de litres.', 'Un glaçon ne nécessite qu’une petite fraction de litre.'
];
export function suitableUnitQuestion(index) {
  const [text,value,units]=unitSituations[index],unit=units[0];
  const options=units.map(id=>({id,value:id,text:presentation(`${unitNames[id]} (${math(`\\mathrm{${id}}`)})`)}));
  const q=question('q3',`${text} ${math(number(value)+'\\ldots')}`,options,
    `${text} ${math(`${number(value)}~\\mathrm{${unit}}`)}.<br>${unitReasons[index]}`,{index,value,unit},'',{type:'symbolicExact'});
  const name=unitNames[unit];q.answers.push(name,name.slice(0,-1),name.replaceAll('è','e'),name.replaceAll('è','e').slice(0,-1));
  return q;
}
export function trainQuestion(wait,hour,minute) {
  const total=minute+wait,endHour=hour+1,endMinute=total-60;
  // Le distracteur Python « hour h total » est équivalent au résultat après
  // retenue. Lui seul est remplacé par une erreur sur l'heure de départ.
  const choices=[[endHour,endMinute],[hour-1,endMinute],[hour,minute],[endHour,0]];
  const options=choices.map(([h,m])=>({id:`${h}h${String(m).padStart(2,'0')}`,value:60*h+m,text:time(h,m)}));
  const q=question('q4',`Ce matin, Camille est à la gare et son train part dans ${math(number(wait))} minutes. Elle regarde l’heure sur l’horloge du quai.<br>À quelle heure va partir le train ?`,options,
    `L’horloge indique ${time(hour,minute)}.<br>${math(`${minute}+${wait}=${total}~\\mathrm{min}=1~\\mathrm{h}~${endMinute}~\\mathrm{min}`)}.<br>Le train va partir à ${time(endHour,endMinute)}.`,
    {wait,hour,minute,endHour,endMinute},clockSVG(hour,minute,{secondsHand:true}),
    {type:'custom',validate:({userInput})=>validateClockTime(String(userInput).replace(':','h'),endHour,endMinute,false)});
  return q;
}
export function volumeQuestion(a,b,c) {
  const n=a+1,m=b+1,h=c+1,volume=n*m*h;
  return question('q5',volumeText,numericOptions([volume,n*h,n*m+h*m,n*h+m*h]),
    `Une couche contient ${math(`${n}\\times${m}=${n*m}`)} petits cubes.<br>Il y a ${math(h)} couches.<br>Le volume de ce pavé droit est ${math(`${n}\\times${m}\\times${h}=${volume}~\\mathrm{cm}^3`)}.`,
    {a,b,c},cuboidFigure({columns:n,rows:m,layers:h}));
}
export function generateQuestions(random=Math.random) {
  const integer=(a,b)=>a+Math.floor(random()*(b-a+1));
  const qs=[flatVolumeQuestion(integer(3,6),integer(1,6)),angleQuestion(integer(0,9)),suitableUnitQuestion(integer(0,19)),trainQuestion(integer(39,59),integer(4,10),integer(31,59))];
  const direct=volumeQuestion(integer(3,5),integer(1,3),integer(1,3)),b=integer(1,2),qcm=volumeQuestion(integer(3,4),b,3-b);
  // Le lecteur sait déjà distinguer textes et corrections par mode ; seule la
  // validation directe utilise answers, le QCM utilise qcmAnswer et ses options.
  qs.push({...direct,question:{direct:direct.question.direct,qcm:qcm.question.qcm},
    possible_answers:qcm.possible_answers,qcmAnswer:qcm.qcmAnswer,qcmAnswerRule:qcm.qcmAnswerRule,qcmRenderAnswer:qcm.qcmRenderAnswer,qcmOptions:qcm.qcmOptions,
    display_answer:{direct:direct.display_answer,qcm:qcm.display_answer},sourceData:{direct:direct.sourceData,qcm:qcm.sourceData}});
  return qs;
}
export default {title:'Remédiation — Évaluations nationales — Série 6 : Grandeurs et géométrie',shuffle:false,generateQuestions,questions:generateQuestions()};
