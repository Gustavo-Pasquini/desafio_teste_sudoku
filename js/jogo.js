// Estado do jogo (Breno): marcar erros.
import { celulasComErro } from './regras.js';

/** Índices das células com erro, a partir das células do tabuleiro. */
export function errosDo(celulas) {
  return celulasComErro(celulas.map((celula) => celula.valor));
}

/** Vitória: as 36 células preenchidas e nenhuma regra quebrada. */
export function venceu(celulas) {
  return celulas.every((celula) => celula.valor !== '') && errosDo(celulas).size === 0;
}
