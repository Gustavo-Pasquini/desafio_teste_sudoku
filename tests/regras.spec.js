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

test.each(['0', '1'])('TC-SB-09 trinca vertical de %s marca as três células', async (valor) => {
  const user = await abrirJogo({ puzzle: VAZIO });
  for (let l = 2; l <= 4; l++) await definir(user, l, 4, valor);

  for (let l = 2; l <= 4; l++) expect(celula(l, 4)).toHaveAttribute('data-erro', 'true');
});

test.each(['0', '1'])('TC-SB-10 mais de três %s na linha marca os quatro valores', async (valor) => {
  const user = await abrirJogo({ puzzle: VAZIO });
  const oposto = valor === '0' ? '1' : '0';
  for (const c of [0, 1, 3, 4]) await definir(user, 1, c, valor);
  await definir(user, 1, 2, oposto);

  for (const c of [0, 1, 3, 4]) expect(celula(1, c)).toHaveAttribute('data-erro', 'true');
});

test.each(['0', '1'])('TC-SB-11 mais de três %s na coluna marca os quatro valores', async (valor) => {
  const user = await abrirJogo({ puzzle: VAZIO });
  const oposto = valor === '0' ? '1' : '0';
  for (const l of [0, 1, 3, 4]) await definir(user, l, 2, valor);
  await definir(user, 2, 2, oposto);

  for (const l of [0, 1, 3, 4]) expect(celula(l, 2)).toHaveAttribute('data-erro', 'true');
});

test('TC-SB-12 linhas completas repetidas marcam as 12 células', async () => {
  const user = await abrirJogo({ puzzle: VAZIO });
  const linha = '001101';
  for (const l of [0, 1]) for (let c = 0; c < 6; c++) await definir(user, l, c, linha[c]);

  for (const l of [0, 1]) for (let c = 0; c < 6; c++) {
    expect(celula(l, c)).toHaveAttribute('data-erro', 'true');
  }
});
