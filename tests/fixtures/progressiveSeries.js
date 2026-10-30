export default {
  title: "Banc d’essai — Corrections progressives",
  correctionMode: "progressive",
  shuffle: false,
  questions: [
    {
      id: "progressive", question: String.raw`\(\text{Calculer }3\times(2+4).\)`,
      answers: ["18"], possible_answers: ["18", "10", "24", "14"],
      answerRule: { type: "integer" }, display_answer: String.raw`\(18\)`,
      progressiveCorrection: { kind: "steps", steps: [
        { html: "On commence par le calcul entre parenthèses." },
        { html: String.raw`\(2+4=6\)` },
        { html: String.raw`\(3\times6=18\)` }
      ] }
    },
    {
      id: "classic", question: String.raw`\(\text{Calculer }5+2.\)`,
      answers: ["7"], possible_answers: ["7", "3", "10", "12"],
      answerRule: { type: "integer" }, display_answer: String.raw`\(5+2=7\)`
    },
    {
      id: "unanswered", question: String.raw`\(\text{Calculer }20\div4.\)`,
      answers: ["5"], possible_answers: ["5", "4", "16", "80"],
      answerRule: { type: "integer" }, display_answer: String.raw`\(5\)`,
      progressiveCorrection: { kind: "steps", steps: [
        { html: "On cherche combien de groupes de quatre forment vingt." },
        { html: String.raw`\(4\times5=20\)` },
        { html: String.raw`\(20\div4=5\)` }
      ] }
    },
    {
      id: "invalid", question: String.raw`\(\text{Calculer }6+3.\)`,
      answers: ["9"], possible_answers: ["9", "3", "18", "12"],
      answerRule: { type: "integer" }, display_answer: String.raw`\(6+3=9\)`,
      progressiveCorrection: { kind: "steps", steps: [] }
    },
    {
      id: "last", question: String.raw`\(\text{Calculer }2^3.\)`,
      answers: ["8"], possible_answers: ["8", "6", "9", "5"],
      answerRule: { type: "integer" }, display_answer: String.raw`\(8\)`,
      progressiveCorrection: { kind: "steps", steps: [
        { html: String.raw`\(2^3=2\times2\times2\)` },
        { html: String.raw`\(2^3=8\)` }
      ] }
    }
  ]
};
