import { hydrateFromStorage } from "./logic/hydrateFromStorage.js";
import { divisions, areas, youtubeLink, googleLink, tiktokLink, toBase64, HISTORY_KEY } from "./utils.js";
import { setAnswer, computeTotals, goToDivision, responses } from "./navigation.js";
import { buildCompactAnswers } from "./logic/buildCompactAnswers.js";
import { saveSnapshot } from "./saveSnapshot.js";
import { currentStep, setCurrentStep } from "./state.js";


let participantName = "";
let isSending = false;

const appRoot = document.getElementById("app");
let render = () => {};
export function setRender(fn) {
  render = fn;
}


export function renderIntroScreen() {
    const container = document.createElement("div");
    const tools = document.createElement("div");
    tools.className = "tools";
    tools.innerHTML += `
        <div class="circle">
        <span class="red box"></span>
      </div>
      <div class="circle">
        <span class="yellow box"></span>
      </div>
      <div class="circle">
        <span class="green box"></span>
      </div>
    `;
  
    container.appendChild(tools);
  
    const title = document.createElement("h1");
    title.textContent = "Direção - Indicador de Vocação Profissional";
    container.appendChild(title);
  
    const description = document.createElement("p");
    description.textContent =
      "Este questionário serve para revelar áreas profissionais que combinam com quem você é de forma natural. Ele não define o seu destino, mas oferece direção para que você faça escolhas mais conscientes sobre o seu futuro.";
    container.appendChild(description);
  
    const small = document.createElement("p");
    small.className = "small";
    small.textContent =
      "Você verá 12 blocos de afirmações. Em cada bloco, escolha até 3 frases que mais combinam com você e atribua pontos (3, 2 e 1) de acordo com a intensidade.";
    container.appendChild(small);
  
    const nameField = document.createElement("div");
    nameField.className = "field";
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Nome completo";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = participantName;
    nameInput.placeholder = "Seu nome";
    nameInput.oninput = (e) => {
      participantName = e.target.value;
    };
    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);
    container.appendChild(nameField);
  
    const helper = document.createElement("p");
    helper.className = "small";
    helper.textContent =
      "Seus dados ajudarão a personalizar o seu resultado. Eles serão salvos no seu próprio navegador.";
    container.appendChild(helper);
  
    const buttons = document.createElement("div");
    buttons.className = "buttons-row";
    // Verifica se existe resultado salvo no localStorage
    let hasStoredResult = false;
    try {
      hasStoredResult = !!localStorage.getItem(HISTORY_KEY);
    } catch (e) {
      hasStoredResult = false;
    }
  
    // Botão "Ver último resultado", só aparece se houver algo salvo
    if (hasStoredResult) {
      const viewResultButton = document.createElement("button");
      viewResultButton.className = "secondary";
      viewResultButton.textContent = "Ver último resultado";
      viewResultButton.onclick = () => {
        const restored = hydrateFromStorage();
        setCurrentStep(divisions.length); // vai direto para o resumo
        render();
      };
      buttons.appendChild(viewResultButton);
    }
    const startButton = document.createElement("button");
    startButton.className = "primary";
    startButton.textContent = "Começar";
    startButton.onclick = () => {
      setCurrentStep(0);
      render();
    };
  
    buttons.appendChild(startButton);
    container.appendChild(buttons);
  
    appRoot.appendChild(container);
  }



