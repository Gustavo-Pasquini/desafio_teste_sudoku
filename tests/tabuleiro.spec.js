// Testes do tabuleiro, preenchimento e banco de puzzles (Gustavo — G2, G3, G4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect, vi, afterEach } from 'vitest';
import { abrirJogo, screen, celula, todasAsCelulas, preencher, P1, PUZZLES, S1, VAZIO } from './helpers.js';

const celulaDoIndice = (i) => celula(Math.floor(i / 6), i % 6);
/** Padrão das fixas na mesma notação do banco ('.' = não fixa). */
const padraoDasFixas = () =>
  Array.from({ length: 36 }, (_, i) =>
    celulaDoIndice(i).getAttribute('data-fixa') === 'true' ? celulaDoIndice(i).getAttribute('data-valor') : '.',
  ).join('');

afterEach(() => {
  vi.useRealTimers();
});

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

test('TC-SB-19 limpar também tira as marcas de erro', async () => {
  const user = await abrirJogo({ puzzle: VAZIO });
  await preencher(user, '000' + '.'.repeat(33)); // trinca na linha 0
  expect(celula(0, 0)).toHaveAttribute('data-erro', 'true'); // o erro aparece antes de limpar
  await user.click(screen.getByTestId('btn-limpar'));
  for (const c of [0, 1, 2]) expect(celula(0, c)).toHaveAttribute('data-valor', '');
  expect(todasAsCelulas().filter((c) => c.getAttribute('data-erro') === 'true')).toHaveLength(0);
});

test('TC-SB-04 clique alterna vazia → 0 → 1 → vazia', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  await user.click(celula(0, 0));
  expect(celula(0, 0)).toHaveAttribute('data-valor', '0');
  await user.click(celula(0, 0));
  expect(celula(0, 0)).toHaveAttribute('data-valor', '1');
  await user.click(celula(0, 0));
  expect(celula(0, 0)).toHaveAttribute('data-valor', '');
});

test('TC-SB-05 limpar apaga só o que o jogador preencheu', async () => {
  const user = await abrirJogo({ puzzle: P1 });
  // 0-0, 0-1, 0-2, 1-0 e 1-1 (nenhuma é fixa em P1), com os valores de S1
  const indices = [0, 1, 2, 6, 7];
  const grade = [...'.'.repeat(36)];
  for (const i of indices) grade[i] = S1[i];
  await preencher(user, grade.join(''));
  for (const i of indices) expect(celulaDoIndice(i)).toHaveAttribute('data-valor', S1[i]);

  await user.click(screen.getByTestId('btn-limpar'));
  for (const i of indices) expect(celulaDoIndice(i)).toHaveAttribute('data-valor', '');
  for (let i = 0; i < 36; i++) {
    if (P1[i] === '.') continue;
    expect(celulaDoIndice(i)).toHaveAttribute('data-valor', P1[i]);
    expect(celulaDoIndice(i)).toHaveAttribute('data-fixa', 'true');
  }
});

test('TC-SB-06 novo jogo carrega um puzzle do banco e zera o jogo', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'] });
  const user = await abrirJogo({ puzzle: P1 }, { advanceTimers: vi.advanceTimersByTime });
  await user.click(celula(0, 0)); // jogo em andamento: o jogador preencheu algo...
  vi.advanceTimersByTime(3000); // ... e o tempo passou
  await user.click(screen.getByTestId('btn-novo'));
  const padrao = padraoDasFixas();
  expect(PUZZLES).toContain(padrao);
  for (let i = 0; i < 36; i++) {
    if (padrao[i] === '.') expect(celulaDoIndice(i)).toHaveAttribute('data-valor', '');
  }
  expect(screen.getByTestId('cronometro')).toHaveTextContent(/^0$/);
});

test.each(PUZZLES.map((p, i) => [`P${i + 1}`, p]))('TC-SB-07 puzzle %s do banco carrega sem erros', async (_nome, puzzle) => {
  await abrirJogo({ puzzle });
  expect(todasAsCelulas()).toHaveLength(36);
  const dicas = [...puzzle].filter((ch) => ch !== '.').length;
  expect(todasAsCelulas().filter((c) => c.getAttribute('data-fixa') === 'true')).toHaveLength(dicas);
  expect(todasAsCelulas().filter((c) => c.getAttribute('data-erro') === 'true')).toHaveLength(0);
});
