import { divisions } from "./utils.js";


export function goToDivision(divisionIndex) {
  if (divisionIndex < 0 || divisionIndex >= divisions.length) return;
  currentStep = divisionIndex;
  render();
}


// Respostas: [divisão][item] = 0,1,2,3
export const responses = Array.from({ length: divisions.length }, () =>
  Array(8).fill(0)
);
// ===== FUNÇÕES DE VALIDAÇÃO / CÁLCULO =====




export function setAnswer(divisionIndex, itemIndex, newVal) {
  newVal = parseInt(newVal, 10);
  if (isNaN(newVal)) newVal = 0;

  const divisionResponses = responses[divisionIndex];
  const oldVal = divisionResponses[itemIndex] || 0;
  if (newVal === oldVal) return;

  if (newVal !== 0) {
    // a) Máximo 3 respostas não-zero por divisão
    const nonZeroCount = divisionResponses.reduce((acc, v, idx) => {
      if (idx === itemIndex) return acc;
      return acc + (v > 0 ? 1 : 0);
    }, 0);
    if (nonZeroCount + 1 > 3) {
      alert(
        "Você só pode marcar até 3 frases com valor 1, 2 ou 3 em cada divisão."
      );
      return;
    }

    // b) Cada valor só pode ser usado uma vez por divisão
    const valueAlreadyUsed = divisionResponses.some(
      (v, idx) => idx !== itemIndex && v === newVal
    );
    if (valueAlreadyUsed) {
      alert(
        "Em cada divisão, cada valor (1, 2 e 3) só pode ser usado uma vez."
      );
      return;
    }
  }

  divisionResponses[itemIndex] = newVal;
}

export function computeTotals() {
  const totalsByLetter = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
  };

  divisions.forEach((div, di) => {
    div.items.forEach((item, ii) => {
      const val = responses[di][ii] || 0;
      totalsByLetter[item.letter] += val;
    });
  });

  return totalsByLetter;
}