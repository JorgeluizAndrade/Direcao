import { divisions } from "./scripts/utils.js";
import { renderIntroScreen, renderDivisionScreen, renderSummaryScreen, setRender } from "./scripts/renderFunctions.js";
import { currentStep } from "./scripts/state.js";




// ===== ESTADO DO APP =====
// currentStep:
// -1 = tela inicial
//  0..11 = índice da divisão atual
//  12 = resumo


const appRoot = document.getElementById("app");


// ===== RENDER =====

function render() {
  appRoot.innerHTML = "";
  if (currentStep === -1) {
    renderIntroScreen();
  } else if (currentStep >= 0 && currentStep < divisions.length) {
    renderDivisionScreen();
  } else {
    renderSummaryScreen();
  }
}
setRender(render);

render();
