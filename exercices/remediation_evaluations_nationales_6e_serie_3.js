import { createNumberLineFigure } from './figures/numberLineFigure.js';
import { remediationMathPresentation as presentation } from './remediationMathPresentation.js';
import { formatAnswer } from '../core/answerFormatting.js';
import { parseAnswer } from '../core/answerParser.js';

const math=text=>`\\(${text}\\)`;
const number=value=>formatAnswer(value,'math');
const numeric=value=>math(number(value));
const fraction=(n,d)=>math(`\\dfrac{${n}}{${d}}`);
const wrap=html=>`<div class="remediation-number remediation-series3" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
const figureStyle=`<style>.remediation-series3 .series3-figure svg{display:block;width:100%;height:auto}.remediation-series3 .series3-figure{margin:18px auto;background:white;color:black;border-radius:6px;max-width:760px;width:100%}@media(max-width:600px){.question-container:has(.remediation-series3){padding:24px 12px}}</style>`;
const figure=config=>`<div class="series3-figure">${createNumberLineFigure(config)}</div>`;
function question(id,direct,qcm,answer,options,correction,data,config=null,answerRule={type:'decimal',numberOnly:true}) {
  if(new Set(options.map(o=>o.value)).size!==4)throw new Error(`QCM ambigu : ${id}`);
  options=options.map(option=>({...option,id:option.id ?? String(option.value)}));
  const image=config?figure(config):'';
  return {id,question:{direct:wrap(figureStyle+presentation(direct)+image),qcm:wrap(figureStyle+presentation(qcm)+image)},
    answers:[String(answer)],answerRule,possible_answers:options.map(o=>o.id),qcmAnswer:options[0].id,
    qcmAnswerRule:{type:'symbolicExact'},qcmRenderAnswer:answer=>options.find(o=>o.id===String(answer))?.text ?? presentation(answer),qcmOptions:options,sourceData:data,figureConfig:config,
    display_answer:wrap(`<span style="color:red">${presentation(correction)}</span>`)};
}
const numericOptions=values=>values.map(value=>({value,text:numeric(value)}));
export function largeNumberQuestion(base,step) {
  const answer=base+step*100000;
  const config={viewportPaddingX:20,viewportPaddingTop:32,range:{min:base-40000,max:base+1040000},tickDirection:'up',support:{strokeWidth:3},
    divisions:{origin:base,mainStep:100000,subdivisions:2,subSubdivisions:5,main:{height:22,strokeWidth:2},sub:{height:15,strokeWidth:1.6},subSub:{height:8,strokeWidth:1}},
    arrows:[{value:base,direction:'up',length:35,label:formatAnswer(base),labelFontSize:28,labelGap:15,labelBox:true,labelColor:'black'},
      {value:base+1000000,direction:'up',length:35,label:formatAnswer(base+1000000),labelFontSize:28,labelGap:15,labelBox:true,labelColor:'black'},
      {value:answer,direction:'down',length:74,tipGap:30,label:'\u00a0'.repeat(9),labelFontSize:28,labelGap:20,labelBox:true,labelColor:'black'}]};
  const text='Quel grand nombre faut-il placer dans le cadre vide sur cette droite graduée ?';
  return question('q1',text,text,answer,numericOptions([answer,base+step*10000,base+step*100,base+step]),`Il faut placer le nombre ${numeric(answer)}.`,{base,step},config);
}
export const decimalPositions=[7.5,8,8.5,9,10,10.5,11,11.5,12.5,13,13.5,14];
export function decimalLineQuestion(position) {
  const tenths=(position-2)*2,answer=tenths/10;
  const values=[answer,position>12?(100+position*2-14)/100:tenths/100,tenths,(position>12?18:9)+answer];
  const config={range:{min:0,max:2.58},support:{strokeWidth:3},divisions:{mainStep:.5,subdivisions:5,main:{height:26,strokeWidth:2.5},sub:{height:26,strokeWidth:1}},
    labels:[{value:0,fontSize:32},{value:1,fontSize:32}],points:[{value:answer,name:'B',nameFontSize:32,markerSize:14,markerStrokeWidth:2}]};
  const text=`Observer cette demi-droite graduée.<br>Quelle est l’abscisse du point ${math('\\mathrm{B}')} ?`;
  return question('q2',text,text,answer,numericOptions(values),`L’abscisse du point ${math('\\mathrm{B}')} est ${numeric(answer)}.`,{position},config);
}
export function fractionLineQuestion(numerator) {
  const config={range:{min:0,max:1.29},support:{strokeWidth:3},divisions:{mainStep:.1,subdivisions:1,main:{height:26,strokeWidth:1.5}},
    labels:[{value:0,fontSize:32},{value:1,fontSize:32}],points:[{value:numerator/10,name:'A',nameFontSize:32,markerSize:14,markerStrokeWidth:2}]};
  const options=[[numerator,10],[1,numerator],[numerator,1],[10,numerator]].map(([n,d])=>({id:`${n}/${d}`,value:n/d,text:fraction(n,d)}));
  const text=`Quelle fraction correspond au point ${math('\\mathrm{A}')} ?`;
  return question('q3',text,text,`${numerator}/10`,options,`La fraction qui correspond au point ${math('\\mathrm{A}')} est ${fraction(numerator,10)}.`,{numerator},config,{type:'fraction'});
}
export function intervalQuestion(exponent,inside,below,above) {
  const lower=10**exponent,upper=10**(exponent+1),last=upper+lower;
  // Le seul doublon possible du modèle Python est entre les deux nombres trop grands.
  // Corriger ce distracteur dans la même plage, sans supprimer de tirage.
  const resolvedAbove=above===last?above+1:above;
  const enclosure=math(`${number(lower)}<\\ldots<${number(upper)}`);
  const rule={type:'custom',validate:({userInput})=>{const parsed=parseAnswer(userInput);return {valid:parsed.valid && parsed.unit==='' && parsed.value>lower && parsed.value<upper};}};
  return question('q4',`Écrire un nombre encadré par ${numeric(lower)} et ${numeric(upper)} :<br>${enclosure}`,
    `Choisir le nombre encadré par ${numeric(lower)} et ${numeric(upper)} :<br>${enclosure}`,inside,numericOptions([inside,below,resolvedAbove,last]),
    `Un tel nombre est ${numeric(inside)}.<br>${math(`${number(lower)}<${number(inside)}<${number(upper)}`)}`,{exponent,inside,below,above,resolvedAbove},null,rule);
}
export function smallestQuestion(a,b,offset,tenths,hundredths,order=[0,1,2,3]) {
  const values=[(a*1000+b+offset)/1000,(a*10+tenths)/10,(a*1000+b+10)/1000,((a+1)*100+hundredths)/100];
  const text='Quel est le plus petit nombre parmi les suivants ?';
  const list=order.map(i=>numeric(values[i])).join(' ; ');
  return question('q5',text+'<br>'+list,text,values[0],numericOptions(values),`Le plus petit nombre est ${numeric(values[0])}.`,{a,b,offset,tenths,hundredths,order:[...order]});
}
export function generateQuestions(random=Math.random) {
  const integer=(a,b)=>a+Math.floor(random()*(b-a+1));
  const q1=largeNumberQuestion(integer(1,8)*1000000,integer(2,9));
  const q2=decimalLineQuestion(decimalPositions[integer(0,decimalPositions.length-1)]);
  const q3=fractionLineQuestion(integer(2,9));
  const exponent=integer(3,5),lower=10**exponent,upper=10**(exponent+1);
  const q4=intervalQuestion(exponent,integer(lower+1,upper-1),integer(lower-lower/10,lower-1),integer(upper+1,10**(exponent+2)-1));
  const a=integer(1,9),b=integer(1,8)*10,offset=integer(1,9),tenths=integer(1,9),hundredths=integer(1,8),order=[0,1,2,3];
  for(let i=3;i>0;i--){const j=integer(0,i);[order[i],order[j]]=[order[j],order[i]];}
  return [q1,q2,q3,q4,smallestQuestion(a,b,offset,tenths,hundredths,order)];
}
export default {title:'Remédiation — Évaluations nationales — Série 3 : Compréhension du nombre',shuffle:false,generateQuestions,questions:generateQuestions()};
