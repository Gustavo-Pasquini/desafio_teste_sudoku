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
