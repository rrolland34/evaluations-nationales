import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCalculationExpression as validate } from '../core/validators/calculationExpressionValidator.js';
import { checkAnswerSmart } from '../core/correcteur.js';
import { evaluateCurrentAnswer, getCorrectQCMAnswer } from '../core/answerEvaluation.js';

const equivalences = {
  associativeAddition: true, commutativeAddition: true,
  associativeMultiplication: true, commutativeMultiplication: true
};
const scenarios = [
  {
    name: 'moyenne', patterns: ['(11+10+16+9+20)/5'],
    good: ['(11+10+16+9+20)/5', '(20+16+11+10+9)/5', '(20+9+(16+10)+11)/5',
      '(11+10+16+9+20)÷5', '((11+10+16+9+20))/(5)',
      String.raw`(11+10+16+9+20)\div5`, String.raw`\(\dfrac{11+10+16+9+20}{5}\)`],
    bad: ['13,2', '11+10+16+9+20/5', '(11+10+16+9+20)/4', '(11+10+16+9)/5',
      '(12+10+16+9+19)/5', '66/5', '(11+10+16+9+20)/5+0']
  },
  {
    name: 'carrelage', patterns: ['(90*80)/(10*10)', '(90/10)*(80/10)'],
    good: ['(90*80)/(10*10)', '(90×80)/(10×10)', '(90/10)*(80/10)', '(80/10)*(90/10)',
      String.raw`\frac{90\times80}{10\times10}`],
    bad: ['72', '70+2', '72*1', '90*80/10*10', '7200/100', '9*8']
  },
  {
    name: 'augmentation', patterns: ['20+20*40/100', '20*(1+40/100)', '20*1.4', '20+20*0.4'],
    good: ['20+20*40/100', '20*(1+40/100)', '20*1,4', '20*1.4', '20+20*0,4',
      ' 20\u00a0×\u202f1,4 ', String.raw`20\times1{,}4`],
    bad: ['28', '30-2', '7*4', '20+8']
  }
];
const rule = scenario => ({ type: 'calculationExpression', patterns: scenario.patterns, equivalences, allowNumberOnly: false });

for (const scenario of scenarios) {
  test(`${scenario.name}: exemples unitaires et correcteur réel`, () => {
    const answerRule = rule(scenario);
    for (const [values, expected] of [[scenario.good, true], [scenario.bad, false]]) {
      for (const userInput of values) {
        assert.equal(validate({ ...answerRule, userInput }).valid, expected, userInput);
        assert.equal(checkAnswerSmart({ userInput, validAnswers: scenario.patterns, answerRule }).correct, expected, userInput);
      }
    }
  });
  test(`${scenario.name}: direct et QCM, un seul choix structurel parmi des valeurs égales`, () => {
    const correct = scenario.good.at(-1);
    const question = { answers: [scenario.patterns[0]], answerRule: rule(scenario),
      possible_answers: [scenario.bad[0], correct, scenario.bad.at(-1), scenario.bad[1]], display_answer: 'Correction' };
    for (const possible_answers of [question.possible_answers, [...question.possible_answers].reverse()]) {
      const q = { ...question, possible_answers };
      assert.equal(getCorrectQCMAnswer({ question: q }), correct);
      const accepted = possible_answers.filter(selectedQCMAnswer =>
        evaluateCurrentAnswer({ question: q, answerMode: 'qcm', selectedQCMAnswer }).isCorrect);
      assert.deepEqual(accepted, [correct]);
      assert.equal(evaluateCurrentAnswer({ question: q, answerMode: 'qcm', selectedQCMAnswer: null }).isCorrect, false);
    }
    for (const value of [...scenario.good, ...scenario.bad]) {
      globalThis.document = { getElementById: () => ({ value }) };
      assert.equal(evaluateCurrentAnswer({ question, answerMode: 'direct' }).isCorrect, scenario.good.includes(value), value);
    }
  });
}

