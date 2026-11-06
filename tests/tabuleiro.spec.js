// Testes do tabuleiro, preenchimento e banco de puzzles (Gustavo — G2, G3, G4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, celula, todasAsCelulas, preencher, P1, PUZZLES, S1 } from './helpers.js';

const celulaDoIndice = (i) => celula(Math.floor(i / 6), i % 6);

test('TC-SB-01 tabuleiro 6 × 6: 36 células', async () => {
  await abrirJogo({ puzzle: P1 });
  expect(todasAsCelulas()).toHaveLength(36);
  for (let l = 0; l < 6; l++) {
    for (let c = 0; c < 6; c++) expect(celula(l, c)).toBeInTheDocument();
  }
});

test('TC-SB-02 P1: 9 células fixas com os valores do puzzle e 27 vazias', async () => {
  await abrirJogo({ puzzle: P1 });
  expect(todasAsCelulas().filter((c) => c.getAttribute('data-fixa') === 'true')).toHaveLength(9);
  for (let i = 0; i < 36; i++) {
    if (P1[i] === '.') {
      expect(celulaDoIndice(i)).toHaveAttribute('data-valor', '');
      expect(celulaDoIndice(i)).not.toHaveAttribute('data-fixa', 'true');
    } else {
      expect(celulaDoIndice(i)).toHaveAttribute('data-valor', P1[i]);
      expect(celulaDoIndice(i)).toHaveAttribute('data-fixa', 'true');
    }
  }
});

test('TC-SB-03 célula fixa não muda com cliques', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  // 0-4 é fixa com 1 em P1. Confere depois de CADA clique: o ciclo tem 3 estados, então
  // olhar só no fim deixaria passar uma fixa que gira 1 → vazia → 0 → 1.
  for (let i = 0; i < 3; i++) {
    await user.click(celula(0, 4));
    expect(celula(0, 4)).toHaveAttribute('data-valor', '1');
    expect(celula(0, 4)).toHaveAttribute('data-fixa', 'true');
  }
});
