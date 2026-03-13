import { HISTORY_KEY, divisions } from "../utils.js";
import { responses } from "../navigation.js";
import { setParticipantName } from "../state.js";

export function hydrateFromStorage() {
    try {
      // Tenta carregar dos dados completos primeiro
      let raw = localStorage.getItem(HISTORY_KEY + "_data");
      
      if (!raw) {
        // Fallback para formato antigo
        raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return false;
      }
  
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // Se era só uma string (hash antigo), não dá pra hidratar respostas.
        return false;
      }
  
      // Se veio no formato novo { hash, name, responses... }
      if (data && typeof data === "object") {
        // restaura dados do participante (se existirem)
        if (typeof data.name === "string") {
          setParticipantName(data.name);
        }
  
        // restaura responses (matriz 12x8)
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
  
        // fallback: se não tiver responses mas tiver compactAnswers ou answers
        const compactData = data.compactAnswers || data.answers;
        if (compactData && typeof compactData === "object") {
          // zera tudo
          for (let di = 0; di < responses.length; di++) {
            for (let ii = 0; ii < responses[di].length; ii++) {
              responses[di][ii] = 0;
            }
          }
  
          Object.keys(compactData).forEach((divIdStr) => {
            const divId = parseInt(divIdStr, 10);
            if (!Number.isFinite(divId)) return;
            const di = divisions.findIndex((d) => d.id === divId);
            if (di === -1) return;
  
            const map = compactData[divIdStr];
            if (!map || typeof map !== "object") return;
  
            [1, 2, 3].forEach((score) => {
              const qNum = map[String(score)] ?? map[score];
              const idx = parseInt(qNum, 10) - 1; // 1..8 -> 0..7
              if (idx >= 0 && idx < 8) responses[di][idx] = score;
            });
          });
  
          return true;
        }
      }
  
      return false;
    } catch (e) {
      console.error("Erro ao restaurar dados:", e);
      return false;
    }
  }
