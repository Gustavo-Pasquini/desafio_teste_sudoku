// Testes de vitória (Breno — B5). Modo somente testes: falham até o jogo existir.
import { test, expect, vi } from 'vitest';
import { abrirJogo, P1, S1, preencher, celula, todasAsCelulas, screen } from './helpers.js';

test('TC-SB-15 solução válida vence, trava o tabuleiro e para o cronômetro', async () => {
  vi.useFakeTimers();
  try {
    const user = await abrirJogo({ puzzle: P1 }, { advanceTimers: vi.advanceTimersByTime });
    await preencher(user, S1);

    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Parabéns, você resolveu!$/);
    for (const item of todasAsCelulas()) expect(item).not.toHaveAttribute('data-erro');

    const valorFinal = celula(0, 0).getAttribute('data-valor');
    await user.click(celula(0, 0));
    expect(celula(0, 0)).toHaveAttribute('data-valor', valorFinal);

    const tempoFinal = screen.getByTestId('cronometro').textContent;
    vi.advanceTimersByTime(2000);
    expect(screen.getByTestId('cronometro')).toHaveTextContent(tempoFinal);
  } finally {
    vi.useRealTimers();
  }
});

test('TC-SB-16 tabuleiro completo inválido mostra erros e continua editável', async () => {
  const gradeInvalida = `01${S1.slice(2)}`;
  const user = await abrirJogo({ puzzle: P1 });
  await preencher(user, gradeInvalida);

  expect(screen.getByTestId('mensagem')).not.toHaveTextContent(/Parabéns, você resolveu!/i);
  expect(celula(0, 0)).toHaveAttribute('data-erro', 'true');
  expect(celula(0, 1)).toHaveAttribute('data-erro', 'true');

  await user.click(celula(0, 0));
  expect(celula(0, 0)).toHaveAttribute('data-valor', '1');
});
