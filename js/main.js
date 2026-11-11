// Ponto de entrada do jogo: lê `?puzzle=` e inicia o jogo ao ser importado (sem DOMContentLoaded).
// Sem `puzzle` válido na URL, sorteia um do banco.
import { carregarPuzzle, puzzleValido, alternar, limpar } from './tabuleiro.js';
import { sortearPuzzle } from './puzzles.js';
import { errosDo, venceu } from './jogo.js';
import { criarTabuleiro, mostrarCelulas, travarTabuleiro, criarCronometro } from './ui.js';

const MENSAGEM_VITORIA = 'Parabéns, você resolveu!';

const elemento = (testid) => document.querySelector(`[data-testid="${testid}"]`);
const tabuleiro = elemento('tabuleiro');
const mensagem = elemento('mensagem');
const btnNovo = elemento('btn-novo');
const btnLimpar = elemento('btn-limpar');
const cronometro = criarCronometro(elemento('cronometro'));

let puzzleAtual;
let celulas;
let terminado = false;

/** Troca as células, redesenha com os erros e confere a vitória. */
function atualizar(novas) {
  celulas = novas;
  mostrarCelulas(tabuleiro, celulas, errosDo(celulas));
  terminado = venceu(celulas);
  if (terminado) {
    cronometro.parar();
    mensagem.textContent = MENSAGEM_VITORIA;
  }
  travarTabuleiro(tabuleiro, terminado);
  btnLimpar.disabled = terminado;
}

function iniciar(puzzle) {
  puzzleAtual = puzzle;
  cronometro.zerar();
  mensagem.textContent = '';
  atualizar(carregarPuzzle(puzzle));
}

btnNovo.textContent = 'Novo jogo';
btnLimpar.textContent = 'Limpar';
criarTabuleiro(tabuleiro, (indice) => {
  if (terminado) return;
  cronometro.iniciar();
  atualizar(alternar(celulas, indice));
});
btnLimpar.addEventListener('click', () => atualizar(limpar(celulas)));
btnNovo.addEventListener('click', () => iniciar(sortearPuzzle(puzzleAtual)));

const daUrl = new URLSearchParams(location.search).get('puzzle');
iniciar(puzzleValido(daUrl) ? daUrl : sortearPuzzle(null));
