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
