// Testes das células certas, pintadas de verde (Gustavo — G6). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, celula, todasAsCelulas, cliqueDireito, P1 } from './helpers.js';

test('TC-SB-21 clique direito marca e desmarca a célula como certa', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  await user.click(celula(0, 0)); // 0
  await cliqueDireito(user, celula(0, 0));
  expect(celula(0, 0)).toHaveAttribute('data-certa', 'true');
  await cliqueDireito(user, celula(0, 0));
  expect(celula(0, 0)).not.toHaveAttribute('data-certa', 'true');
  expect(celula(0, 0)).toHaveAttribute('data-valor', '0');
});

test('TC-SB-22 célula certa não muda com clique esquerdo', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  await user.click(celula(0, 0));
  await cliqueDireito(user, celula(0, 0));
  for (let i = 0; i < 3; i++) {
    await user.click(celula(0, 0));
    expect(celula(0, 0)).toHaveAttribute('data-valor', '0');
    expect(celula(0, 0)).toHaveAttribute('data-certa', 'true');
  }
});

test('TC-SB-23 vazias e fixas não podem ser marcadas', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  await cliqueDireito(user, celula(0, 1)); // vazia
  await cliqueDireito(user, celula(0, 4)); // fixa (1)
  expect(celula(0, 1)).not.toHaveAttribute('data-certa', 'true');
  expect(celula(0, 4)).not.toHaveAttribute('data-certa', 'true');
  await user.click(celula(0, 0));
  await cliqueDireito(user, celula(0, 0)); // preenchida pelo jogador
  expect(celula(0, 0)).toHaveAttribute('data-certa', 'true');
});
