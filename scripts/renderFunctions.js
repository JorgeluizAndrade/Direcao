import { hydrateFromStorage } from "./logic/hydrateFromStorage.js";
import { divisions, areas, youtubeLink, googleLink, tiktokLink, toBase64, HISTORY_KEY } from "./utils.js";
import { setAnswer, computeTotals, goToDivision, responses, setNavigationRender } from "./navigation.js";
import { buildCompactAnswers } from "./logic/buildCompactAnswers.js";
import { saveSnapshot } from "./saveSnapshot.js";
import { currentStep, setCurrentStep, participantName, setParticipantName } from "./state.js";


let isSending = false;

const appRoot = document.getElementById("app");
let render = () => {};
export function setRender(fn) {
  render = fn;
  setNavigationRender(fn);
}

// SVG Icons
const icons = {
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  google: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 9.19L2 12l7.19 2.81L12 22l2.81-7.19L22 12l-7.19-2.81L12 2z"/></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`
};

export function renderIntroScreen() {
    const container = document.createElement("div");
    container.setAttribute("role", "main");
    
    const tools = document.createElement("div");
    tools.className = "tools";
    tools.setAttribute("aria-hidden", "true");
    tools.innerHTML = `
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
    title.textContent = "Descubra sua Direção Profissional";
    container.appendChild(title);
  
    const description = document.createElement("p");
    description.textContent =
      "Este questionário foi criado para te ajudar a descobrir áreas profissionais que combinam naturalmente com quem você é. Não é um teste definitivo, mas uma bússola para te guiar em escolhas mais conscientes sobre seu futuro.";
    container.appendChild(description);
  
    const small = document.createElement("p");
    small.className = "small";
    small.innerHTML = `
      <strong>Como funciona:</strong> São 12 blocos de afirmações. Em cada bloco, escolha até 3 frases que mais combinam com você e atribua pontos (3, 2 e 1) de acordo com a intensidade.
    `;
    container.appendChild(small);
  
    const nameField = document.createElement("div");
    nameField.className = "field";
    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "name-input");
    nameLabel.textContent = "Como podemos te chamar?";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name-input";
    nameInput.value = participantName;
    nameInput.placeholder = "Digite seu nome";
    nameInput.setAttribute("autocomplete", "name");
    nameInput.oninput = (e) => {
      setParticipantName(e.target.value);
    };
    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);
    container.appendChild(nameField);
  
    const helper = document.createElement("p");
    helper.className = "small";
    helper.textContent =
      "Seus dados ficam salvos apenas no seu navegador. Nada é enviado para servidores externos.";
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
      viewResultButton.setAttribute("aria-label", "Ver resultado anterior salvo");
      viewResultButton.onclick = () => {
        const restored = hydrateFromStorage();
        setCurrentStep(divisions.length); // vai direto para o resumo
        render();
      };
      buttons.appendChild(viewResultButton);
    }
    
    const startButton = document.createElement("button");
    startButton.className = "primary";
    startButton.innerHTML = `Começar agora ${icons.arrow}`;
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
  container.setAttribute("role", "main");

  // ===== HEADER: SEGMENTOS DAS 12 DIVISÕES =====
  const progressBox = document.createElement("div");
  progressBox.className = "section-box section-progress";

  // Quantidade de frases já pontuadas por divisão
  const divisionUsedCounts = divisions.map((div, idx) => {
    return responses[idx].filter((v) => v > 0).length;
  });

  const segmentsRow = document.createElement("div");
  segmentsRow.className = "divisions-progress";
  segmentsRow.setAttribute("role", "tablist");
  segmentsRow.setAttribute("aria-label", "Navegação entre blocos");

  divisions.forEach((div, idx) => {
    const seg = document.createElement("button");
    seg.type = "button";
    seg.className = "division-segment";
    seg.setAttribute("role", "tab");
    seg.setAttribute("aria-selected", idx === divisionIndex ? "true" : "false");
    seg.setAttribute("aria-label", `Bloco ${div.id}${divisionUsedCounts[idx] === 3 ? ', completo' : ''}`);

    const usedCount = divisionUsedCounts[idx];

    if (idx === divisionIndex) {
      seg.classList.add("current");
    } else if (usedCount === 3) {
      seg.classList.add("completed");
    }

    const squares = document.createElement("div");
    squares.className = "segment-squares";
    squares.setAttribute("aria-hidden", "true");

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
  left.innerHTML = `<strong>Bloco ${division.id}</strong> de ${totalDivisions}`;

  const right = document.createElement("span");
  right.textContent = `${questionsInDivision} afirmações para avaliar`;

  progressText.appendChild(left);
  progressText.appendChild(right);
  progressBox.appendChild(progressText);

  container.appendChild(progressBox);

  // ===== BOX: TÍTULO / INSTRUÇÕES DA DIVISÃO =====
  const divisionBox = document.createElement("div");
  divisionBox.className = "section-box";

  const title = document.createElement("h2");
  title.textContent = `Avalie as afirmações abaixo`;
  divisionBox.appendChild(title);

  const divisionLabel = document.createElement("div");
  divisionLabel.className = "small";
  divisionLabel.innerHTML = `
    <strong>Instrução:</strong> Arraste as fichas <strong>3, 2 e 1</strong> para as frases que mais te descrevem. 
    <br><span style="color: var(--color-primary);">3 = mais combina com você</span>
  `;
  divisionBox.appendChild(divisionLabel);

  const divResponses = responses[divisionIndex];
  const usedValues = [3, 2, 1]
    .filter((v) => divResponses.includes(v))
    .map((v) => `${v} pts`)
    .join(", ");
  const nonZeroCount = divResponses.filter((v) => v > 0).length;

  const divisionInfo = document.createElement("div");
  divisionInfo.className = "small";
  divisionInfo.style.marginTop = "8px";
  divisionInfo.innerHTML = `
    Progresso: <strong>${nonZeroCount}/3</strong> frases selecionadas
    ${usedValues ? ` (${usedValues})` : ""}
  `;
  divisionBox.appendChild(divisionInfo);

  const mobileTip = document.createElement("div");
  mobileTip.className = "small-destaque";
  mobileTip.style.marginTop = "8px";
  mobileTip.textContent = "No celular: pressione e arraste a ficha para a frase desejada";
  divisionBox.appendChild(mobileTip);

  container.appendChild(divisionBox);

  // ===== LISTA COM AS 8 PERGUNTAS =====
  const questionsBox = document.createElement("div");
  questionsBox.className = "section-box content-row";

  const questionsList = document.createElement("div");
  questionsList.className = "question-list";
  questionsList.setAttribute("role", "list");

  division.items.forEach((item, idx) => {
    const val = responses[divisionIndex][idx] || 0;

    const card = document.createElement("div");
    card.className = "question-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    if (val === 1) card.classList.add("score-1");
    if (val === 2) card.classList.add("score-2");
    if (val === 3) card.classList.add("score-3");

    const header = document.createElement("div");
    header.className = "question-header";

    const leftLabel = document.createElement("span");
    leftLabel.textContent = `${idx + 1}`;

    const scorePill = document.createElement("span");
    scorePill.className = "question-score-pill";
    scorePill.textContent = val > 0 ? `${val} pts` : "—";
    scorePill.setAttribute("aria-label", val > 0 ? `${val} pontos atribuídos` : "sem pontuação");

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

  const footerTitle = document.createElement("p");
  footerTitle.className = "small";
  footerTitle.style.textAlign = "center";
  footerTitle.style.marginBottom = "12px";
  footerTitle.innerHTML = `<strong>Fichas de pontuação</strong> — arraste para as frases`;
  footer.appendChild(footerTitle);

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
    slot.setAttribute("role", "button");
    slot.setAttribute("tabindex", "0");

    const valueSpan = document.createElement("span");
    valueSpan.className = "score-value";
    valueSpan.textContent = `${val}`;

    slot.appendChild(valueSpan);

    if (assignedIndex === -1) {
      // livre – pode arrastar
      slot.classList.add("available");
      slot.setAttribute("aria-label", `Ficha de ${val} pontos, arraste para uma frase`);
      
      const hint = document.createElement("span");
      hint.className = "score-hint";
      hint.textContent = "arraste";
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
      slot.setAttribute("aria-label", `Ficha de ${val} pontos atribuída à frase ${assignedIndex + 1}`);

      const qSpan = document.createElement("span");
      qSpan.className = "score-question";
      qSpan.textContent = `Frase ${assignedIndex + 1}`;

      const clearBtn = document.createElement("button");
      clearBtn.className = "score-clear";
      clearBtn.innerHTML = "×";
      clearBtn.setAttribute("aria-label", `Remover pontuação da frase ${assignedIndex + 1}`);
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

  const buttons = document.createElement("div");
  buttons.className = "buttons-row";
  buttons.style.marginTop = "16px";

  const nextButton = document.createElement("button");
  nextButton.className = "primary";
  nextButton.innerHTML =
    divisionIndex === divisions.length - 1
      ? `Ver meu resultado ${icons.sparkle}`
      : `Próximo bloco ${icons.arrow}`;

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

  // Lógica de Hash e LocalStorage
  const compactAnswers = buildCompactAnswers();
  const hashSource = JSON.stringify({
    name: participantName.trim(),
    answers: compactAnswers,
  });
  
  const currentHash = toBase64(hashSource);

  let lastHash = null;
  try {
    lastHash = localStorage.getItem(HISTORY_KEY);
  } catch (e) {
    // ignora erro
  }

  // --- CRIAÇÃO DO CONTAINER ---
  const container = document.createElement("div");
  container.setAttribute("role", "main");

  // Header
  const headerSection = document.createElement("div");
  headerSection.style.textAlign = "center";
  headerSection.style.marginBottom = "24px";

  const title = document.createElement("h1");
  title.textContent = "Seu Resultado";
  headerSection.appendChild(title);

  if (participantName) {
    const greeting = document.createElement("p");
    greeting.innerHTML = `Olá, <strong>${participantName}</strong>! Aqui está o mapa das suas afinidades profissionais.`;
    headerSection.appendChild(greeting);
  }

  container.appendChild(headerSection);

  // === TOP 3 ÁREAS ===
  const topAreasBox = document.createElement("div");
  topAreasBox.className = "top-areas";
  
  const topTitle = document.createElement("strong");
  topTitle.textContent = "Suas 3 principais áreas de afinidade:";
  topAreasBox.appendChild(topTitle);

  const badgesContainer = document.createElement("div");
  sortedAreas.slice(0, 3).forEach((g, idx) => {
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.innerHTML = `<strong>${idx + 1}º</strong>&nbsp;${g.name} — ${totals[g.letter]} pts`;
    badgesContainer.appendChild(badge);
  });
  topAreasBox.appendChild(badgesContainer);
  container.appendChild(topAreasBox);

  // === GRÁFICO DE BARRAS ===
  const chartSection = document.createElement("div");
  chartSection.className = "section-box";
  chartSection.style.marginTop = "24px";

  const chartTitle = document.createElement("h2");
  chartTitle.textContent = "Visão geral por área";
  chartTitle.style.marginBottom = "20px";
  chartSection.appendChild(chartTitle);

  sortedAreas.forEach((g) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    const left = document.createElement("span");
    left.textContent = g.name;
    const right = document.createElement("span");
    right.textContent = `${totals[g.letter]} pts`;
    label.appendChild(left);
    label.appendChild(right);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuenow", totals[g.letter]);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", maxValue);
    bar.setAttribute("aria-label", `${g.name}: ${totals[g.letter]} pontos`);
    
    const inner = document.createElement("div");
    inner.className = "bar-inner";
    inner.style.width = ((totals[g.letter] / maxValue) * 100).toFixed(1) + "%";
    bar.appendChild(inner);

    row.appendChild(label);
    row.appendChild(bar);
    chartSection.appendChild(row);
  });

  container.appendChild(chartSection);

  // === SEÇÃO "E AGORA?" ===
  const titleEagr = document.createElement("h2");
  titleEagr.className = "titleEagr";
  titleEagr.innerHTML = `E agora? ${icons.sparkle}`;
  container.appendChild(titleEagr);

  const exploreIntro = document.createElement("p");
  exploreIntro.style.textAlign = "center";
  exploreIntro.style.marginBottom = "24px";
  exploreIntro.innerHTML = `
    Hora de explorar! Pesquise sobre suas áreas de maior afinidade, 
    assista vídeos, leia artigos e descubra se é isso mesmo que você curte.
  `;
  container.appendChild(exploreIntro);

  // Área Principal
  const mainArea = document.createElement("div");
  mainArea.className = "result-area";
  
  const mainLabel = document.createElement("strong");
  mainLabel.textContent = "Área Principal";
  mainArea.appendChild(mainLabel);

  const mainName = document.createElement("div");
  mainName.className = "area-name";
  mainName.textContent = sortedAreas[0].name;
  mainArea.appendChild(mainName);

  const mainLinks = document.createElement("div");
  mainLinks.className = "explore-links";
  mainLinks.innerHTML = `
    <a class="link-btn youtube" href="${youtubeLink(sortedAreas[0].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[0].name} no YouTube">
      ${icons.youtube} YouTube
    </a>
    <a class="link-btn google" href="${googleLink(sortedAreas[0].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[0].name} no Google">
      ${icons.google} Google
    </a>
    <a class="link-btn tiktok" href="${tiktokLink(sortedAreas[0].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[0].name} no TikTok">
      ${icons.tiktok} TikTok
    </a>
  `;
  mainArea.appendChild(mainLinks);
  container.appendChild(mainArea);

  // Área Secundária
  const secArea = document.createElement("div");
  secArea.className = "box-sec";
  
  const secLabel = document.createElement("strong");
  secLabel.textContent = "Área Secundária";
  secArea.appendChild(secLabel);

  const secName = document.createElement("div");
  secName.className = "area-name";
  secName.textContent = sortedAreas[1].name;
  secArea.appendChild(secName);

  const secLinks = document.createElement("div");
  secLinks.className = "explore-links";
  secLinks.innerHTML = `
    <a class="link-btn youtube" href="${youtubeLink(sortedAreas[1].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[1].name} no YouTube">
      ${icons.youtube} YouTube
    </a>
    <a class="link-btn google" href="${googleLink(sortedAreas[1].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[1].name} no Google">
      ${icons.google} Google
    </a>
    <a class="link-btn tiktok" href="${tiktokLink(sortedAreas[1].name)}" target="_blank" rel="noopener noreferrer" aria-label="Pesquisar ${sortedAreas[1].name} no TikTok">
      ${icons.tiktok} TikTok
    </a>
  `;
  secArea.appendChild(secLinks);
  container.appendChild(secArea);

  // Nota Motivacional
  const motivational = document.createElement("div");
  motivational.className = "motivational-note";
  motivational.innerHTML = `
    <p>
      Lembre-se: esse teste é um ponto de partida, não um destino final. 
      <strong>Clareza vem da prática</strong>, então explore, experimente e descubra o que faz sentido pra você.
    </p>
  `;
  container.appendChild(motivational);

  // === TABELA DETALHADA (COLAPSÁVEL) ===
  const detailsSection = document.createElement("details");
  detailsSection.style.marginTop = "32px";
  
  const detailsSummary = document.createElement("summary");
  detailsSummary.style.cursor = "pointer";
  detailsSummary.style.fontWeight = "600";
  detailsSummary.style.color = "var(--color-gray-500)";
  detailsSummary.style.marginBottom = "16px";
  detailsSummary.textContent = "Ver tabela detalhada";
  detailsSection.appendChild(detailsSummary);

  const table = document.createElement("table");
  table.className = "summary-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Área", "Grupo", "Pontos"].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    th.setAttribute("scope", "col");
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  sortedAreas.forEach((g) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = g.name;
    const tdLetter = document.createElement("td");
    tdLetter.textContent = g.letter;
    const tdTotal = document.createElement("td");
    tdTotal.innerHTML = `<strong>${totals[g.letter]}</strong>`;
    tr.appendChild(tdName);
    tr.appendChild(tdLetter);
    tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  detailsSection.appendChild(table);
  container.appendChild(detailsSection);

  // === BOTÕES DE AÇÃO ===
  const buttons = document.createElement("div");
  buttons.className = "buttons-row";
  buttons.style.marginTop = "32px";

  const backButton = document.createElement("button");
  backButton.className = "secondary";
  backButton.textContent = "Revisar respostas";
  backButton.onclick = () => {
    setCurrentStep(divisions.length - 1); 
    render();
  };
  buttons.appendChild(backButton);

  const saveButton = document.createElement("button");
  saveButton.className = "primary";
  saveButton.textContent = isSending ? "Salvando..." : "Salvar resultado";
  saveButton.disabled = isSending;
  saveButton.onclick = () => {
    saveSnapshot();
  };
  buttons.appendChild(saveButton);

  container.appendChild(buttons);

  // Nota final
  const finalNote = document.createElement("p");
  finalNote.className = "small";
  finalNote.style.textAlign = "center";
  finalNote.style.marginTop = "24px";
  finalNote.textContent =
    "Este teste é uma ferramenta de autoconhecimento. Converse com profissionais da área, pesquise e observe quais atividades te trazem satisfação.";
  container.appendChild(finalNote);

  appRoot.appendChild(container);
}
