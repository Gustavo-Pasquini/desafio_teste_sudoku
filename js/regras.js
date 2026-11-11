// Regras do Sudoku binário (Breno). Recebem os 36 valores ('', '0', '1') e devolvem os índices que quebram a regra.
import { LADO } from './tabuleiro.js';

/** Índices de cada linha e de cada coluna (6 grupos de 6 em cada direção). */
const LINHAS = Array.from({ length: LADO }, (_, l) => Array.from({ length: LADO }, (_, c) => l * LADO + c));
const COLUNAS = Array.from({ length: LADO }, (_, c) => Array.from({ length: LADO }, (_, l) => l * LADO + c));

/** Regra 2: três iguais seguidos num grupo de índices. */
function trincas(valores, grupo) {
  const erros = [];
  for (let k = 0; k + 2 < grupo.length; k++) {
    const trio = grupo.slice(k, k + 3);
    const [a, b, c] = trio.map((i) => valores[i]);
    if (a !== '' && a === b && b === c) erros.push(...trio);
  }
  return erros;
}

/** Regra 1: mais de três (metade do lado) do mesmo valor num grupo marca todas as células com esse valor. */
function desequilibrio(valores, grupo) {
  return ['0', '1'].flatMap((valor) => {
    const iguais = grupo.filter((i) => valores[i] === valor);
    return iguais.length > LADO / 2 ? iguais : [];
  });
}

/** Regra 3: grupos completos iguais (linhas entre si, colunas entre si) marcam todas as suas células. */
function repetidos(valores, grupos) {
  const texto = (grupo) => grupo.map((i) => valores[i]).join('');
  const completos = grupos.filter((grupo) => texto(grupo).length === LADO);
  return completos.filter((grupo) => completos.some((outro) => outro !== grupo && texto(outro) === texto(grupo))).flat();
}

/** Conjunto com os índices das células que quebram alguma regra. */
export function celulasComErro(valores) {
  return new Set([
    ...[...LINHAS, ...COLUNAS].flatMap((grupo) => [...trincas(valores, grupo), ...desequilibrio(valores, grupo)]),
    ...repetidos(valores, LINHAS),
    ...repetidos(valores, COLUNAS),
  ]);
}
