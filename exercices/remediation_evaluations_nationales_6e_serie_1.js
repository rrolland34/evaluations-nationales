import { remediationMathPresentation } from './remediationMathPresentation.js';
import { parseAnswer } from '../core/answerParser.js';
import { formatAnswer } from '../core/answerFormatting.js';

// Correspondances PythonTeX : les chaînes QCM ne sont jamais normalisées pour l’affichage.
export const integerVariants = [
  {
    "value": 70013,
    "words": "soixante-dix-mille-treize",
    "choices": [
      "70 013",
      "70 1013",
      "60 101 013",
      "10 013"
    ]
  },
  {
    "value": 71009,
    "words": "soixante-onze-mille-neuf",
    "choices": [
      "71 009",
      "71 1009",
      "60 111 009",
      "11 009"
    ]
  },
  {
    "value": 72012,
    "words": "soixante-douze-mille-douze",
    "choices": [
      "72 012",
      "72 1012",
      "60 121 012",
      "12 012"
    ]
  },
  {
    "value": 73009,
    "words": "soixante-treize-mille-neuf",
    "choices": [
      "73 009",
      "73 1009",
      "60 131 009",
      "13 009"
    ]
  },
  {
    "value": 74005,
    "words": "soixante-quatorze-mille-cinq",
    "choices": [
      "74 005",
      "74 1005",
      "60 141 005",
      "14 005"
    ]
  },
  {
    "value": 75017,
    "words": "soixante-quinze-mille-dix-sept",
    "choices": [
      "75 017",
      "75 1017",
      "60 151 017",
      "15 017"
    ]
  },
  {
    "value": 76004,
    "words": "soixante-seize-mille-quatre",
    "choices": [
      "76 004",
      "76 1004",
      "60 161 004",
      "16 004"
    ]
  },
  {
    "value": 77006,
    "words": "soixante-dix-sept-mille-six",
    "choices": [
      "77 006",
      "77 1006",
      "60 171 006",
      "17 006"
    ]
  },
  {
    "value": 78028,
    "words": "soixante-dix-huit-mille-vingt-huit",
    "choices": [
      "78 028",
      "78 1028",
      "60 181 028",
      "18 028"
    ]
  },
  {
    "value": 79007,
    "words": "soixante-dix-neuf-mille-sept",
    "choices": [
      "79 007",
      "79 1007",
      "60 191 007",
      "19 007"
    ]
  },
  {
    "value": 90008,
    "words": "quatre-vingt-dix-mille-huit",
    "choices": [
      "90 008",
      "90 1008",
      "80 101 008",
      "10 008"
    ]
  },
  {
    "value": 91019,
    "words": "quatre-vingt-onze-mille-dix-neuf",
    "choices": [
      "91 019",
      "91 1019",
      "80 111 019",
      "11 019"
    ]
  },
  {
    "value": 92003,
    "words": "quatre-vingt-douze-mille-trois",
    "choices": [
      "92 003",
      "92 1003",
      "80 121 003",
      "12 003"
    ]
  },
  {
    "value": 93017,
    "words": "quatre-vingt-treize-mille-dix-sept",
    "choices": [
      "93 017",
      "93 1017",
      "80 131 017",
      "13 017"
    ]
  },
  {
    "value": 94012,
    "words": "quatre-vingt-quatorze-mille-douze",
    "choices": [
      "94 012",
      "94 1012",
      "80 141 012",
      "14 012"
    ]
  },
  {
    "value": 95011,
    "words": "quatre-vingt-quinze-mille-onze",
    "choices": [
      "95 011",
      "95 1011",
      "80 151 011",
      "15 011"
    ]
  },
  {
    "value": 96002,
    "words": "quatre-vingt-seize-mille-deux",
    "choices": [
      "96 002",
      "96 1002",
      "80 161 002",
      "16 002"
    ]
  },
  {
    "value": 97015,
    "words": "quatre-vingt-dix-sept-mille-quinze",
    "choices": [
      "97 015",
      "97 1015",
      "80 171 015",
      "17 015"
    ]
  },
  {
    "value": 98018,
    "words": "quatre-vingt-dix-huit-mille-dix-huit",
    "choices": [
      "98 018",
      "98 1018",
      "80 181 018",
      "18 018"
    ]
  },
  {
    "value": 99011,
    "words": "quatre-vingt-dix-neuf-mille-onze",
    "choices": [
      "99 011",
      "99 1011",
      "80 191 011",
      "19 011"
    ]
  }
];
export const decimalVariants = [
  {
    "value": 0.002,
    "words": "deux-millièmes",
    "choices": [
      "0,002",
      "0,200",
      "2,001",
      "2,1000"
    ]
  },
  {
    "value": 0.003,
    "words": "trois-millièmes",
    "choices": [
      "0,003",
      "0,300",
      "3,001",
      "3,1000"
    ]
  },
  {
    "value": 0.005,
    "words": "cinq-millièmes",
    "choices": [
      "0,005",
      "0,500",
      "5,001",
      "5,1000"
    ]
  },
  {
    "value": 0.009,
    "words": "neuf-millièmes",
    "choices": [
      "0,009",
      "0,900",
      "9,001",
      "9,1000"
    ]
  },
  {
    "value": 0.012,
    "words": "douze-millièmes",
    "choices": [
      "0,012",
      "0,120",
      "12,001",
      "12,1000"
    ]
  },
  {
    "value": 0.026,
    "words": "vingt-six-millièmes",
    "choices": [
      "0,026",
      "0,260",
      "26,001",
      "26,1000"
    ]
  },
  {
    "value": 0.054,
    "words": "cinquante-quatre-millièmes",
    "choices": [
      "0,054",
      "0,540",
      "54,001",
      "54,1000"
    ]
  },
  {
    "value": 0.03,
    "words": "trois-centièmes",
    "choices": [
      "0,03",
      "0,30",
      "3,01",
      "3,100"
    ]
  },
  {
    "value": 0.06,
    "words": "six-centièmes",
    "choices": [
      "0,06",
      "0,60",
      "6,01",
      "6,100"
    ]
  },
  {
    "value": 0.07,
    "words": "sept-centièmes",
    "choices": [
      "0,07",
      "0,70",
      "7,01",
      "7,100"
    ]
  },
  {
    "value": 0.09,
    "words": "neuf-centièmes",
    "choices": [
      "0,09",
      "0,90",
      "9,01",
      "9,100"
    ]
  },
  {
    "value": 0.072,
    "words": "soixante-douze-millièmes",
    "choices": [
      "0,072",
      "0,720",
      "72,001",
      "72,1000"
    ]
  },
  {
    "value": 0.085,
    "words": "quatre-vingt-cinq-millièmes",
    "choices": [
      "0,085",
      "0,850",
      "85,001",
      "85,1000"
    ]
  },
  {
    "value": 0.092,
    "words": "quatre-vingt-douze-millièmes",
    "choices": [
      "0,092",
      "0,920",
      "92,001",
      "92,1000"
    ]
  },
  {
    "value": 0.12,
    "words": "douze-centièmes",
    "choices": [
      "0,12",
      "1,2",
      "12,01",
      "12,100"
    ]
  },
  {
    "value": 1.2,
    "words": "douze-dixièmes",
    "choices": [
      "1,2",
      "0,12",
      "12,1",
      "12,10"
    ]
  },
  {
    "value": 4.5,
    "words": "quarante-cinq-dixièmes",
    "choices": [
      "4,5",
      "0,45",
      "45,1",
      "45,10"
    ]
  },
  {
    "value": 9.4,
    "words": "quatre-vingt-quatorze-dixièmes",
    "choices": [
      "9,4",
      "0,94",
      "94,1",
      "94,10"
    ]
  },
  {
    "value": 10.7,
    "words": "cent-sept-dixièmes",
    "choices": [
      "10,7",
      "0,107",
      "107,1",
      "107,10"
    ]
  },
  {
    "value": 20.9,
    "words": "deux-cent-neuf-dixièmes",
    "choices": [
      "20,9",
      "0,209",
      "209,1",
      "209,10"
    ]
  }
];
export const unitVariants = [
  {
    "value": 0.05,
    "words": "5 centièmes",
    "choices": [
      "10 fois 5 millièmes",
      "10 fois 5 dixièmes",
      "10 fois 5 unités",
      "10 fois 5 dizaines"
    ],
    "missing": "5 millièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.06,
    "words": "6 centièmes",
    "choices": [
      "10 fois 6 millièmes",
      "10 fois 6 dixièmes",
      "10 fois 6 unités",
      "10 fois 6 dizaines"
    ],
    "missing": "6 millièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.07,
    "words": "7 centièmes",
    "choices": [
      "10 fois 7 millièmes",
      "10 fois 7 dixièmes",
      "10 fois 7 unités",
      "10 fois 7 dizaines"
    ],
    "missing": "7 millièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.08,
    "words": "8 centièmes",
    "choices": [
      "10 fois 8 millièmes",
      "10 fois 8 dixièmes",
      "10 fois 8 unités",
      "10 fois 8 dizaines"
    ],
    "missing": "8 millièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.09,
    "words": "9 centièmes",
    "choices": [
      "10 fois 9 millièmes",
      "10 fois 9 dixièmes",
      "10 fois 9 unités",
      "10 fois 9 dizaines"
    ],
    "missing": "9 millièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.3,
    "words": "3 dixièmes",
    "choices": [
      "100 fois 3 millièmes",
      "100 fois 3 centièmes",
      "100 fois 3 unités",
      "100 fois 3 dizaines"
    ],
    "missing": "3 millièmes",
    "factor": "100 fois"
  },
  {
    "value": 0.4,
    "words": "4 dixièmes",
    "choices": [
      "100 fois 4 millièmes",
      "100 fois 4 centièmes",
      "100 fois 4 unités",
      "100 fois 4 dizaines"
    ],
    "missing": "4 millièmes",
    "factor": "100 fois"
  },
  {
    "value": 0.7,
    "words": "7 dixièmes",
    "choices": [
      "100 fois 7 millièmes",
      "100 fois 7 centièmes",
      "100 fois 7 unités",
      "100 fois 7 dizaines"
    ],
    "missing": "7 millièmes",
    "factor": "100 fois"
  },
  {
    "value": 0.8,
    "words": "8 dixièmes",
    "choices": [
      "10 fois 8 centièmes",
      "10 fois 8 millièmes",
      "10 fois 8 unités",
      "10 fois 8 dizaines"
    ],
    "missing": "8 centièmes",
    "factor": "10 fois"
  },
  {
    "value": 0.9,
    "words": "9 dixièmes",
    "choices": [
      "10 fois 9 centièmes",
      "10 fois 9 millièmes",
      "10 fois 9 unités",
      "10 fois 9 dizaines"
    ],
    "missing": "9 centièmes",
    "factor": "10 fois"
  },
  {
    "value": 5,
    "words": "5 unités",
    "choices": [
      "1 000 fois 5 millièmes",
      "1 000 fois 5 centièmes",
      "1 000 fois 5 centaines",
      "1 000 fois 5 dizaines"
    ],
    "missing": "5 millièmes",
    "factor": "1 000 fois"
  },
  {
    "value": 6,
    "words": "6 unités",
    "choices": [
      "1 000 fois 6 millièmes",
      "1 000 fois 6 centièmes",
      "1 000 fois 6 centaines",
      "1 000 fois 6 dizaines"
    ],
    "missing": "6 millièmes",
    "factor": "1 000 fois"
  },
  {
    "value": 7,
    "words": "7 unités",
    "choices": [
      "1 000 fois 7 millièmes",
      "1 000 fois 7 centièmes",
      "1 000 fois 7 centaines",
      "1 000 fois 7 dizaines"
    ],
    "missing": "7 millièmes",
    "factor": "1 000 fois"
  },
  {
    "value": 8,
    "words": "8 unités",
    "choices": [
      "1 000 fois 8 millièmes",
      "1 000 fois 8 centièmes",
      "1 000 fois 8 centaines",
      "1 000 fois 8 dizaines"
    ],
    "missing": "8 millièmes",
    "factor": "1 000 fois"
  },
  {
    "value": 9,
    "words": "9 unités",
    "choices": [
      "1 000 fois 9 millièmes",
      "1 000 fois 9 centièmes",
      "1 000 fois 9 centaines",
      "1 000 fois 9 dizaines"
    ],
    "missing": "9 millièmes",
    "factor": "1 000 fois"
  },
  {
    "value": 30,
    "words": "3 dizaines",
    "choices": [
      "100 fois 3 dixièmes",
      "100 fois 3 centièmes",
      "100 fois 3 unités",
      "100 fois 3 centaines"
    ],
    "missing": "3 dixièmes",
    "factor": "100 fois"
  },
  {
    "value": 50,
    "words": "5 dizaines",
    "choices": [
      "100 fois 5 dixièmes",
      "100 fois 5 centièmes",
      "100 fois 5 unités",
      "100 fois 5 centaines"
    ],
    "missing": "5 dixièmes",
    "factor": "100 fois"
  },
  {
    "value": 60,
    "words": "6 dizaines",
    "choices": [
      "10 fois 6 unités",
      "10 fois 6 dixièmes",
      "10 fois 6 centièmes",
      "10 fois 6 centaines"
    ],
    "missing": "6 unités",
    "factor": "10 fois"
  },
  {
    "value": 80,
    "words": "8 dizaines",
    "choices": [
      "100 fois 8 dixièmes",
      "100 fois 8 centièmes",
      "100 fois 8 unités",
      "100 fois 8 centaines"
    ],
    "missing": "8 dixièmes",
    "factor": "100 fois"
  },
  {
    "value": 90,
    "words": "9 dizaines",
    "choices": [
      "10 fois 9 unités",
      "10 fois 9 dixièmes",
      "10 fois 9 centièmes",
      "10 fois 9 centaines"
    ],
    "missing": "9 unités",
    "factor": "10 fois"
  }
];

