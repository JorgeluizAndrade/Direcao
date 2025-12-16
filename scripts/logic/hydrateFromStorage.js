import { HISTORY_KEY } from "../utils.js";

import { responses } from "../navigation.js"

let participantName = "";


export function hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return false;
  
      // Pode ser JSON (novo) ou string (antigo). Vamos tentar JSON.
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // Se era só uma string (hash antigo), não dá pra hidratar respostas.
        return false;
      }
  
      // Se veio no formato novo { hash, name, email, ministerio, responses... }
      if (data && typeof data === "object") {
        // restaura dados do participante (se existirem)
        if (typeof data.name === "string") participantName = data.name;
  
        // restaura responses (matriz 12x9)
        if (Array.isArray(data.responses)) {
          data.responses.forEach((div, di) => {
            if (!Array.isArray(div) || !responses[di]) return;
            div.forEach((val, ii) => {
              const n = parseInt(val, 10);
              responses[di][ii] = Number.isFinite(n) ? n : 0;
            });
          });
          return true;
        }
  
        // fallback: se não tiver responses mas tiver compactAnswers
        // (aqui dá pra reconstituir a matriz)
        if (data.compactAnswers && typeof data.compactAnswers === "object") {
          // zera tudo
          for (let di = 0; di < responses.length; di++) {
            for (let ii = 0; ii < responses[di].length; ii++) {
              responses[di][ii] = 0;
            }
          }
  
          Object.keys(data.compactAnswers).forEach((divIdStr) => {
            const divId = parseInt(divIdStr, 10);
            if (!Number.isFinite(divId)) return;
            const di = divisions.findIndex((d) => d.id === divId);
            if (di === -1) return;
  
            const map = data.compactAnswers[divIdStr];
            if (!map || typeof map !== "object") return;
  
            [1, 2, 3].forEach((score) => {
              const qNum = map[String(score)] ?? map[score];
              const idx = parseInt(qNum, 10) - 1; // 1..9 -> 0..8
              if (idx >= 0 && idx < 9) responses[di][idx] = score;
            });
          });
  
          return true;
        }
      }
  
      return false;
    } catch (e) {
      return false;
    }
  }