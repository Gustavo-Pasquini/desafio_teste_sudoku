# Planejamento — desafio_teste_sudoku

Sudoku binário (Takuzu / Binairo) de **6 × 6**: **casos de teste de interface em JavaScript**. O jogo é implementado a partir desses testes (fase GREEN liberada em 10/11/2026).

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto e testes de: tabuleiro, células fixas, preenchimento, limpar e banco de puzzles |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Testes de: validação das regras, marcação de erros, vitória; CI e documentação dos testes |

---

## 1. Regras do jogo (o que os testes verificam)

- Tabuleiro **6 × 6** (linhas e colunas `0..5`). Cada célula fica vazia, `0` ou `1`.
- Algumas células já vêm preenchidas (**fixas**) e não podem ser alteradas.
- **Regra 1 — equilíbrio:** cada linha e cada coluna completa tem **três 0 e três 1** (nunca mais de três de cada, mesmo incompleta).
- **Regra 2 — sem trincas:** não pode haver **três iguais seguidos** na horizontal ou na vertical.
- **Regra 3 — sem repetição:** duas linhas completas não podem ser iguais; duas colunas completas também não.
- **Preenchimento:** clicar numa célula alterna vazia → `0` → `1` → vazia.
- **Erros** aparecem na hora: as células que quebram uma regra ficam marcadas.
- **Cronômetro:** começa no primeiro clique numa célula e para na vitória.
- **Vitória:** as 36 células preenchidas e nenhuma regra quebrada. Mostra mensagem, para o cronômetro e trava o tabuleiro.
- **Limpar** apaga só o que o jogador preencheu. **Novo jogo** sorteia outro puzzle do banco (sempre diferente do atual), zera o que foi preenchido e o cronômetro.
- Todo puzzle do banco tem **solução única**.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega atual | Casos de teste **e** o jogo que os faz passar (fase GREEN liberada em 10/11/2026; ver [docs/FASE-GREEN.md](docs/FASE-GREEN.md)) |
| Executor dos testes | [Jest](https://jestjs.io) (com `babel-jest` para os ES Modules) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`, via `jest-environment-jsdom`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `jest`, `jest-environment-jsdom`, `babel-jest`, `@babel/core`, `@babel/preset-env`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.

Comandos que o projeto deve ter (`package.json` da tarefa G1):

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest)
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
npm start                   # jogar em http://localhost:8080
npm run mutacao             # teste de mutação (Stryker)
```

```json
"scripts": {
  "test": "jest",
  "verificar": "node scripts/verificar-testes.mjs",
  "verificar:completo": "node scripts/verificar-testes.mjs --completo"
}
```

### Fase GREEN (liberada em 10/11/2026)

Os testes foram escritos primeiro (RED). Agora o jogo é implementado para passar em cada um, **um TC por vez**, com o mínimo de código em `js/` e **sem alterar `tests/`**. `npm test` precisa ficar todo verde, e `npm run verificar` não pode acusar falha pelo motivo errado.

### Esqueleto da tela (`index.html`, tarefa G1)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-estado`, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- Elementos criados pelo jogo (células, cartas, peças, casas) **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` lê os parâmetros da URL e inicia o jogo.

### Como um teste abre o jogo — `tests/helpers.js` (tarefa G1)

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  jest.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // lê location.search e inicia o jogo
  return userEvent.setup(opcoesUser);       // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de importar `js/*.js` ou chamar funções internas.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Esconder/mostrar se confere pelo atributo `hidden` (`toBeVisible()`); bloqueio, pelo `disabled` (`toBeDisabled()`).
- Tempo (cronômetro): `jest.useFakeTimers()` no teste, `abrirJogo(params, { advanceTimers: jest.advanceTimersByTime })` e `jest.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título** (o verificador exige).
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/FASE-GREEN.md               o que fazer quando a implementação for liberada
```

Estrutura de pastas e dono de cada arquivo.

> Os arquivos de `js/` e o `css/` seguem a divisão abaixo (fase GREEN liberada em 10/11/2026).

```
desafio_teste_sudoku/
├── index.html              G1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js              G1  lê a URL e inicia o jogo
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
├── babel.config.cjs        G1  Jest: ES Modules → CommonJS
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

> ✅ **Fase GREEN liberada (10/11/2026).** Os casos de teste já existem. Agora cada tarefa é fazer os seus TCs passarem com o jogo de verdade.

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. 🔴 O teste do TC já existe e falha pelo motivo certo.
2. 🟢 Escrever o **mínimo** de código em `js/` para ele passar, sem tocar em `tests/` e sem "decorar" o cenário do teste → `npm test` verde → commit `feat: ... (TC-XX-NN)`.
3. 🔵 Com tudo verde, refatorar → `refactor:`.
4. No fim da tarefa: revisão (`revisor-tdd`), `npm run mutacao`, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes (de teste e de `js/`)** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da G1: se precisar mudar, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" escreve o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, configuração do Jest no `package.json` + `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto (elementos fixos da seção 3 **vazios**, sem texto nem atributos de estado), `tests/helpers.js` com `abrirJogo(params)`, `P1`, `S1` e `preencher(user, grade)` | `gustavo/g1-setup` | index.html, js/main.js, config, tests/helpers.js | — |
| **G2** Tabuleiro 6 × 6 e células fixas | `gustavo/g2-tabuleiro` | tests/tabuleiro.spec.js | TC-SB-01 a 03 |
| **G3** Alternar valor e limpar | `gustavo/g3-preencher` | tests/tabuleiro.spec.js | TC-SB-04, 05, 19 |
| **G4** Banco de puzzles e novo jogo | `gustavo/g4-novo-jogo` | tests/tabuleiro.spec.js | TC-SB-06, 07, 17, 20 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm run verificar`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Regra das trincas | `breno/b2-trincas` | tests/regras.spec.js | TC-SB-08, 09 |
| **B3** Regra do equilíbrio | `breno/b3-equilibrio` | tests/regras.spec.js | TC-SB-10, 11 |
| **B4** Linhas e colunas repetidas, correção do erro | `breno/b4-repetidas` | tests/regras.spec.js | TC-SB-12 a 14, 18 |
| **B5** Vitória e tabuleiro completo inválido | `breno/b5-vitoria` | tests/vitoria.spec.js | TC-SB-15, 16 |

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
| TC-SB-19 | Limpar tira as marcas de erro | `puzzle=VAZIO`; linha 0 = `0 0 0` (trinca); `btn-limpar` | Antes de limpar, `celula-0-0` com `data-erro`; depois, as 3 vazias e nenhuma `data-erro` |
| TC-SB-06 | Novo jogo | `puzzle=P1` com relógio falso: preencher `celula-0-0`, avançar 3 s, clicar `btn-novo` | Padrão de fixas igual a um de P1–P5; células não fixas vazias (o que foi preenchido some); `cronometro` = 0 |
| TC-SB-07 | Puzzles do banco são válidos | Abrir cada um de P1–P5 por `?puzzle=` | Nenhuma célula com `data-erro` ao carregar |
| TC-SB-17 | Novo jogo troca o puzzle | `puzzle=P1`, clicar `btn-novo` 10 vezes | A cada clique o padrão de fixas é um de P1–P5 e **diferente** do anterior |
| TC-SB-20 | Cronômetro começa no 1º clique | `puzzle=P1` com relógio falso: avançar 2 s sem clicar; clicar `celula-0-0`; avançar 2 s | Antes do clique = 0; depois ≥ 1 |

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
| TC-SB-18 | Linhas incompletas iguais não são erro | `puzzle=VAZIO`; linhas 0 e 1 = `0 0 1 1 0 _` | Nenhuma célula com `data-erro` |

> **Ajuste da matriz de cobertura:** TC-SB-08 a 11 usam `test.each` com os dois valores (0 e 1) em cada direção.

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-...`, `breno/b2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `refactor:`, `fix:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste (ou uma regra) por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm test` todo verde (e `npm run verificar` sem problemas). O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm test` todo verde e `npm run verificar:completo` sem problemas
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions rodando `npm test`) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_sudoku`
