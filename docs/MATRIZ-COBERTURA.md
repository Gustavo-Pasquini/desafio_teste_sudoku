# Matriz regra → casos de teste — Sudoku binário

| # | Regra (seção 1) | TCs | Situação |
|---|---|---|---|
| 1 | 6 × 6 | 01 | ✅ |
| 2 | Fixas não mudam | 02, 03 | ✅ |
| 3 | Equilíbrio: no máximo três de cada, mesmo incompleta | 10 (linha, zeros), 11 (coluna, uns) | ⚠️ um valor por direção → ajuste: `test.each` com 0 e 1 |
| 4 | Sem trincas | 08 (linha, zeros), 09 (coluna, uns) | ⚠️ idem |
| 5 | Linhas/colunas **completas** não se repetem | 12, 13 | ✅ |
| 6 | Linhas **incompletas** iguais não são erro | — | ❌ → **TC-SB-18** |
| 7 | Ciclo do clique | 04 | ✅ |
| 8 | Erros aparecem na hora e somem ao corrigir | 08–14 | ✅ |
| 9 | Vitória (mensagem, cronômetro para, trava) e completo inválido | 15, 16 | ✅ |
| 10 | Limpar apaga só o do jogador **e as marcas de erro** | 05 | ⚠️ não confere as marcas → **TC-SB-19** |
| 11 | Novo jogo (outro puzzle, zera) | 06, 17 | ✅ |
| 12 | **Quando o cronômetro começa** | — | decidido (seção 1) → **TC-SB-20** |

### TCs novos — Sudoku

| ID | Dono / tarefa | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|---|
| TC-SB-18 | Breno / B4 | Linhas incompletas iguais não são erro | `VAZIO`; linhas 0 e 1 = `0 0 1 1 0 _` | Nenhuma célula com `data-erro` |
| TC-SB-19 | Gustavo / G3 | Limpar tira as marcas de erro | `VAZIO`; linha 0 = `0 0 0` (trinca); `btn-limpar` | As 3 vazias e nenhuma `data-erro` |
| TC-SB-20 | Gustavo / G4 | Cronômetro começa | Relógio falso: 2 s sem clicar; clicar uma célula; +2 s | Se a regra for "no 1º clique": 0 antes e ≥ 1 depois |
| ajuste 08–11 | Breno / B2, B3 | Trinca e equilíbrio | `test.each` com os dois valores (0 e 1) em cada direção | igual |

**Para que serve:** se o código dos jogos vai ser gerado só a partir dos testes, cada regra da seção 1 do PLANEJAMENTO.md tem um teste que a obriga a existir?

**Legenda**
- ✅ coberta, com exemplo suficiente para não dar para "decorar";
- ⚠️ coberta, mas com um exemplo só ou de forma parcial;
- ❌ sem teste;
- ❓ a regra não está definida no plano e precisa de uma decisão de vocês.

## Decisões tomadas

- O cronômetro começa **no primeiro clique** numa célula.

Mantenha esta matriz atualizada: todo TC novo entra na linha da regra que ele cobre. Uma regra sem TC não vai existir no jogo gerado.
