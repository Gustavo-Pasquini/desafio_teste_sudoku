// Banco de puzzles (Gustavo) — seção 3 do PLANEJAMENTO.md. Cada um tem solução única.
// Notação: 36 caracteres, linha por linha; '0', '1' ou '.' (vazia).
export const BANCO = [
  { puzzle: '....1....0...1..1....00..1......11..', solucao: '100110011001010110101001010011101100' },
  { puzzle: '.....1.1.1.1.1.........1......0..0..', solucao: '101001010101110010001101100110011010' },
  { puzzle: '..........11..1.1.......11..0......1', solucao: '101100010011101010010101110100001011' },
  { puzzle: '........0.1.1..1....0...0......1.0.1', solucao: '100110010011101100110010001101011001' },
  { puzzle: '1.......1......0..1.1..........00...', solucao: '110010001101010011101100011001100110' },
];

/**
 * Sorteia um puzzle do banco diferente de `atual` (qualquer um, se `atual` não está no banco).
 * `aleatorio` devolve um número em [0, 1).
 */
export function sortearPuzzle(atual, aleatorio = Math.random) {
  const opcoes = BANCO.map((item) => item.puzzle).filter((puzzle) => puzzle !== atual);
  return opcoes[Math.floor(aleatorio() * opcoes.length)];
}
