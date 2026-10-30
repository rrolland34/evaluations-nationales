import { validateClockTime, validateClockHands, initializeClockHands } from './timeClockInteraction.js';
import { melangerTableau } from '../core/tableaux.js';

export function clockSVG(hours = 0, minutes = 0, { hands = true, color = 'black', secondsHand = false } = {}) {
  const point = (angle, radius) => [110 + radius * Math.sin(angle * Math.PI / 180), 110 - radius * Math.cos(angle * Math.PI / 180)];
  const line = (angle, inner, outer, width) => {
    const a = point(angle, inner), b = point(angle, outer);
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="black" stroke-width="${width}"/>`;
  };
  const ticks = Array.from({length:60}, (_,i)=>line(i*6,97.5,100,1)).join('') + Array.from({length:12},(_,i)=>line(i*30,95,100,1.2)).join('');
  const numbers = Array.from({length:12},(_,i)=>{const [x,y]=point((i+1)*30,82.5);return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="black">${i+1}</text>`;}).join('');
  const hand = (kind, angle, length, width, stroke = color) => { const [x,y]=point(angle,length); return `<line data-hand="${kind}" data-angle="${angle}" x1="110" y1="110" x2="${x}" y2="${y}" stroke="${stroke}" stroke-width="${width}"/>`; };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="Horloge" style="display:block;width:320px;max-width:100%;height:auto;margin:16px auto;font-size:15px;stroke-linecap:round"><circle cx="110" cy="110" r="100" fill="white" stroke="black" stroke-width="1.5"/>${ticks}${numbers}${hands ? hand('hours',hours*30+minutes*.5,65,4)+hand('minutes',minutes*6,90,2.5) : '<circle cx="110" cy="110" r="1" fill="black"/>'}${secondsHand ? hand('seconds',0,100*1.4/1.5,1,'red') : ''}</svg>`;
}

const knowledge = [[4, "Combien y a-t-il d'heures dans un jour ?", "\\(\\text{Il y a }24\\text{ heures dans un jour.}\\)", 24], [5, "Combien y a-t-il de minutes dans une heure ?", "\\(\\text{Il y a }60\\text{ minutes dans une heure.}\\)", 60], [6, "Combien y a-t-il de secondes dans une minute ?", "\\(\\text{Il y a }60\\text{ secondes dans une minute.}\\)", 60], [7, "Combien y a-t-il de secondes dans une heure ?", "\\(\\text{Il y a }3~600\\text{ secondes dans une heure.}\\)", 3600], [8, "Combien y a-t-il de jours dans une année non bissextile ?", "\\(\\text{Il y a }365\\text{ jours dans une année non bissextile.}\\)", 365], [9, "Combien y a-t-il de jours dans une année bissextile ?", "\\(\\text{Il y a }366\\text{ jours dans une année bissextile.}\\)", 366], [10, "Combien y a-t-il d'années dans un siècle ?", "\\(\\text{Il y a }100\\text{ années dans un siècle.}\\)", 100], [11, "Combien y a-t-il d'années dans un millénaire ?", "\\(\\text{Il y a }1~000\\text{ années dans un millénaire.}\\)", 1000], [12, "Combien y a-t-il de minutes dans un quart d'heure ?", "\\(\\text{Il y a }15\\text{ minutes dans un quart d'heure.}\\)", 15], [13, "Combien y a-t-il de minutes dans une demi-heure ?", "\\(\\text{Il y a }30\\text{ minutes dans une demi-heure.}\\)", 30], [14, "Combien y a-t-il de minutes dans trois quarts d'heure ?", "\\(\\text{Il y a }45\\text{ minutes dans trois quarts d'heure.}\\)", 45], [15, "Combien y a-t-il de minutes dans \\(0{,}25~\\mathrm{h}\\) ?", "\\(\\text{Il y a }15\\text{ minutes dans }0{,}25~\\mathrm{h}\\text{.}\\)", 15], [16, "Combien y a-t-il de minutes dans \\(0{,}5~\\mathrm{h}\\) ?", "\\(\\text{Il y a }30\\text{ minutes dans }0{,}5~\\mathrm{h}\\text{.}\\)", 30], [17, "Combien y a-t-il de minutes dans \\(0{,}75~\\mathrm{h}\\) ?", "\\(\\text{Il y a }45\\text{ minutes dans }0{,}75~\\mathrm{h}\\text{.}\\)", 45]];
const timeText = (h,m) => `\\(${h}~\\mathrm{h}~${String(m).padStart(2,'0')}\\)`;
const mathSentence = text => '\\(' + text.split(/(\\\(.*?\\\))/).filter(Boolean).map(part => part.startsWith('\\(') ? part.slice(2,-2) : `\\text{${part}}`).join('') + '\\)';
const statement = (text, figure = '') => `<div class="time-duration-statement" style="min-width:0;max-width:100%;width:100%"><div>${mathSentence(text)}</div>${figure}</div>`;
const clockQcmStyles = `<style>
#qcm-buttons.time-clock-qcm { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;width:100%;max-width:760px;margin:auto; }
#qcm-buttons.time-clock-qcm button { min-width:0!important;padding:8px!important; }
#qcm-buttons.time-clock-qcm svg { width:160px!important;max-width:100%;margin:8px auto!important; }
#qcm-buttons.time-clock-qcm span { display:block; }
@media(max-width:650px){#qcm-buttons.time-clock-qcm{grid-template-columns:repeat(2,minmax(0,1fr));}}
</style>`;
export function generateQuestions(random = Math.random) {
  const integer = (a,b) => a + Math.floor(random()*(b-a+1));
  const h=integer(0,11), m=integer(0,59), h3=integer(0,11), m3=integer(0,59), reading=integer(1,2);
  const hour = h + (reading===2 ? 12 : 0);
  const handsState = {};
  const clockChoices = [[h3,m3],[h3,(m3+15)%60],[(h3+1)%12,m3],[(h3+6)%12,(m3+30)%60]].map(([h,m])=>`clock:${h}:${m}`);
  const renderClockChoice = value => {
    if (!clockChoices.includes(value)) return '';
    const [,h,m]=value.split(':').map(Number);
    return clockSVG(h,m);
  };
  const numeric = id => {
    const [,question,display_answer,value]=knowledge.find(row=>row[0]===id);
    return {id:`q${id}`, question:statement(question), initializeResponse({document}) { const note=document.createElement('small'); note.textContent='Donner uniquement la valeur numérique, sans unité.'; note.style.display='block'; document.getElementById('question').querySelector('.time-duration-statement').appendChild(note); },display_answer,answers:[String(value)],answerRule:{type:'integer'},qcmNumberFormat:'math',possible_answers:[value,value+1,value+2,value+3]};
  };
  // Même tirage des trois groupes, puis mélange ; aucun mélange des deux horloges.
  const last = [integer(4,7),integer(8,11),integer(12,17)].map(numeric);
  return [
    {id:`q${reading}`,question:statement(`Quelle heure ${reading===1 ? 'du matin' : "de l'après-midi"} cette horloge indique-t-elle ?`,clockSVG(h,m)),answers:[`${hour}h${String(m).padStart(2,'0')}`],answerRule:{type:'custom',validate:({userInput})=>validateClockTime(userInput,hour,m,reading===2)},display_answer:mathSentence(`Cette horloge indique ${timeText(hour,m)}.`),possible_answers:[hour,(hour+1)%24,(hour+2)%24,(hour+3)%24].map(v=>timeText(v,m))},
    {id:'q3',question:{direct:statement(`Placer les aiguilles pour que l'horloge indique ${timeText(h3,m3)}.`,clockSVG(0,0,{hands:false})),qcm:clockQcmStyles+statement(`Quelle horloge indique ${timeText(h3,m3)} ?`)},answers:[timeText(h3,m3)],showCorrectionOnSuccess:true,possible_answers:clockChoices,qcmAnswer:clockChoices[0],qcmAnswerRule:{type:'symbolicExact'},qcmRenderAnswer:renderClockChoice,qcmClass:'time-clock-qcm',initializeResponse({document}) { const input=document.getElementById('user-answer'); input.style.display='none'; return initializeClockHands(document.getElementById('question').querySelector('svg'),handsState,state=>{ input.value=state.hoursMoved && state.minutesMoved ? JSON.stringify(state) : ''; }); },answerRule:{type:'custom',validate:()=>validateClockHands(handsState,h3,m3)},display_answer:clockSVG(h3,m3,{color:'red'})},
    ...melangerTableau(last,random)
  ];
}
export default {title:"Le repérage dans le temps et les durées",shuffle:false,generateQuestions,questions:generateQuestions()};
