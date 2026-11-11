# desafio_teste_sudoku

Desafio de testes: casos de teste para testar o **Sudoku binário** de tamanho **6 × 6**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) | Tarefas B1–B5: CI, documentação dos testes e 10 casos de teste |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) | Tarefas G1–G6: estrutura do projeto e 14 casos de teste |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits. A divisão das tarefas e as regras completas estão em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-XX-NN"   # um caso só
```

## Funcionamento dos casos de teste

**Situação atual:** somente os casos de teste. O jogo ainda não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem depender de sorte:** o cenário (cartas, minas, peças, frota, puzzle) é montado por parâmetros de URL, então cada teste começa sempre do mesmo jeito. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`.
- **Integração contínua:** o GitHub Actions roda `npm ci` e `npm run verificar` em todo push e Pull Request.

## Casos de teste (24)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-SB-01 | Tamanho | `tests/tabuleiro.spec.js` | 36 células, 6 linhas × 6 colunas | Gustavo |
| TC-SB-02 | Células fixas | `tests/tabuleiro.spec.js` | 9 células com `data-fixa="true"`, com os valores de P1 (ex.: `celula-0-4` = 1, `celula-1-3` = 0); as outras 27 vazias | Gustavo |
| TC-SB-03 | Fixa não muda | `tests/tabuleiro.spec.js` | Continua `1` | Gustavo |
| TC-SB-04 | Ciclo do clique | `tests/tabuleiro.spec.js` | `0`, depois `1`, depois vazia | Gustavo |
| TC-SB-05 | Limpar | `tests/tabuleiro.spec.js` | As 5 ficam vazias; as 9 fixas continuam iguais | Gustavo |
| TC-SB-06 | Novo jogo | `tests/tabuleiro.spec.js` | Padrão de fixas igual a um de P1–P5; células não fixas vazias (o que foi preenchido some); `cronometro` = 0 | Gustavo |
| TC-SB-07 | Puzzles do banco são válidos | `tests/tabuleiro.spec.js` | Nenhuma célula com `data-erro` ao carregar | Gustavo |
| TC-SB-08 | Trinca na linha | `tests/regras.spec.js` | `celula-0-0`, `0-1`, `0-2` com `data-erro`; `0-3` sem erro | Breno |
| TC-SB-09 | Trinca na coluna | `tests/regras.spec.js` | `celula-2-4`, `3-4`, `4-4` com `data-erro` | Breno |
| TC-SB-10 | Mais de três 0 na linha | `tests/regras.spec.js` | Células com 0 da linha 1 com `data-erro` | Breno |
| TC-SB-11 | Mais de três 1 na coluna | `tests/regras.spec.js` | Células com 1 da coluna 2 com `data-erro` | Breno |
| TC-SB-12 | Linhas repetidas | `tests/regras.spec.js` | As 12 células das duas linhas com `data-erro` | Breno |
| TC-SB-13 | Colunas repetidas | `tests/regras.spec.js` | As 12 células das duas colunas com `data-erro` | Breno |
| TC-SB-14 | Corrigir tira o erro | `tests/regras.spec.js` | Nenhuma célula da linha 0 com `data-erro` | Breno |
| TC-SB-15 | Vitória | `tests/vitoria.spec.js` | `mensagem` = "Parabéns, você resolveu!"; nenhuma `data-erro`; clicar numa célula não muda nada; cronômetro para | Breno |
| TC-SB-16 | Completo mas errado | `tests/vitoria.spec.js` | Sem mensagem de vitória; pelo menos `celula-0-0` e `celula-0-1` com `data-erro`; tabuleiro continua editável | Breno |
| TC-SB-17 | Novo jogo troca o puzzle | `tests/tabuleiro.spec.js` | A cada clique o padrão de fixas é um de P1–P5 e **diferente** do anterior | Gustavo |
| TC-SB-18 | Linhas incompletas iguais não são erro | `tests/regras.spec.js` | Nenhuma célula com `data-erro` | Breno |
| TC-SB-19 | Limpar tira as marcas de erro | `tests/tabuleiro.spec.js` | Antes de limpar, `celula-0-0` com `data-erro`; depois, as 3 vazias e nenhuma `data-erro` | Gustavo |
| TC-SB-20 | Cronômetro começa no 1º clique | `tests/tabuleiro.spec.js` | Antes do clique = 0; depois ≥ 1 | Gustavo |
| TC-SB-21 | Marcar como certa | `tests/certeza.spec.js` | Ganha `data-certa="true"`; depois perde a marca e continua com 0 | Gustavo |
| TC-SB-22 | Certa fica protegida | `tests/certeza.spec.js` | `data-valor` continua 0 e a marca continua | Gustavo |
| TC-SB-23 | Só preenchidas pelo jogador | `tests/certeza.spec.js` | 0-1 e 0-4 sem marca; 0-0 marcada | Gustavo |
| TC-SB-24 | Limpar e Novo jogo | `tests/certeza.spec.js` | Limpar mantém 0-0 (certa) e apaga 0-1; Novo jogo deixa nenhuma célula certa | Gustavo |

## Estrutura

```
index.html                esqueleto da tela (elementos da seção 3)
js/main.js                ponto de entrada do jogo
tests/helpers.js          abrirJogo(), cenários fixos e atalhos
tests/*.spec.js           casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md           regras, contrato, tarefas e casos de teste
docs/                     matriz de cobertura e TDD com IA
```