export function renderDivisionScreen() {
  const divisionIndex = currentStep;
  const division = divisions[divisionIndex];
  const totalDivisions = divisions.length;
  const questionsInDivision = 8;

  const container = document.createElement("div");

  // ===== HEADER: SEGMENTOS DAS 12 DIVISÕES =====
  const progressBox = document.createElement("div");
  progressBox.className = "section-box section-progress";

  // Quantidade de frases já pontuadas por divisão
  const divisionUsedCounts = divisions.map((div, idx) => {
    return responses[idx].filter((v) => v > 0).length;
  });

  const segmentsRow = document.createElement("div");
  segmentsRow.className = "divisions-progress";

  divisions.forEach((div, idx) => {
    const seg = document.createElement("button");
    seg.type = "button";
    seg.className = "division-segment";

    const usedCount = divisionUsedCounts[idx];

    if (idx === divisionIndex) {
      seg.classList.add("current");
    } else if (usedCount === 3) {
      seg.classList.add("completed");
    }

    const squares = document.createElement("div");
    squares.className = "segment-squares";

    for (let k = 1; k <= 3; k++) {
      const sq = document.createElement("div");
      sq.className = "segment-square";
      if (usedCount >= k) sq.classList.add("filled");
      squares.appendChild(sq);
    }

    const label = document.createElement("div");
    label.className = "segment-label";
    label.textContent = String(div.id);

    seg.appendChild(squares);
    seg.appendChild(label);

    seg.onclick = () => goToDivision(idx);

    segmentsRow.appendChild(seg);
  });

  progressBox.appendChild(segmentsRow);

  const progressText = document.createElement("div");
  progressText.className = "progress-text";

  const left = document.createElement("span");
  left.textContent = `Bloco ${division.id} de ${totalDivisions}`;

  const right = document.createElement("span");
  right.innerHTML = `${questionsInDivision} opções neste bloco`;

  progressText.appendChild(left);
  progressText.appendChild(right);
  progressBox.appendChild(progressText);

  container.appendChild(progressBox);

  // ===== BOX: TÍTULO / INSTRUÇÕES DA DIVISÃO =====
  const divisionBox = document.createElement("div");
  divisionBox.className = "section-box";

  const title = document.createElement("h2");
  title.textContent = `Bloco ${division.id} – Avaliação de Perfil`;
  divisionBox.appendChild(title);

  const divisionLabel = document.createElement("div");
  divisionLabel.className = "small";
  divisionLabel.textContent =
    "Escolha até 3 frases que mais descrevem você e arraste as fichas 3, 2 e 1 para elas (3 = a que mais te descreve). ";
  divisionBox.appendChild(divisionLabel);

  const divResponses = responses[divisionIndex];
  const usedValues = [1, 2, 3]
    .map((v) => ({ v, used: divResponses.includes(v) }))
    .filter((x) => x.used)
    .map((x) => x.v)
    .join(", ");
  const nonZeroCount = divResponses.filter((v) => v > 0).length;

  const divisionInfo = document.createElement("div");
  divisionInfo.className = "small";
  divisionInfo.textContent =
    `Neste bloco você já usou ${nonZeroCount} de 3 possíveis frases ` +
    `(pontos utilizados: ${usedValues || "nenhum ainda"}).`;
  divisionBox.appendChild(divisionInfo);


  const divisionInfoCelular = document.createElement("div");
  divisionInfo.className = "small";
  divisionInfo.innerHTML = "<span class='small-destaque'>Para celulares, basta apenas precionar e arrastar para a frase. </span>"

  divisionBox.appendChild(divisionInfoCelular);



  container.appendChild(divisionBox);

  // ===== LISTA COM AS 8 PERGUNTAS =====
  const questionsBox = document.createElement("div");
  questionsBox.className = "section-box content-row";

  const questionsList = document.createElement("div");
  questionsList.className = "question-list";

  division.items.forEach((item, idx) => {
    const val = responses[divisionIndex][idx] || 0;

    const card = document.createElement("div");
    card.className = "question-card";
    if (val === 1) card.classList.add("score-1");
    if (val === 2) card.classList.add("score-2");
    if (val === 3) card.classList.add("score-3");

    const header = document.createElement("div");
    header.className = "question-header";

    const leftLabel = document.createElement("span");
    leftLabel.textContent = `Frase ${idx + 1}`;

    const scorePill = document.createElement("span");
    scorePill.className = "question-score-pill";
    scorePill.textContent = val > 0 ? `${val} pts` : "sem pontuação";

    header.appendChild(leftLabel);
    header.appendChild(scorePill);

    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent = item.text;

    card.appendChild(header);
    card.appendChild(text);

    // Drag & Drop – área de drop
    card.ondragover = (e) => {
      e.preventDefault();
      card.classList.add("drop-target");
    };
    card.ondragleave = () => {
      card.classList.remove("drop-target");
    };
    card.ondrop = (e) => {
      e.preventDefault();
      card.classList.remove("drop-target");
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }
      if (data.divisionIndex !== divisionIndex) return;
      const value = parseInt(data.value, 10);
      if (![1, 2, 3].includes(value)) return;
      setAnswer(divisionIndex, idx, value);
      render();
    };

    questionsList.appendChild(card);
  });

  questionsBox.appendChild(questionsList);
  container.appendChild(questionsBox);

  // ===== FOOTER: FICHAS 3, 2, 1 =====
  const footer = document.createElement("div");
  footer.className = "footer-row section-box";

  const scoreRow = document.createElement("div");
  scoreRow.className = "score-row";

  // Descobre, para esta divisão, em qual frase cada valor está
  function findItemIndexForValue(val) {
    return divResponses.findIndex((v) => v === val);
  }

  [3, 2, 1].forEach((val) => {
    const assignedIndex = findItemIndexForValue(val);
    const slot = document.createElement("div");
    slot.className = "score-slot score-" + val;

    const valueSpan = document.createElement("span");
    valueSpan.className = "score-value";
    valueSpan.textContent = `${val} pts`;

    slot.appendChild(valueSpan);

    if (assignedIndex === -1) {
      // livre – pode arrastar
      slot.classList.add("available");
      const hint = document.createElement("span");
      hint.className = "score-hint";
      hint.textContent = "Arraste para uma frase";
      slot.appendChild(hint);

      slot.draggable = true;
      slot.ondragstart = (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ divisionIndex, value: val })
        );
      };
    } else {
      // já atribuído – mostra a frase e botão de limpar
      slot.classList.add("assigned");

      const qSpan = document.createElement("span");
      qSpan.className = "score-question";
      qSpan.textContent = `Frase ${assignedIndex + 1}`;

      const clearBtn = document.createElement("button");
      clearBtn.className = "score-clear";
      clearBtn.textContent = "×";
      clearBtn.title = "Remover pontuação desta frase";
      clearBtn.onclick = () => {
        setAnswer(divisionIndex, assignedIndex, 0);
        render();
      };

      slot.appendChild(qSpan);
      slot.appendChild(clearBtn);
    }

    scoreRow.appendChild(slot);
  });

  footer.appendChild(scoreRow);

  const footerInfo = document.createElement("p");
  footerInfo.className = "small";
  footerInfo.textContent =
    "Você pode usar cada ficha (3, 2 e 1) apenas uma vez por bloco. Para mudar, remova com o X e arraste novamente.";
  footer.appendChild(footerInfo);

  const buttons = document.createElement("div");
  buttons.className = "buttons-row";

  const nextButton = document.createElement("button");
  nextButton.className = "primary";
  nextButton.textContent =
    divisionIndex === divisions.length - 1
      ? "Ver resultado"
      : "Finalizar bloco e avançar";

  nextButton.onclick = () => {
    if (divisionIndex < divisions.length - 1) {
      setCurrentStep(divisionIndex + 1);
    } else {
      setCurrentStep(divisions.length);  // resumo
    }
    render();
  };

  buttons.appendChild(nextButton);
  footer.appendChild(buttons);

  container.appendChild(footer);

  appRoot.appendChild(container);
}

