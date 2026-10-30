import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswerSmart } from '../core/correcteur.js';
import { evaluateCurrentAnswer, getCorrectQCMAnswer } from '../core/answerEvaluation.js';

const check = (userInput, expected = '1/2') => checkAnswerSmart({ userInput, validAnswers: [expected], answerRule: { type: 'probability' } }).correct;
test('probabilité : fractions, décimaux français et pourcentages exacts', () => {
  for (const s of ['3/6','1/2','6/12','0,5','0.5','0,50','50%','50 %',String.raw`\dfrac{3}{6}`,String.raw`\(\frac{1}{2}\)`,'-1/-2','500000000000000000000/1000000000000000000000']) assert.equal(check(s), true, s);
});
test('probabilité : valeurs fausses, expressions, unités, vides et dénominateur nul', () => {
  for (const s of ['3/2','0,3','3','1/0','0/0','1/-2','-0,5','101%','0.5 m','1/4+1/4','(1/2)','2*0.25','0.5foo','1//2','50%%','',' ',null,undefined,'5*10^-1','10^-1+0.4']) assert.equal(check(s), false, String(s));
});
test('probabilité : comparaison exacte au-delà de la précision flottante', () => {
  for (const s of ['0.5000000001','0.499999999999999999999999999999999999','0.500000000000000000000000000000000001','50.00000000000000000000000000000001%','500000000000000000001/1000000000000000000000']) assert.equal(check(s), false, s);
  assert.equal(check('0.333333333333333333333333333333333333', '1/3'), false);
  assert.equal(check('2/6','1/3'), true);
});
test('probabilité : bornes 0 et 1 exactes et contrôle des réponses configurées', () => {
  for (const s of ['0','0/5','0%','-0']) assert.equal(check(s,'0'), true);
  for (const s of ['1','5/5','100%','1,00']) assert.equal(check(s,'1'), true);
  for (const [s,e] of [['-0.00000000000000000000000001','0'],['0.00000000000000000000000001','0'],['1.00000000000000000000000001','1'],['0.99999999999999999999999999','1'],['-1','-1'],['2','2']]) assert.equal(check(s,e),false,s);
});
test('probabilité : distribution QCM ne retombe pas sur la tolérance générale', () => {
  const question = {answers:['1/2'],answerRule:{type:'probability'},possible_answers:['0.5000000001',String.raw`\(\dfrac{3}{6}\)`,'3/2','3']};
  assert.equal(getCorrectQCMAnswer({question}),question.possible_answers[1]);
  for (const [i,choice] of question.possible_answers.entries()) assert.equal(evaluateCurrentAnswer({question,answerMode:'qcm',selectedQCMAnswer:choice}).isCorrect,i===1);
});
