// Helpers dos testes de interface (tarefa G1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, vi } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (cenário fixo)
 * @param {object} opcoesUser repassado a userEvent.setup (ex.: { advanceTimers: vi.advanceTimersByTime })
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  vi.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

// Banco de puzzles da seção 3 (cada um com solução única). '.' = vazia.
export const P1 = '....1....0...1..1....00..1......11..';
export const P2 = '.....1.1.1.1.1.........1......0..0..';
export const P3 = '..........11..1.1.......11..0......1';
export const P4 = '........0.1.1..1....0...0......1.0.1';
export const P5 = '1.......1......0..1.1..........00...';
export const PUZZLES = [P1, P2, P3, P4, P5];
// Solução S1 (de P1), linha por linha.
export const S1 = '100110011001010110101001010011101100';
// Tabuleiro vazio, para testar as regras à vontade.
export const VAZIO = '.'.repeat(36);

export const celula = (l, c) => screen.getByTestId(`celula-${l}-${c}`);
export const todasAsCelulas = () => screen.getAllByTestId(/^celula-\d-\d$/);

/**
 * Preenche o tabuleiro com `grade` (36 caracteres: '0', '1' ou '.' = não mexer).
 * Células fixas são puladas. 1 clique = 0, 2 cliques = 1.
 */
export async function preencher(user, grade) {
  for (let i = 0; i < 36; i++) {
    const valor = grade[i];
    if (valor === '.') continue;
    const l = Math.floor(i / 6), c = i % 6;
    if (celula(l, c).getAttribute('data-fixa') === 'true') continue;
    const cliques = valor === '0' ? 1 : 2;
    for (let k = 0; k < cliques; k++) await user.click(celula(l, c));
  }
}