test('paramétrage, répétitions et absence de mutation de la configuration JSON', () => {
  for (const [patterns, good, bad] of [
    [['(7+7+10)/3'], '(10+7+7)/3', '(10+7)/3'],
    [['(7+7+10)/3'], '(7+(10+7))/3', '(8+6+10)/3'],
    [['2*2*3'], '3*(2*2)', '2*3'],
    [['(120*60)/(5*5)'], '(60*120)/(5*5)', '288'],
    [['50*1.2'], '1,2*50', '60']
  ]) {
    const config = JSON.parse(JSON.stringify({ patterns, equivalences }));
    const before = JSON.stringify(config);
    assert.equal(validate({ ...config, userInput: good }).valid, true);
    assert.equal(validate({ ...config, userInput: bad }).valid, false);
    assert.equal(JSON.stringify(config), before);
  }
});

test('associativité et commutativité indépendantes, désactivées par défaut', () => {
  for (const [op, family] of [['+', 'Addition'], ['*', 'Multiplication']]) {
    const check = (pattern, input, options = {}) => validate({ patterns: [pattern], userInput: input, equivalences: options }).valid;
    assert.equal(check(`2${op}3`, `3${op}2`), false);
    assert.equal(check(`2${op}3`, `3${op}2`, { [`commutative${family}`]: true }), true);
    assert.equal(check(`(2${op}3)${op}4`, `2${op}(3${op}4)`), false);
    assert.equal(check(`(2${op}3)${op}4`, `2${op}(3${op}4)`, { [`associative${family}`]: true }), true);
    assert.equal(check(`(2${op}3)${op}4`, `4${op}(3${op}2)`, { [`associative${family}`]: true }), false);
    assert.equal(check(`(2${op}3)${op}4`, `2${op}(3${op}4)`, { [`commutative${family}`]: true }), false);
  }
});

test('soustractions, divisions et signes conservent leur structure', () => {
  for (const [pattern, wrong] of [['8-3','3-8'], ['8/2','2/8'], ['8/(4/2)','8/4/2'],
    ['8-(4-2)','8-4-2'], ['2*(3+4)','2*3+2*4'], ['2+3','+2+3']]) {
    assert.equal(validate({ patterns: [pattern], userInput: wrong, equivalences }).valid, false);
    assert.equal(validate({ patterns: [pattern], userInput: `((${pattern}))`, equivalences }).valid, true);
  }
  assert.equal(validate({ patterns: ['-2+3'], userInput: '(-2)+3' }).valid, true);
});

test('entrées invalides et constructions interdites refusées proprement', () => {
  for (const userInput of ['', ' ', null, undefined, '.', '1..4', '20*', '(2+3', '2+3)',
    NaN, Infinity, 'NaN', 'Infinity', '1/0', '1/(2-2)', '0/0', '2^3', '2²', '2(3+4)',
    'x+2', '20%', '2=2', '2;3', 'Math.random()', {}, [], '9'.repeat(400),
    '('.repeat(200)+'2+3'+')'.repeat(200), '2'.repeat(4097)]) {
    assert.equal(validate({ patterns: ['2+3'], userInput }).errorCode, 'INVALID_CALCULATION_EXPRESSION', String(userInput));
  }
});

test('configuration invalide et modèle invalide ne sont pas ignorés', () => {
  for (const config of [{}, { patterns: [] }, { patterns: '2+3' }, { patterns: ['2+3', '1/0'] },
    { patterns: ['.'] }, { patterns: ['5'] }, { patterns: ['x+2'] },
    { patterns: ['2+3'], equivalences: { commutativeAddition: 'true' } },
    { patterns: ['2+3'], equivalences: null }, { patterns: ['2+3'], equivalences: { unknown: true } },
    { patterns: ['2+3'], allowNumberOnly: 1 }, { patterns: Array(1) }]) {
    assert.equal(validate({ ...config, userInput: '2+3' }).errorCode, 'INVALID_CALCULATION_CONFIGURATION');
  }
});