const math = text => `\\(${text}\\)`;
const numericText = value => formatAnswer(value,'math').replaceAll('{,}',',').replaceAll('~',' ');
const numericValue = text => Number(text.replaceAll(' ','').replace(',','.'));
const numericOption = text => ({text:math(text.replaceAll(' ','~').replace(',','{,}')),value:numericValue(text)});
const units = {millièmes:0.001,centièmes:0.01,dixièmes:0.1,unités:1,dizaines:10,centaines:100};
export function unitValue(text) {
  const match=text.match(/^(?:(\d[\d ]*) fois )?(\d+) (.+)$/);
  return Number((match[1]||'1').replaceAll(' ',''))*Number(match[2])*(units[match[3]] ?? units[match[3]+'s']);
}
export function distinct(options) { return new Set(options.map(o=>o.value)).size===4; }
const wrap = html => `<div class="remediation-number" style="min-width:0;max-width:100%;font-size:clamp(14px,3vw,30px)">${html}</div>`;
function question(id,direct,qcm,answer,options,correction) {
  if(!distinct(options))throw new Error(`QCM ambigu : ${id}`);
  return {id,question:{direct:wrap(remediationMathPresentation(direct)),qcm:wrap(remediationMathPresentation(qcm))},answers:[String(answer)],
    answerRule:id==='q5'?unitAnswerRule(answer):{type:'custom',validate:({userInput})=>{const parsed=parseAnswer(userInput);return {valid:parsed.valid && parsed.unit==='' && parsed.value===Number(answer)};}},
    possible_answers:options.map(o=>o.text),qcmOptions:options,qcmAnswer:options[0].text,
    qcmRenderAnswer:remediationMathPresentation,
    qcmAnswerRule:{type:'symbolicExact'},
    display_answer:wrap(`<span style="color:red">${remediationMathPresentation(correction)}</span>`)};
}
export function integerQuestion(index) {
  const v=typeof index==='object'?index:integerVariants[index];return question('q1',`Écrire le nombre ${v.words} en chiffres.`,`Le nombre ${v.words} s’écrit :`,v.value,v.choices.map(numericOption),`Le nombre ${v.words} s’écrit : ${numericOption(v.choices[0]).text}.`);
}
export function decimalQuestion(index) {
  const v=typeof index==='object'?index:decimalVariants[index];return question('q2',`Écrire le nombre ${v.words} en chiffres.`,`Le nombre ${v.words} s’écrit :`,v.value,v.choices.map(numericOption),`Le nombre ${v.words} s’écrit : ${numericOption(v.choices[0]).text}.`);
}
export function decompositionQuestion(a,b,c) {
  const denominator=10**c,result=a+b/denominator;
  const terms=[numericText(result),numericText((a*denominator+b)/10**(c+1)),`${a*10+b},${'0'.repeat(c)}`,`${a*10+b},${c===1?'10':'100'}`];
  const expression=`${a}+\\dfrac{${b}}{${denominator}}=`;
  return question('q3',math(expression+'\\ldots'),math(expression+'\\ldots'),result,terms.map(numericOption),math(expression+formatAnswer(result,'math')));
}
export function fractionQuestion(a,b) {
  const denominator=10**b,fraction=math(`\\dfrac{${a}}{${b===3?'1~000':denominator}}`);
  const terms=[a/denominator,a/(b===2?10:100),a,a*denominator];
  return question('q4',`Quel nombre est égal à la fraction ${fraction} ?`,`Quel nombre est égal à la fraction ${fraction} ?`,a/denominator,terms.map(v=>numericOption(numericText(v))),`Le nombre égal à la fraction ${fraction} est : ${math(formatAnswer(a/denominator,'math'))}.`);
}
export function unitQuestion(index) {
  const v=typeof index==='object'?index:unitVariants[index],options=v.choices.map(text=>({text,value:unitValue(text)}));
  return question('q5',`${v.words} est égal à ${v.factor} …`,`${v.words} est égal à …`,v.missing,options,`${v.words} est égal à ${v.factor} ${v.missing}.`);
}

