import { createStripFigure } from './figures/fractionsFigures.js';
import { remediationMathPresentation as presentation } from './remediationMathPresentation.js';

const math=text=>`\\(${text}\\)`;
// Conserver les chaînes d’origine : aucun formatage numérique des zéros finaux.
const literal=text=>math(String(text).replaceAll(' ','~').replace(',','{,}'));
const valueOf=text=>Number(String(text).replaceAll(' ','').replace(',','.'));
const fraction=(n,d)=>math(`\\dfrac{${n}}{${d}}`);
export function scaledDecimal(integer,places) {
  const digits=String(integer).padStart(places+1,'0');
  const whole=places?digits.slice(0,-places):digits;
  const tail=places?digits.slice(-places).replace(/0+$/,''):'';
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(tail?','+tail:'');
}
const numericOption=display=>({id:String(display),display:String(display),value:valueOf(display),text:literal(display)});
const wrap=html=>`<div class="remediation-number remediation-series4" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
const figureStyles=`<style>.remediation-series4 .series4-figure{width:fit-content;max-width:100%;margin:18px auto;background:white;border-radius:4px}.remediation-series4 .series4-figure svg{display:block;max-width:100%;height:auto}</style>`;
function question(id,direct,qcm,answer,options,correction,data,image='',answerRule={type:'decimal',numberOnly:true}) {
  if(new Set(options.map(o=>o.value)).size!==4)throw new Error(`QCM ambigu : ${id}`);
  return {id,question:{direct:wrap(figureStyles+presentation(direct)+image),qcm:wrap(figureStyles+presentation(qcm)+image)},answers:[String(answer)],answerRule,
    possible_answers:options.map(o=>o.id),qcmAnswer:options[0].id,qcmAnswerRule:{type:'symbolicExact'},
    qcmRenderAnswer:answer=>options.find(o=>o.id===String(answer))?.text ?? presentation(answer),qcmOptions:options,sourceData:data,
    display_answer:wrap(`<span style="color:red">${presentation(correction)}</span>`)};
}
export function coloredFigureQuestion(a,b) {
  const parts=a+1,remaining=parts-b;
  const options=[[b,parts],[b,remaining],[remaining,remaining],[remaining,parts]].map(([n,d])=>({id:`${n}/${d}`,value:n/d,text:presentation(fraction(n,d)+' de la figure.')}));
  const config={parts,coloredParts:Array.from({length:b},(_,i)=>i),partWidth:22,rectangleHeight:160,fillColor:'rgba(255, 255, 0, 0.5)'};
  const image=`<div class="series4-figure">${createStripFigure(config)}</div>`;
  return question('q1','Quelle fraction de la figure est coloriée ?','On a colorié les…',`${b}/${parts}`,options,
    `On a colorié les ${fraction(b,parts)} de la figure.`,{a,b,figureConfig:config},image,{type:'fraction'});
}
export function complementQuestion(a,b) {
  const left=10*a-b,right=10*a;
  const text=`Quel nombre permet de compléter l’égalité pour qu’elle soit vraie ?<br>${math(`${left}+\\ldots=${right}`)}`;
  return question('q2',text,text,b,[b,b-1,b-2,b+1].map(n=>numericOption(String(n))),
    `${math(`${left}+${b}=${right}`)}.<br>Il faut ajouter ${literal(b)} pour atteindre ${literal(right)}.`,{a,b});
}
export function halfQuestion(a,family) {
  const half=a/2,input=`${a},1${'0'.repeat(family)}`,answer=`${half},05`;
  const source=[answer,`${half},2${'0'.repeat(family)}`,`${half},5${'0'.repeat(family)}`,`${half},5${'0'.repeat(family-1)}`];
  // Les deux derniers distracteurs Python valent toujours la même chose.
  // Remplacer uniquement le dernier par une confusion centièmes/millièmes.
  const displays=[...source];displays[3]=`${half},005${'0'.repeat(family-1)}`;
  const text=`La moitié de ${literal(input)} est…`;
  return question('q3',text,text,answer,displays.map(numericOption),
    `La moitié de ${literal(input)} est ${literal(answer)}.<br>${math(`${a}\\div2=${half}`)} et ${math(`0{,}1${'0'.repeat(family)}\\div2=0{,}05`)}.`,{a,family,input,originalDisplays:source});
}
export function powerQuestion(cents,power) {
  const input=scaledDecimal(cents,2),exponents=power===1?[power,power-2,power-3,power+1]:[power,power-1,power-3,power-4];
  const displays=exponents.map(exponent=>scaledDecimal(cents,2-exponent)),answer=displays[0];
  const text=`Calculer mentalement la multiplication suivante :<br>${math(`${input.replaceAll(' ','~').replace(',','{,}')}\\times${10**power}=\\ldots`)}`;
  return question('q4',text,text,answer,displays.map(numericOption),
    `${math(`${input.replaceAll(' ','~').replace(',','{,}')}\\times${10**power}=${answer.replaceAll(' ','~').replace(',','{,}')}`)}.<br>Multiplier par ${literal(10**power)} déplace la virgule de ${literal(power)} ${power===1?'rang':'rangs'} vers la droite.`,{cents,power,input});
}
export const timesFiveParameters=Array.from({length:78},(_,i)=>i+21).filter(n=>n%2===0&&n%10!==0);
export function timesFiveQuestion(tenths) {
  const input=scaledDecimal(tenths,1),wholePart=Math.floor(tenths/10)*5,decimalPart=(tenths%10)/2;
  const displays=[String(tenths/2),scaledDecimal(tenths*5,2),`${wholePart},${decimalPart}`,`${wholePart}${decimalPart},0`];
  const text=`Voici un calcul :<br>${math(`${input.replace(',','{,}')}\\times5=`)}<br>Quel est le résultat de ce calcul ?`;
  return question('q5',text,text,displays[0],displays.map(numericOption),
    `Le résultat de ce calcul est ${literal(displays[0])}.<br>${math(`${input.replace(',','{,}')}\\times5=${displays[0]}`)}.`,{tenths,input});
}
export function generateQuestions(random=Math.random) {
  const integer=(a,b)=>a+Math.floor(random()*(b-a+1)),pick=values=>values[integer(0,values.length-1)];
  const a=integer(5,11),colors=Array.from({length:a-2},(_,i)=>i+2).filter(b=>2*b!==a+1);
  const q1=coloredFigureQuestion(a,pick(colors));
  const q2=complementQuestion(pick(Array.from({length:89},(_,i)=>i+11).filter(n=>n%10!==0)),integer(4,8));
  const q3=halfQuestion(2*integer(1,10),integer(1,3));
  const q4=powerQuestion(integer(101,999)*100+integer(0,9)*10+integer(1,9),integer(1,2));
  return [q1,q2,q3,q4,timesFiveQuestion(pick(timesFiveParameters))];
}
export default {title:'Remédiation — Évaluations nationales — Série 4 : Compréhension du nombre',shuffle:false,generateQuestions,questions:generateQuestions()};
