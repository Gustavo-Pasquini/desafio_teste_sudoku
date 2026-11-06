# Planejamento — desafio_teste_sudoku

Sudoku binário (Takuzu / Binairo) de **6 × 6**, jogável no navegador, com casos de teste de interface em JavaScript.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto, tabuleiro, células fixas, preenchimento, limpar e banco de puzzles |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Validação das regras, marcação de erros, vitória, CI e documentação dos testes |

---

## 1. Regras que o jogo deve seguir (escopo)

- Tabuleiro **6 × 6** (linhas e colunas `0..5`). Cada célula fica vazia, `0` ou `1`.
- Algumas células já vêm preenchidas (**fixas**) e não podem ser alteradas.
- **Regra 1 — equilíbrio:** cada linha e cada coluna completa tem **três 0 e três 1** (nunca mais de três de cada, mesmo incompleta).
- **Regra 2 — sem trincas:** não pode haver **três iguais seguidos** na horizontal ou na vertical.
- **Regra 3 — sem repetição:** duas linhas completas não podem ser iguais; duas colunas completas também não.
- **Preenchimento:** clicar numa célula alterna vazia → `0` → `1` → vazia.
- **Erros** aparecem na hora: as células que quebram uma regra ficam marcadas.
- **Vitória:** as 36 células preenchidas e nenhuma regra quebrada. Mostra mensagem, para o cronômetro e trava o tabuleiro.
- **Limpar** apaga só o que o jogador preencheu. **Novo jogo** sorteia outro puzzle do banco.
- Todo puzzle do banco tem **solução única**.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Jogo | HTML + CSS + JavaScript puro (ES Modules), sem framework. Ponto de entrada: `js/main.js` |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Servidor para jogar | `http-server` (`npm start`) |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm test` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `http-server`, `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`.

Comandos que o projeto deve ter (criados na tarefa G1):

```bash
npm install          # instala dependências (não baixa navegador)
npm start            # abre o jogo em http://localhost:8080 para jogar
npm test             # roda todos os testes uma vez (vitest run)
npm run test:watch   # roda de novo a cada arquivo salvo (vitest)
npm run test:ui      # interface visual do Vitest no navegador (vitest --ui)
npm run mutacao      # teste de mutação: os testes percebem quando o código é estragado? (stryker run)
```

`stryker.config.json` (tarefa G1):

```json
{
  "testRunner": "vitest",
  "vitest": { "configFile": "vitest.config.js" },
  "mutate": ["js/**/*.js", "!js/main.js"],
  "reporters": ["clear-text", "progress", "html"]
}
```

Como um teste abre o jogo — `tests/helpers.js` (tarefa G1):

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // main.js lê location.search e inicia o jogo
  return userEvent.setup();                 // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { test, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

Regras para os testes:

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de chamar funções internas do jogo.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Para esconder/mostrar algo use o atributo `hidden`; para bloquear botão, `disabled`. Assim `toBeVisible()` e `toBeDisabled()` funcionam.
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- `main.js` inicia o jogo assim que é importado e não usa `DOMContentLoaded` (o `index.html` carrega com `<script type="module" src="js/main.js">`, que já roda depois do HTML).
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título**, para ser rastreável na saída do Vitest.


Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md)):

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, implementador, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/hooks/rodar-testes.mjs   o hook: roda npm test após editar js/ ou tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
```

Estrutura de pastas e dono de cada arquivo:

```
desafio_teste_sudoku/
├── index.html              G1
├── css/estilo.css          G1 (cada um estiliza a própria parte)
├── js/main.js              G1  ponto de entrada: lê a URL e inicia o jogo
├── js/puzzles.js           Gustavo  banco de puzzles (seção 3)
├── js/tabuleiro.js         Gustavo  carregar puzzle, células fixas, alternar valor, limpar, novo jogo
├── js/ui.js                Gustavo  desenhar tabuleiro, cronômetro
├── js/regras.js            Breno    equilíbrio, trincas, linhas/colunas repetidas
├── js/jogo.js              Breno    marcar erros, detectar vitória, travar tabuleiro
├── tests/helpers.js        G1  (inclui P1 e a solução S1)
├── tests/tabuleiro.spec.js      Gustavo
├── tests/regras.spec.js         Breno
├── tests/vitoria.spec.js        Breno
├── .github/workflows/testes.yml Breno
├── vitest.config.js        G1
└── package.json            G1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `tabuleiro` | A grade |
| `celula-L-C` | Cada célula (ex.: `celula-2-5`). Atributos: `data-valor` = `""` \| `0` \| `1`; `data-fixa="true"` nas fixas; `data-erro="true"` quando quebra regra |
| `btn-limpar` | Apaga o que o jogador preencheu |
| `btn-novo` | Novo puzzle do banco |
| `cronometro` | Segundos de jogo |
| `mensagem` | "Parabéns, você resolveu!" ou aviso de erro |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `puzzle` | `?puzzle=....1....0...1..1....00..1......11..` | 36 caracteres, linha por linha: `0`, `1` ou `.` (vazia). Os números viram células fixas |

Para testar as regras à vontade use o tabuleiro vazio: `?puzzle=` + 36 pontos.

### Banco de puzzles (`js/puzzles.js`) — já conferidos: cada um tem solução única

| Nome | Puzzle | Solução |
|---|---|---|
| P1 | `....1....0...1..1....00..1......11..` | `100110011001010110101001010011101100` |
| P2 | `.....1.1.1.1.1.........1......0..0..` | `101001010101110010001101100110011010` |
| P3 | `..........11..1.1.......11..0......1` | `101100010011101010010101110100001011` |
| P4 | `........0.1.1..1....0...0......1.0.1` | `100110010011101100110010001101011001` |
| P5 | `1.......1......0..1.1..........00...` | `110010001101010011101100011001100110` |

Solução S1 (de P1) em grade, para os testes de vitória:

```
1 0 0 1 1 0
0 1 1 0 0 1
0 1 0 1 1 0
1 0 1 0 0 1
0 1 0 0 1 1
1 0 1 1 0 0
```

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo (TDD), e os **dois tipos de commit precisam existir**:

1. Escrever os casos de teste da tarefa (vão falhar) → commit `test: TC-XX-NN ...`
2. Implementar o mínimo para passar → commit `feat: ...`
3. Refatorar se precisar, rodar `npm test` inteiro → commit `refactor:` / `fix:`
4. Abrir Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. Se precisar mexer num arquivo do outro, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" faz o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js`, `.gitignore`, `index.html` com os `data-testid` da seção 3, `tests/helpers.js` com `abrirJogo(params)`, `P1`, `S1` e `preencher(user, grade)`, e um teste "a página abre" | `gustavo/g1-setup` | index.html, css, config, helpers | — |
| **G2** Tabuleiro 6 × 6 e células fixas | `gustavo/g2-tabuleiro` | tabuleiro.js, ui.js | TC-SB-01 a 03 |
| **G3** Alternar valor e limpar | `gustavo/g3-preencher` | tabuleiro.js | TC-SB-04, 05 |
| **G4** Banco de puzzles e novo jogo | `gustavo/g4-novo-jogo` | puzzles.js, tabuleiro.js | TC-SB-06, 07 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm test`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Regra das trincas | `breno/b2-trincas` | regras.js, jogo.js | TC-SB-08, 09 |
| **B3** Regra do equilíbrio | `breno/b3-equilibrio` | regras.js | TC-SB-10, 11 |
| **B4** Linhas e colunas repetidas, correção do erro | `breno/b4-repetidas` | regras.js | TC-SB-12 a 14 |
| **B5** Vitória e tabuleiro completo inválido | `breno/b5-vitoria` | jogo.js | TC-SB-15, 16 |

## 5. Casos de teste (interface)

Para pôr `0` numa célula vazia: 1 clique. Para pôr `1`: 2 cliques. O helper `preencher` faz isso.

### Gustavo — tabuleiro e preenchimento

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-SB-01 | Tamanho | Abrir com `puzzle=P1` | 36 células, 6 linhas × 6 colunas |
| TC-SB-02 | Células fixas | `puzzle=P1` | 9 células com `data-fixa="true"`, com os valores de P1 (ex.: `celula-0-4` = 1, `celula-1-3` = 0); as outras 27 vazias |
| TC-SB-03 | Fixa não muda | `puzzle=P1`, clicar 3 vezes em `celula-0-4` | Continua `1` |
| TC-SB-04 | Ciclo do clique | `puzzle=P1`, clicar `celula-0-0` 1, 2 e 3 vezes | `0`, depois `1`, depois vazia |
| TC-SB-05 | Limpar | `puzzle=P1`, preencher 5 células, clicar `btn-limpar` | As 5 ficam vazias; as 9 fixas continuam iguais |
| TC-SB-06 | Novo jogo | Sem parâmetro, clicar `btn-novo` | Tabuleiro carrega um puzzle de P1–P5 (padrão de fixas igual a um deles); células não fixas vazias; cronômetro volta a 0 |
| TC-SB-07 | Puzzles do banco são válidos | Abrir cada um de P1–P5 por `?puzzle=` | Nenhuma célula com `data-erro` ao carregar |

### Breno — regras e vitória

Tabuleiro vazio (`?puzzle=` + 36 pontos), salvo quando dito outro.

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-SB-08 | Trinca na linha | Linha 0: `0 0 0` nas colunas 0–2 | `celula-0-0`, `0-1`, `0-2` com `data-erro`; `0-3` sem erro |
| TC-SB-09 | Trinca na coluna | Coluna 4: `1 1 1` nas linhas 2–4 | `celula-2-4`, `3-4`, `4-4` com `data-erro` |
| TC-SB-10 | Mais de três 0 na linha | Linha 1: `0 0 1 0 0 _` (4 zeros, sem trinca) | Células com 0 da linha 1 com `data-erro` |
| TC-SB-11 | Mais de três 1 na coluna | Coluna 2: `1 1 0 1 1 _` | Células com 1 da coluna 2 com `data-erro` |
| TC-SB-12 | Linhas repetidas | Linhas 0 e 1 = `0 0 1 1 0 1` | As 12 células das duas linhas com `data-erro` |
| TC-SB-13 | Colunas repetidas | Colunas 0 e 1 = `0 0 1 1 0 1` (de cima para baixo) | As 12 células das duas colunas com `data-erro` |
| TC-SB-14 | Corrigir tira o erro | Fazer TC-SB-08 e depois mudar `celula-0-2` para `1` | Nenhuma célula da linha 0 com `data-erro` |
| TC-SB-15 | Vitória | `puzzle=P1`, preencher com S1 | `mensagem` = "Parabéns, você resolveu!"; nenhuma `data-erro`; clicar numa célula não muda nada; cronômetro para |
| TC-SB-16 | Completo mas errado | `puzzle=P1`, preencher S1, mas com `celula-0-0` = 0 e `celula-0-1` = 1 (linha 0 fica igual à linha 2, coluna 0 ganha `0 0 0` e coluna 1 ganha `1 1 1`) | Sem mensagem de vitória; pelo menos `celula-0-0` e `celula-0-1` com `data-erro`; tabuleiro continua editável |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-distribuicao`, `breno/b2-truco`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`. Commits pequenos (um caso de teste ou uma regra por commit).
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main`, `npm test` verde. O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 implementados em `tests/` e passando com `npm test`
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_sudoku`
