import { buildCompactAnswers } from "./logic/buildCompactAnswers.js";
import { responses } from "./navigation.js";
import { HISTORY_KEY, toBase64 } from "./utils.js";
import { participantName } from "./state.js";

export function saveSnapshot() {
    // Resumo compacto das respostas
    const compactAnswers = buildCompactAnswers();
  
    const payload = {
      name: participantName.trim(),
      responses: responses.map(r => [...r]), // deep copy
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
  
    // se for igual ao último salvo, não precisa salvar de novo
    if (lastHash === currentHash) {
      alert("Este resultado já foi salvo anteriormente.");
      return;
    }
  
    try {
      localStorage.setItem(HISTORY_KEY, currentHash);
      localStorage.setItem(HISTORY_KEY + "_data", JSON.stringify(payload));
      alert("Resultado salvo com sucesso! Você pode acessá-lo novamente na tela inicial.");
    } catch (e) {
      alert("Erro ao salvar no navegador. Verifique se o armazenamento local está habilitado.");
    }
  }