test('résultats seuls et calculs partiels uniquement par modèle explicite', () => {
  for (const userInput of ['5', '(5)', '+5', '-5']) {
    assert.equal(validate({ patterns: ['2+3'], userInput }).errorCode, 'EXPECTED_CALCULATION');
  }
  assert.equal(validate({ patterns: ['2+3'], allowNumberOnly: true, userInput: '5' }).valid, false);
  assert.equal(validate({ patterns: ['5'], allowNumberOnly: true, userInput: '(5)' }).valid, true);
  assert.equal(validate({ patterns: ['20+20*0.4', '20+8'], userInput: '20+8' }).valid, true);
});

test('priorités qcmAnswerRule/qcmAnswer conservées dans les deux sens', () => {
  const a = { answers: ['2+3'], answerRule: { type: 'calculationExpression', patterns: ['2+3'] },
    qcmAnswer: 'B', qcmAnswerRule: { type: 'symbolicExact' }, possible_answers: ['A', 'B'] };
  assert.equal(getCorrectQCMAnswer({ question: a }), 'B');
  assert.equal(evaluateCurrentAnswer({ question: a, answerMode: 'qcm', selectedQCMAnswer: 'B' }).isCorrect, true);
  const b = { answers: ['5'], answerRule: { type: 'integer' }, qcmAnswer: '2+3',
    qcmAnswerRule: { type: 'calculationExpression', patterns: ['2+3'] }, possible_answers: ['5', '2+3', '1+4'] };
  assert.equal(getCorrectQCMAnswer({ question: b }), '2+3');
  for (const choice of b.possible_answers) assert.equal(evaluateCurrentAnswer({ question: b, answerMode: 'qcm', selectedQCMAnswer: choice }).isCorrect, choice === '2+3');
  globalThis.document = { getElementById: () => ({ value: '5' }) };
  assert.equal(evaluateCurrentAnswer({ question: b, answerMode: 'direct' }).isCorrect, true);
});

test('correcteur : erreurs explicites et contrat answers conservé', () => {
  const answerRule = { type: 'calculationExpression', patterns: ['2+3'] };
  for (const [userInput, code] of [['5','EXPECTED_CALCULATION'], ['2*','INVALID_CALCULATION_EXPRESSION'], ['1+4','WRONG_CALCULATION_STRUCTURE']]) {
    const result = checkAnswerSmart({ userInput, validAnswers: ['2+3'], answerRule });
    assert.equal(result.errorCode, code); assert.ok(result.feedback); assert.equal(result.showCorrectAnswer, true);
  }
  assert.equal(checkAnswerSmart({ userInput: '2+3', validAnswers: [], answerRule }).correct, false);
  assert.equal(checkAnswerSmart({ userInput: '2+3', validAnswers: ['2+3'], answerRule: { ...answerRule, patterns: [] } }).showCorrectAnswer, false);
});

test('règles historiques : algèbre, somme, fraction et produit répété', () => {
  for (const [answerRule, answers, good, bad] of [
    [{ type: 'algebra', form: 'equivalent' }, ['7/12'], '(3+4)/(3*4)', '1/2'],
    [{ type: 'algebra', form: 'developed' }, ['2*(x+3)'], '2*x+6', '2*(x+3)'],
    [{ type: 'algebra', form: 'reduced' }, ['3*x'], '3*x', 'x+2*x'],
    [{ type: 'algebra', form: 'factorized' }, ['2*x+6'], '2*(x+3)', '2*x+6'],
    [{ type: 'sum', terms: [4,8,3,6] }, ['4+8+3+6'], '6+3+8+4', '21'],
    [{ type: 'fraction' }, ['1/2'], '2/4', '0.5'],
    [{ type: 'repeatedProduct', base: 4, exponent: 3 }, ['4*4*4'], '4×4×4', '64']
  ]) {
    assert.equal(checkAnswerSmart({ userInput: good, validAnswers: answers, answerRule }).correct, true, good);
    assert.equal(checkAnswerSmart({ userInput: bad, validAnswers: answers, answerRule }).correct, false, bad);
  }
});
