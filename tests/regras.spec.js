// Testes das regras do Sudoku binário (Breno — B2, B3, B4).
// Modo somente testes: todos falham de propósito enquanto o jogo não existe.
import { test, expect } from 'vitest';
import { abrirJogo, VAZIO, celula } from './helpers.js';

async function definir(user, l, c, valor) {
  await user.click(celula(l, c));
  if (valor === '1') await user.click(celula(l, c));
}

test.each(['0', '1'])('TC-SB-08 trinca horizontal de %s marca as três células', async (valor) => {
  const user = await abrirJogo({ puzzle: VAZIO });
  for (let c = 0; c < 3; c++) await definir(user, 0, c, valor);

  for (let c = 0; c < 3; c++) expect(celula(0, c)).toHaveAttribute('data-erro', 'true');
  expect(celula(0, 3)).not.toHaveAttribute('data-erro');
});