// Graphies autorisées : aucune distance approximative entre les unités.
const unitSpellings={millieme:'millièmes',milieme:'millièmes',centieme:'centièmes',dixieme:'dixièmes',unite:'unités',dizaine:'dizaines',centaine:'centaines'};
export function parseNumeration(text) {
  const normalized=String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s/g,'');
  const match=normalized.match(/^(\d+)([a-z]+)$/);
  if(!match)return null;
  const unit=unitSpellings[match[2].replace(/s$/,'')];
  return unit?{count:Number(match[1]),unit}:null;
}
function unitAnswerRule(answer) {
  const expected=parseNumeration(answer);
  return {type:'custom',validate:({userInput})=>{const actual=parseNumeration(userInput);return {valid:!!actual && actual.count===expected.count && actual.unit===expected.unit};}};
}
const smallWords=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
export function frenchNumber(n) {
  if(n<=16)return smallWords[n];
  if(n<20)return 'dix-'+smallWords[n-10];
  if(n<70){const tens=['','','vingt','trente','quarante','cinquante','soixante'][Math.floor(n/10)],rest=n%10;return tens+(rest===0?'':rest===1?'-et-un':'-'+smallWords[rest]);}
  if(n<80)return 'soixante'+(n===71?'-et-onze':'-'+frenchNumber(n-60));
  return n===80?'quatre-vingts':'quatre-vingt-'+frenchNumber(n-80);
}
export function integerFamily(thousands,tail) {
  const base=thousands<80?60:80,value=thousands*1000+tail;
  return integerQuestion({value,words:frenchNumber(thousands)+'-mille-'+frenchNumber(tail),choices:[numericText(value),`${thousands} ${1000+tail}`,numericText(base*1000000+((thousands-base)*10+1)*1000+tail),numericText((thousands-base)*1000+tail)]});
}
// En dixièmes, n,01 représente la confusion de rang sans répéter la valeur n,1.
// Les dictionnaires originaux restent intégralement conservés.
export function decimalFamily(n,c) {
  const value=n/10**c,choices=[numericText(value),(c===3?'0,'+String(n).padEnd(3,'0'):c===2&&n<10?'0,'+String(n)+'0':numericText(n/(c===1?100:10))),`${n},${'0'.repeat(c-1)}1`,c===1?`${n},01`:`${n},1${'0'.repeat(c)}`];
  return decimalQuestion({value,words:frenchNumber(n)+'-'+({1:n===1?'dixième':'dixièmes',2:n===1?'centième':'centièmes',3:n===1?'millième':'millièmes'}[c]),choices});
}
const unitModels=[0,5,8,10,15,17];
export function unitFamily(model,count) {
  const original=unitVariants[unitModels[model]];
  const change=text=>text.replace(/\d+(?= (?:millièmes|centièmes|dixièmes|unités|dizaines|centaines))/g,String(count)).replace(/millièmes|centièmes|dixièmes|unités|dizaines|centaines/g,unit=>count===1?unit.slice(0,-1):unit);
  return unitQuestion({words:change(original.words),factor:original.factor,missing:change(original.missing),choices:original.choices.map(change)});
}
export function generateQuestions(random=Math.random) {
  const integer=(a,b)=>a+Math.floor(random()*(b-a+1));
  return [integerFamily((integer(0,1)?90:70)+integer(0,9),integer(1,99)),decimalFamily(integer(1,99),integer(1,3)),decompositionQuestion(integer(1,9),integer(1,9),integer(1,2)),fractionQuestion(integer(2,9),integer(1,3)),unitFamily(integer(0,5),integer(1,9))];
}
export default {title:'Remédiation — Évaluations nationales — Série 1 : Compréhension du nombre',shuffle:false,generateQuestions,questions:generateQuestions()};
