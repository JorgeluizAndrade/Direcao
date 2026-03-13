import { divisions } from "./utils.js";
import { setCurrentStep } from "./state.js";

let renderFn = () => {};

export function setNavigationRender(fn) {
  renderFn = fn;
}

export function goToDivision(divisionIndex) {
  if (divisionIndex < 0 || divisionIndex >= divisions.length) return;
  setCurrentStep(divisionIndex);
  renderFn();
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
        "Você só pode escolher até 3 frases em cada bloco."
      );
      return;
    }

    // b) Cada valor só pode ser usado uma vez por divisão
    const valueAlreadyUsed = divisionResponses.some(
      (v, idx) => idx !== itemIndex && v === newVal
    );
    if (valueAlreadyUsed) {
      alert(
        "Cada pontuação (1, 2 e 3) só pode ser usada uma vez por bloco."
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
