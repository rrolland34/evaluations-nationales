import remediationSerie6 from '../exercices/remediation_evaluations_nationales_6e_serie_6.js';
import remediationSerie5 from '../exercices/remediation_evaluations_nationales_6e_serie_5.js';
import remediationSerie4 from '../exercices/remediation_evaluations_nationales_6e_serie_4.js';
import remediationSerie3 from '../exercices/remediation_evaluations_nationales_6e_serie_3.js';
import remediationSerie2 from '../exercices/remediation_evaluations_nationales_6e_serie_2.js';
import remediationSerie1 from '../exercices/remediation_evaluations_nationales_6e_serie_1.js';

const exercises = {
  remediation_evaluations_nationales_6e_serie_1: remediationSerie1,
  remediation_evaluations_nationales_6e_serie_2: remediationSerie2,
  remediation_evaluations_nationales_6e_serie_3: remediationSerie3,
  remediation_evaluations_nationales_6e_serie_4: remediationSerie4,
  remediation_evaluations_nationales_6e_serie_5: remediationSerie5,
  remediation_evaluations_nationales_6e_serie_6: remediationSerie6
};

export function loadExercise(exerciseName) {
  return exercises[exerciseName] ?? remediationSerie1;
}

export function getExerciseTitle(
  exerciseName
) {
  return (
    exercises[exerciseName]?.title
    ?? "Exercice"
  );
}

