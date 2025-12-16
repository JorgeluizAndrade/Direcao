import { buildCompactAnswers } from "./logic/buildCompactAnswers.js";
import { responses } from "./navigation.js";
import { HISTORY_KEY, toBase64 } from "./utils.js";

let participantName = ""; 

export function saveSnapshot() {
    // 2) resumo compacto das respostas
    const compactAnswers = buildCompactAnswers();
  
    const payload = {
      name: participantName.trim(),
      responses,
      answers: compactAnswers,
      savedAt: new Date().toISOString(),
    };
  
    const hashSource = JSON.stringify({
      name: participantName.trim(),
      answers: compactAnswers,
    });
  
    const currentHash = toBase64(hashSource);
    let lastHash = null;
    try {
      lastHash = localStorage.getItem(HISTORY_KEY);
    } catch (e) {
      // se der erro no localStorage, só ignora
    }
  
    // se for igual ao último salvo, não precisa enviar de novo
    if (lastHash === currentHash) {
      alert("Este resultado já foi enviado anteriormente.");
      return;
    }
  
    try {
      localStorage.setItem(HISTORY_KEY, currentHash);
      localStorage.setItem(HISTORY_KEY + "_data", JSON.stringify(payload));
      alert("Resultado salvo com sucesso!");
    } catch (e) {
      alert("Erro ao salvar no navegador.");
    }
  }