export function renderSummaryScreen() {
  const totals = computeTotals();
  const sortedAreas = areas
    .slice()
    .sort((a, b) => totals[b.letter] - totals[a.letter]);

  const maxValue = Math.max(1, ...Object.values(totals));

  // Lógica de Hash e LocalStorage (Mantida igual)
  const compactAnswers = buildCompactAnswers();
  const hashSource = JSON.stringify({
    name: participantName.trim(),
    answers: compactAnswers,
  });
  
  // Função toBase64 deve estar acessível no seu escopo
  const currentHash = toBase64(hashSource);

  let lastHash = null;
  try {
    lastHash = localStorage.getItem(HISTORY_KEY);
  } catch (e) {
    // ignora erro
  }

  // --- INÍCIO DA CRIAÇÃO DO CONTAINER ---
  const container = document.createElement("div");
  // Adicionei a classe app-container aqui caso ela seja criada dinamicamente, 
  // ou garanta que o CSS aplique ao pai se o container for filho.
  // Se o seu 'appRoot' já é o container, ok. Se não, adicione a classe:
  // container.className = "app-container"; 

  const title = document.createElement("h2");
  title.textContent = "Resultado Geral";
  container.appendChild(title);

  const intro = document.createElement("p");
  intro.textContent =
    "Este gráfico mostra a soma dos pontos em cada área, com base nas suas respostas. Os maiores valores indicam as áreas onde você demonstra maior afinidade e potencial natural.";
  container.appendChild(intro);

  const participantInfo = document.createElement("p");
  participantInfo.className = "small";
  participantInfo.textContent = `Participante: ${participantName}`;
  container.appendChild(participantInfo);

  // --- BOX DE TOP 3 ÁREAS ---
  const topAreasBox = document.createElement("div");
  topAreasBox.className = "top-areas";
  const topTitle = document.createElement("strong");
  topTitle.textContent = "Suas 3 áreas de maior afinidade (pelo questionário):";
  topAreasBox.appendChild(topTitle);

  sortedAreas.slice(0, 3).forEach((g, idx) => {
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = `${idx + 1}º: ${g.name} (Grupo ${g.letter}) – ${
      totals[g.letter]
    } pts`;
    topAreasBox.appendChild(badge);
  });
  container.appendChild(topAreasBox);

  // --- TABELA DE DADOS ---
  const table = document.createElement("table");
  table.className = "summary-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Área", "Grupo", "Total"].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  areas.forEach((g) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = g.name;
    const tdLetter = document.createElement("td");
    tdLetter.textContent = g.letter;
    const tdTotal = document.createElement("td");
    tdTotal.textContent = String(totals[g.letter]);
    tr.appendChild(tdName);
    tr.appendChild(tdLetter);
    tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // --- GRÁFICO DE BARRAS ---
  areas.forEach((g) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    const left = document.createElement("span");
    left.textContent = `${g.name} (${g.letter})`;
    const right = document.createElement("span");
    right.textContent = `${totals[g.letter]} pts`;
    label.appendChild(left);
    label.appendChild(right);

    const bar = document.createElement("div");
    bar.className = "bar";
    const inner = document.createElement("div");
    inner.className = "bar-inner";
    inner.style.width = ((totals[g.letter] / maxValue) * 100).toFixed(1) + "%";
    bar.appendChild(inner);

    row.appendChild(label);
    row.appendChild(bar);
    container.appendChild(row);
  });

  const note = document.createElement("p");
  note.className = "small";
  note.textContent =
    "Lembre-se: este teste é apenas uma ferramenta de autoconhecimento. Pesquise sobre as profissões, converse com professores ou profissionais da área e observe quais atividades te trazem mais satisfação no dia a dia.";
  container.appendChild(note);

  // --- SEÇÃO "E AGORA?" ---
  // AQUI FOI A MUDANÇA PRINCIPAL: Usando 'container.appendChild' em vez de 'appRoot.appendChild'
  
  const sorted = areas
    .slice()
    .sort((a, b) => totals[b.letter] - totals[a.letter]);

  const titleEagr = document.createElement("h2"); // Mudei de h1 para h2 para manter hierarquia visual dentro do box
  titleEagr.className = "titleEagr";
  titleEagr.textContent = "E agora?";
  container.appendChild(titleEagr); // Mudado de appRoot para container

  // Box Principal
  const main = document.createElement("div");
  main.className = "result-area";
  main.innerHTML = `<strong>Área principal:</strong> ${sorted[0].name}`;
  
  // Wrapper para botões ficarem organizados
  main.innerHTML += `<div style="margin-top:8px">`;
  main.innerHTML += `<a class='link-btn' href='${youtubeLink(sorted[0].name)}' target='_blank'>YouTube</a>`;
  main.innerHTML += `<a class='link-btn' href='${googleLink(sorted[0].name)}' target='_blank'>Google</a>`;
  main.innerHTML += `<a class='link-btn' href='${tiktokLink(sorted[0].name)}' target='_blank'>TikTok</a>`;
  main.innerHTML += `</div>`;
  
  container.appendChild(main); // Mudado de appRoot para container

  // Box Secundário
  const sec = document.createElement("div");
  sec.className = "box-sec";
  sec.innerHTML = `<strong>Área secundária:</strong> ${sorted[1].name}`;
  
  // Wrapper para botões
  sec.innerHTML += `<div style="margin-top:8px">`;
  sec.innerHTML += `<a class='link-btn' href='${youtubeLink(sorted[1].name)}' target='_blank'>YouTube</a>`;
  sec.innerHTML += `<a class='link-btn' href='${googleLink(sorted[1].name)}' target='_blank'>Google</a>`;
  sec.innerHTML += `<a class='link-btn' href='${tiktokLink(sorted[1].name)}' target='_blank'>TikTok</a>`;
  sec.innerHTML += `</div>`;

  container.appendChild(sec); // Mudado de appRoot para container

  const noteAgr = document.createElement("p");
  noteAgr.className = "small-destaque"; // Usei sua classe nova
  noteAgr.style.textAlign = "center";
  noteAgr.style.marginTop = "15px";
  noteAgr.textContent = "Explore com calma. Clareza vem da prática, não de um teste.";
  container.appendChild(noteAgr); // Mudado de appRoot para container

  // --- BOTÕES DE AÇÃO ---
  const buttons = document.createElement("div");
  buttons.className = "buttons-row";

  const backButton = document.createElement("button");
  backButton.className = "secondary";
  backButton.textContent = "Voltar";
  backButton.onclick = () => {
    // Certifique-se que setCurrentStep e divisions estão no escopo
    if (typeof setCurrentStep === 'function') {
        setCurrentStep(divisions.length - 1); 
        render();
    } else {
        // Fallback caso setCurrentStep não esteja global
        console.error("Função de navegação não encontrada");
    }
  };
  buttons.appendChild(backButton);

  const saveButton = document.createElement("button");
  saveButton.className = "primary";
  saveButton.textContent = isSending ? "Salvando..." : "Salvar Resultado";
  saveButton.disabled = isSending;
  saveButton.onclick = () => {
    saveSnapshot();
  };
  buttons.appendChild(saveButton);

  container.appendChild(buttons);

  // Finalmente, limpa o appRoot e adiciona o container único
  // Certifique-se de que appRoot está definido
  if(typeof appRoot !== 'undefined') {
      appRoot.innerHTML = ""; 
      appRoot.appendChild(container);
  }
}