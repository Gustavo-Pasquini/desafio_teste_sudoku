// Tabuleiro do Sudoku binário (Gustavo): carregar puzzle, células fixas, alternar valor e limpar.
export const LADO = 6;
export const TOTAL = LADO * LADO;

const CICLO = { '': '0', '0': '1', '1': '' };

/** Texto de puzzle aceito: 36 caracteres '0', '1' ou '.'. */
export function puzzleValido(texto) {
  return typeof texto === 'string' && new RegExp(`^[01.]{${TOTAL}}$`).test(texto);
}

/** Converte o texto do puzzle (36 caracteres '0', '1' ou '.') em células. */
export function carregarPuzzle(puzzle) {
  return Array.from({ length: TOTAL }, (_, i) => {
    const fixa = puzzle[i] !== '.';
    return { valor: fixa ? puzzle[i] : '', fixa };
  });
}

/** Próximo valor do clique: vazia → 0 → 1 → vazia. */
export function proximoValor(valor) {
  return CICLO[valor];
}

/** Devolve as células com a célula `indice` alternada (fixas não mudam). */
export function alternar(celulas, indice) {
  return celulas.map((celula, i) =>
    i === indice && !celula.fixa ? { ...celula, valor: proximoValor(celula.valor) } : celula,
  );
}

/** Apaga o que o jogador preencheu; as fixas ficam. */
export function limpar(celulas) {
  return celulas.map((celula) => (celula.fixa ? celula : { ...celula, valor: '' }));
}
