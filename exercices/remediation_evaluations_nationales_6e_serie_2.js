import { remediationMathPresentation } from './remediationMathPresentation.js';
import { formatAnswer } from '../core/answerFormatting.js';

const math = text => `\\(${text}\\)`;
const number = value => formatAnswer(value,'math');
const numeric = value => math(number(value));
const fraction = (n,d) => math(`\\dfrac{${n}}{${d}}`);
const wrap = html => `<div class="remediation-number" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
export const ranks = ['milliers','centaines','dizaines','unités'];

// Le lecteur conserve le bouton Valider, le score et l’historique ; seul le
// contrôle de saisie est remplacé, puis nettoyé à la navigation.
export function initializeRankSelect({document}) {
  const input=document.getElementById('user-answer'),container=document.getElementById('question').querySelector('.remediation-number');
  const previousDisplay=input.style.display;
  input.style.display='none';input.value='';
  const select=document.createElement('select');
  select.id='remediation-rank-select';select.setAttribute('aria-label','Rang du chiffre');
  select.style.cssText='display:block;max-width:100%;margin:16px auto;padding:10px;font:inherit';
  for(const [value,text] of [['','Choisir une réponse…'],...ranks.map(rank=>[rank,rank])]) {
    const option=document.createElement('option');option.value=value;option.textContent=text;select.appendChild(option);
  }
  const onChange=()=>{input.value=select.value;};
  select.addEventListener('change',onChange);container.appendChild(select);
  return ()=>{select.removeEventListener('change',onChange);select.remove();input.style.display=previousDisplay;};
}
function question(id,direct,qcm,answer,options,correction,data,answerRule={type:'decimal',numberOnly:true}) {
  if(new Set(options.map(o=>o.value)).size!==4)throw new Error(`Propositions ambiguës : ${id}`);
  return {id,question:{direct:wrap(remediationMathPresentation(direct)),qcm:wrap(remediationMathPresentation(qcm))},answers:[String(answer)],answerRule,
    possible_answers:options.map(o=>o.text),qcmAnswer:options.find(o=>o.correct)?.text ?? options[0].text,
    qcmRenderAnswer:remediationMathPresentation,
    qcmAnswerRule:{type:'symbolicExact'},sourceData:data,qcmOptions:options,
    display_answer:wrap(`<span style="color:red">${remediationMathPresentation(correction)}</span>`)};
}
const numericOptions = values => values.map(value=>({value,text:numeric(value)}));
const sumHtml = terms => terms.map(numeric).join(' + ');
export function rankQuestion(digits,position) {
  const hundredths=digits.slice(0,4).reduce((n,d)=>n*10+d,0)*100+digits[4]*10+digits[5];
  const value=hundredths/100,digit=digits[position],answer=ranks[position];
  const text=`Dans le nombre ${numeric(value)} le ${numeric(digit)} correspond au chiffre des …`;
  return {...question('q1',text,text,answer,ranks.map((rank,i)=>({text:rank,value:rank,correct:i===position})),
    `Dans le nombre ${numeric(value)}, le chiffre ${numeric(digit)} est le chiffre des <strong>${answer}</strong>.`,{digits:[...digits],position,value},{type:'symbolicExact'}),initializeResponse:initializeRankSelect};
}
export function sumQuestion(digits,family) {
  const [a,b,c,d]=digits,terms=[a*100000,b*10000,c*10**(3-family),d],value=terms.reduce((x,y)=>x+y,0);
  const statement=`Quel est le nombre qui complète cette égalité ?<p>${sumHtml(terms)} = …</p>`;
  return question('q2',statement,statement,value,numericOptions([value,a*10000+b*1000+terms[2]+d,a*1000000+b*100000+terms[2]+d,a*1000+b*100+c*10+d]),
    sumHtml(terms)+' = '+numeric(value),{digits:[...digits],family});
}
export function decompositionQuestion(a,b,c,d) {
  const value=(a*1000+b*10**(3-c)+d)/1000;
  const values=c===1?[value,(a*100+b*10+d)/100,a*100+b*10+d,(a*100+b*10+d)/10]:[value,(a*100+b*10+d)/100,a*100+b*10+d,(a*1000+b*100+d)/1000];
  const expression=`${a}+\\dfrac{${b}}{${10**c}}+\\dfrac{${d}}{1~000}`;
  const statement=`Quel nombre est égal à ${math(expression)} ?`;
  return question('q3',statement,statement,value,numericOptions(values),math(expression+'='+number(value)),{a,b,c,d});
}
export function unitsQuestion(a,count,family) {
  const denominator=family===0?10:100,value=(a*denominator+count)/denominator;
  const wording=`${a} unités et ${count} ${family===0?'dixièmes':'centièmes'}`;
  return question('q4',`Voici un nombre : ${wording}.<p>Quelle est son écriture décimale ?</p>`,
    `Voici un nombre : ${wording}.<p>Parmi les quatre propositions, quelle est l’autre écriture de ce nombre ?</p>`,value,
    numericOptions([value,(a*denominator*10+count)/(denominator*10),a*denominator*10+count,count*10+a]),
    `L’écriture décimale du nombre ${wording} est ${numeric(value)}.`,{a,count,family});
}
export function equivalentFractionQuestion(denominator,coefficient) {
  const pairs=[[coefficient,denominator*coefficient],[denominator*coefficient,denominator*coefficient],[coefficient-1,denominator],[denominator*coefficient,denominator]];
  // Réparer uniquement les 7 collisions ; préserver les 9 QCM originaux valides.
  if(coefficient===2 || coefficient-1===denominator) {
    pairs[2]=[coefficient+1,denominator*coefficient];
  }
  const options=pairs.map(([n,d])=>({text:fraction(n,d),value:n/d}));
  return question('q5',`Écrire une fraction égale à ${fraction(1,denominator)}.`,
    `Parmi les propositions suivantes, quelle est la fraction égale à ${fraction(1,denominator)} ?`,
    `1/${denominator}`,options,
    math(`\\dfrac{1}{${denominator}}=\\dfrac{1\\times${coefficient}}{${denominator}\\times${coefficient}}=\\dfrac{${coefficient}}{${denominator*coefficient}}`),
    {denominator,coefficient},{type:'fraction'});
}
// Les 16 couples sont valides grâce à la substitution ciblée ci-dessus.
export const fractionParameters=Array.from({length:4},(_,i)=>i+2).flatMap(denominator=>
  Array.from({length:4},(_,i)=>i+2).map(coefficient=>({denominator,coefficient})));
export function generateQuestions(random=Math.random) {
  const integer=(a,b)=>a+Math.floor(random()*(b-a+1));
  // Tirage uniforme sans remise : mêmes chiffres et contraintes que les rejets Python.
  const digits=n=>{const pool=[1,2,3,4,5,6,7,8,9];return Array.from({length:n},()=>pool.splice(integer(0,pool.length-1),1)[0]);};
  // Q4 : les deux distracteurs entiers coïncident pour count = 11*a ou 111*a.
  const nonzeroLast=(lower,upper,a)=>{const values=Array.from({length:upper-lower+1},(_,i)=>i+lower).filter(n=>n%10!==0 && n!==(lower===10?11:111)*a);return values[integer(0,values.length-1)];};
  const q1=rankQuestion(digits(6),integer(0,3));
  const q2=sumQuestion(digits(4),integer(1,2));
  const q3=decompositionQuestion(integer(1,9),integer(1,9),integer(1,2),integer(1,9));
  const a=integer(2,9),b=nonzeroLast(10,99,a),c=nonzeroLast(100,999,a),family=integer(0,1);
  const selected=fractionParameters[integer(0,fractionParameters.length-1)];
  return [q1,q2,q3,unitsQuestion(a,family===0?b:c,family),equivalentFractionQuestion(selected.denominator,selected.coefficient)];
}
// Référence 30 s fournie par le curseur du lecteur : aucune durée exceptionnelle.
export default {title:'Remédiation — Évaluations nationales — Série 2 : Compréhension du nombre',shuffle:false,generateQuestions,questions:generateQuestions()};
