import { createGridAreaFigure } from './figures/gridAreaFigure.js';
import { remediationMathPresentation as presentation } from './remediationMathPresentation.js';
import { formatAnswer } from '../core/answerFormatting.js';

const math = expression => `\\(${expression}\\)`;
const number = value => formatAnswer(value, 'math');
const measure = (value, unit) => math(`${number(value)}~\\mathrm{${unit}}`);
const wrap = html => `<div class="remediation-number remediation-series5" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
const numericOptions = (values, suffix = '') => values.map(value => ({
  id: String(value), value, text: math(number(value) + suffix)
}));

function question(id, text, options, correction, sourceData, image = '', answerRule = {type:'decimal', numberOnly:true}) {
  if (options.length !== 4 || new Set(options.map(option => option.value)).size !== 4) {
    throw new Error(`QCM ambigu : ${id}`);
  }
  const content = wrap(presentation(text) + image);
  return {
    id, question: {direct:content, qcm:content}, answers:[options[0].id], answerRule,
    possible_answers:options.map(option => option.id), qcmAnswer:options[0].id,
    qcmAnswerRule:{type:'symbolicExact'}, qcmOptions:options, sourceData,
    qcmRenderAnswer:answer => options.find(option => option.id === String(answer))?.text ?? presentation(answer),
    display_answer:wrap(`<span style="color:red">${presentation(correction)}</span>`)
  };
}

// Dictionnaires PythonTeX : formulation, valeur et unité conservées.
export const animalSituations = [
  ['Une coccinelle',7,'mm'], ['Un frelon',2.5,'cm'], ['Une abeille',1.4,'cm'],
  ['Une couleuvre',1.7,'m'], ['Un python réticulé',9,'m'], ['Une girafe',4.2,'m'],
  ['Une fourmi noire',7,'mm'], ['Un moucheron',5,'mm'], ['Un ver de terre',1.5,'dm'],
  ['Un chat',5.1,'dm'], ['Un poux',4,'mm'], ['Un cheval',1.4,'m'],
  ['Une baleine bleue',27,'m'], ['Une puce',3,'mm'], ['Un lapin',4,'dm'],
  ['Un furet',3.8,'dm'], ['Un corbeau',7.1,'dm'], ['Un bourdon',2.3,'cm'],
  ['Une guêpe',1.3,'cm'], ['Une chenille',7,'cm']
];
export function unitQuestion(index) {
  const [animal, value, unit] = animalSituations[index];
  const options = [unit,...['mm','cm','dm','m'].filter(candidate => candidate !== unit)]
    .map(unit => ({id:unit, value:unit, text:math(`\\mathrm{${unit}}`)}));
  return question('q1', `Compléter avec l’unité qui convient.<br>${animal} peut mesurer ${math(`${number(value)}\\ldots`)}`,
    options, `${animal} peut mesurer ${measure(value,unit)}.`, {index,animal,value,unit}, '', {type:'symbolicExact'});
}

// Une unité SVG = un carreau pédagogique ; TikZ utilise un pas de 0,5.
export function rectangleFigure(a, b, filled = false) {
  const config = {
    polygonPoints:[[0,0],[a,0],[a,b],[0,b]],
    gridBounds:{xMin:-1.2,yMin:-1.2,xMax:6.2,yMax:9.2}, cellSize:30,
    gridColor:'gray', gridOpacity:1, gridStrokeWidth:0.8,
    stroke:filled ? 'none' : 'black', strokeWidth:filled ? 0 : 4,
    fill:filled ? 'blue' : 'none', fillOpacity:0.5,
    showUnitCell:false, showLegend:false
  };
  return `<div class="series5-figure" style="width:222px;max-width:100%;margin:16px auto;background:white">${createGridAreaFigure(config)}</div>`;
}
export function perimeterQuestion(a,b) {
  const values = [2*(a+b),2*b,2*b+a,a*b];
  // Seul le distracteur aire de 3 × 6 coïncide avec le périmètre.
  if (a === 3 && b === 6) values[3] = a+b;
  return question('q2', `Un rectangle est dessiné sur un quadrillage. Dans ce quadrillage, chaque carreau mesure ${measure(1,'cm')} de côté.<br>Quel est le périmètre, en centimètre, de ce rectangle ?`,
    numericOptions(values,'~\\mathrm{cm}'), `Le périmètre de ce rectangle est ${math(`2\\times(${a}+${b})=${values[0]}~\\mathrm{cm}`)}.`,
    {a,b}, rectangleFigure(a,b));
}
export const comparisonUnits = ['km','hm','dam','dm','cm','mm'];
export const comparisonPowers = [-3,-2,-1,1,2,3];
export function comparisonQuestion(index) {
  const power = comparisonPowers[index], unit = comparisonUnits[index], value = 10**Math.abs(power);
  const values = [value,...[10,100,1000,10000].filter(candidate => candidate !== value)];
  return question('q3', `Le professeur demande à un élève : « ${measure(1,'m')} c’est combien de fois plus ${power<0?'petit':'grand'} que ${measure(1,unit)} ? »`,
    numericOptions(values,'~\\text{fois}'), `C’est ${math(`${number(value)}~\\text{fois}`)}.`, {index,power,unit});
}
export const lengthUnits = ['km','hm','dam','m','dm','cm','mm'];
export function conversionQuestion(a,power,unitIndex) {
  // Division entière par une puissance de dix : pas de multiplication flottante.
  const scaled = exponent => exponent >= 0 ? a*10**exponent : a/10**(-exponent);
  const exponents = power>0 ? [power,power+1,-power,-power-1] : [power,power-1,-power,-power+1];
  const values = exponents.map(scaled), from = lengthUnits[unitIndex], to = lengthUnits[unitIndex+power];
  return question('q4', `Compléter l’égalité : ${math(`${number(a)}~\\mathrm{${from}}=\\ldots~\\mathrm{${to}}`)}`,
    numericOptions(values), math(`${number(a)}~\\mathrm{${from}}=${number(values[0])}~\\mathrm{${to}}`), {a,power,unitIndex,from,to});
}
export function areaQuestion(a,b) {
  const shape = a===b ? 'carré' : 'rectangle', values = [a*b,2*(a+b),a+b,a*b+2*a];
  // La formule du périmètre donne aussi 18 pour le rectangle 3 × 6.
  if (a===3 && b===6) values[1] = 2*b;
  return question('q5', `Un ${shape} est dessiné sur un quadrillage. Chaque carreau de ce quadrillage fait ${measure(1,'cm')} de côté.<br>Quel est l’aire de ce ${shape} en ${math('\\mathrm{cm}^2')} ?`,
    numericOptions(values,'~\\mathrm{cm}^2'), `L’aire de ce ${shape} est ${math(`${a}\\times${b}=${a*b}~\\mathrm{cm}^2`)}.`,
    {a,b,shape}, rectangleFigure(a,b,true));
}
export function generateQuestions(random = Math.random) {
  const integer = (min,max) => min+Math.floor(random()*(max-min+1));
  const q1 = unitQuestion(integer(0,19));
  const a2 = integer(3,5), b2 = integer(a2+1,8);
  const q2 = perimeterQuestion(a2,b2), q3 = comparisonQuestion(integer(0,5));
  // Tirer uniformément dans les valeurs admises reproduit les rejets Python.
  const a4Index = integer(0,80), a4 = 11+Math.floor(a4Index/9)*10+a4Index%9;
  const power = comparisonPowers[integer(0,5)];
  const unitIndex = integer(Math.max(0,-power),Math.min(6,6-power));
  const q4 = conversionQuestion(a4,power,unitIndex);
  const family = integer(1,2);
  const a5 = family===1 ? integer(3,5) : (integer(0,1)===0 ? 3 : 5);
  const b5 = family===1 ? integer(a5+1,8) : a5;
  return [q1,q2,q3,q4,areaQuestion(a5,b5)];
}
export default {
  title:'Remédiation — Évaluations nationales — Série 5 : Grandeurs',
  shuffle:false, generateQuestions, questions:generateQuestions()
};
