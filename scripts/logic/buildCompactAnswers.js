import { responses } from "../navigation.js";
import { divisions } from "../utils.js";

export function buildCompactAnswers() {
  const compact = {};

  divisions.forEach((div, di) => {
    const divMap = {};
    // queremos saber em qual pergunta dessa divisão está o 3, o 2 e o 1
    [3, 2, 1].forEach((val) => {
      const idx = responses[di].findIndex((v) => v === val);
      if (idx !== -1) {
        // pergunta numerada de 1 a 9 dentro da divisão
        divMap[val] = idx + 1;
      }
    });
    compact[div.id] = divMap;
  });

  return compact;
}