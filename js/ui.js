// Tela (Gustavo): desenha o tabuleiro e o cronômetro. Só desenha e escuta cliques.
import { LADO, TOTAL } from './tabuleiro.js';

/** Cria as 36 células dentro de `elemento`; `aoClicar(indice)` é chamado a cada clique. */
export function criarTabuleiro(elemento, aoClicar) {
  elemento.replaceChildren(
    ...Array.from({ length: TOTAL }, (_, i) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.dataset.testid = `celula-${Math.floor(i / LADO)}-${i % LADO}`;
      botao.addEventListener('click', () => aoClicar(i));
      return botao;
    }),
  );
}

/** Trava (ou destrava) as células do tabuleiro. */
export function travarTabuleiro(elemento, travado) {
  for (const botao of elemento.children) botao.disabled = travado;
}

/** Mostra o valor e o estado de cada célula; `erros` = índices com erro. */
export function mostrarCelulas(elemento, celulas, erros) {
  celulas.forEach((celula, i) => {
    const botao = elemento.children[i];
    botao.dataset.valor = celula.valor;
    botao.textContent = celula.valor;
    botao.setAttribute('aria-label', `Linha ${Math.floor(i / LADO) + 1}, coluna ${(i % LADO) + 1}: ${celula.valor || 'vazia'}`);
    if (celula.fixa) botao.dataset.fixa = 'true';
    else delete botao.dataset.fixa;
    if (erros.has(i)) botao.dataset.erro = 'true';
    else delete botao.dataset.erro;
  });
}

/**
 * Cronômetro em segundos inteiros, mostrado em `elemento`.
 * Começa em `iniciar()` (só uma vez até `zerar()`); o intervalo para sozinho se o elemento sair da página.
 */
export function criarCronometro(elemento, agora = () => Date.now()) {
  let inicio = null;
  let intervalo = null;
  const mostrar = (segundos) => {
    elemento.textContent = String(segundos);
  };
  const desligar = () => {
    clearInterval(intervalo);
    intervalo = null;
  };
  const tique = () => {
    if (!elemento.isConnected) return desligar();
    mostrar(Math.floor((agora() - inicio) / 1000));
  };
  return {
    iniciar() {
      if (inicio !== null) return;
      inicio = agora();
      intervalo = setInterval(tique, 1000);
    },
    parar() {
      if (intervalo !== null) tique();
      desligar();
    },
    zerar() {
      desligar();
      inicio = null;
      mostrar(0);
    },
  };
}
