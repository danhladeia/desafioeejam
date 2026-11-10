# Modo Duelo unificado: conteúdo Normal ou EDF, equipes e participantes cadastrados, sem token

Data: 2026-11-10 · Estado: aguardando revisão do professor

## Objetivo

Hoje existem dois motores de duelo separados:

- **Modo Duelo** (`duel.js`, `duel-ui.js`, `roster.js`, `duel.css`): pede o token do professor, usa 3 turmas fixas (9º A, 9º B e M. Braga) com lista de alunos, só joga os 12 jogos do conteúdo Normal, com 5/10/15/20 rodadas, sorteio animado de 5 s, ranking e final.
- **Campeonato EDF** (`edf-duel.js`, `edf-duel-ui.js`): sem token, de 2 a 8 equipes criadas pelo professor com alunos cadastrados, 1 a 40 rodadas, ano e unidades do EDF, mesmo sorteio animado de 5 s, ranking e final. Fica dentro do menu EDF.

Esta mudança deixa **um motor só**: o Modo Duelo passa a ter equipes e participantes cadastrados, escolha de conteúdo (Normal ou EDF), nenhum token, e mantém todas as animações do sorteio.

## Decisões do professor

- O Modo Duelo oferece a **escolha de modo** (conteúdo Normal ou EDF). O campeonato sai do menu EDF e passa a morar só no Duelo.
- **Não há mais token.** O código do token sai.
- **As turmas fixas e seus alunos são excluídos** (9º A, 9º B, M. Braga, `roster.js`, "Editar nomes" e os dados salvos delas). Como não há mais turmas fixas, o conteúdo Normal também usa equipes cadastradas.
- As animações do sorteio (nomes girando por 5 s, revelação do confronto, ranking animado) são mantidas.

Fora do escopo: o campeonato por chaveamento (botão **Começar campeonato**), o Jogar solo, a partida livre do EDF, os jogos em si e reescrever o histórico do Git.

## 1. Entrada e tela de configuração

- O botão **Modo Duelo** da tela inicial abre direto a configuração, sem modal de token. Se houver duelo salvo, a tela mostra **Continuar** ou **Ver resultado** (igual ao campeonato EDF de hoje).
- A configuração (uma tela com seções) tem, nesta ordem:
  1. **Conteúdo do duelo:** dois cartões grandes, *Normal* e *EDF*.
  2. Só no EDF: os cartões de **ano** (6º a 9º) e as **unidades** do ano, com as mesmas regras do menu EDF (padrão: as três unidades; mínimo uma). As escolhas iniciais vêm da configuração EDF salva (`eejam-edf-v1`).
  3. **Jogos que entram no sorteio:** caixas de seleção. No Normal, os 12 jogos do modo normal; no EDF, os 14 jogos EDF. Todos vêm marcados; ao menos um é obrigatório.
  4. **Total de rodadas** (1 a 40, a última é a final) e **dificuldade inicial** (no Normal "Desafio • 14–15 anos" e "Avançado"; no EDF "Desafio • N º ano" e "Avançado").
  5. **Equipes:** de 2 a 8, com nome (até 40 caracteres) e um participante por linha (até 60 por equipe, até 40 caracteres cada, sem repetição na mesma equipe). O botão **Usar equipes cadastradas** continua copiando as equipes do campeonato por chaveamento.
- Depois de **Criar duelo**, o fluxo é o atual: pronto para sortear → **sorteio animado de 5 s** → revelação do confronto (com **Sortear outro aluno** em um lado só) → partida → resultado → **ranking animado** → próximo sorteio → final → equipe campeã. **Adicionar alunos** continua disponível durante o duelo.
- Regras de torneio inalteradas: classificatórias com participações equilibradas, a última rodada é a final entre as duas melhores, ninguém joga duas vezes, `prefers-reduced-motion` mostra a revelação imediata.

## 2. Motor

Os arquivos `edf-duel.js` e `edf-duel-ui.js` viram `duelo.js` e `duelo-ui.js` (`git mv`) e passam a conhecer o modo.

- **Estado salvo:** ganha o campo `mode` (`'normal'` ou `'edf'`) depois de `grade`, que continua como estava. A chave do `localStorage` não muda (`eejam-edf-competition-v1`), para que campeonatos EDF já salvos continuem abrindo.
- **Migração:** um salvamento sem `mode` vale `edf` (já tem `grade`, ou 7 se for ainda mais antigo, como hoje). A validação continua reconstruindo todo o histórico antes de aceitar o estado.
- **Normal:** `topics` fica vazio e `grade` vale 7 (sem uso). A lista de jogos é validada contra os 12 ids de `GAMES`; no EDF, contra `EDF_VARIANTS` (14 ids).
- **Partida:** o contexto de início ganha `mode`. No Normal, `app.js` abre a partida como hoje abre uma partida do modo normal (sem `edfActive`, `selected` = jogo sorteado); no EDF, como o campeonato EDF atual. A tela de resultado e o botão de pausa (**Anular e sair**) usam o mesmo `duelo-ui` nos dois modos.
- **Rótulos:** "CAMPEONATO EDF" vira "MODO DUELO" nas telas; o ano aparece só no EDF.

## 3. O que sai

- Arquivos apagados: `duel.js`, `duel-ui.js`, `duel.css`, `roster.js`, `tests/duel.test.js`, `tests/browser/duel.spec.js` (os testes úteis são reescritos para o motor novo).
- `app.js`: sai `createDuelUI`, o hash/token, as ações `duel-*` antigas e o botão "Equipes, alunos e sorteio" do menu EDF (`edf-tournament`, `edfCompetition`). O menu EDF mantém partida livre e solo.
- `sw.js` e `index.html`: saem `duel.js`, `duel-ui.js`, `roster.js`, `duel.css`; entram `duelo.js` e `duelo-ui.js`. Versão do cache sobe.
- **Dados salvos nos aparelhos:** na primeira abertura, o jogo apaga as chaves `eejam-duel-v1`, `eejam-braga-v1`, `eejam-names-v1-a`, `eejam-names-v1-b`, `eejam-names-v1-m` e `eejam-duel-games-v1`.
- Documentação: `README.md` (seção Modo Duelo, token, turmas) e `MODO_EDF_7_ANO.md` são reescritos para o fluxo novo.

## 4. Estilos

O motor EDF usa as classes `edf-*` de `edf.css`. A configuração nova reaproveita `.edf-grades`, `.edf-topics` e `.edf-setup`; um conjunto pequeno de classes novas (`.duelo-modos`) cobre os dois cartões de conteúdo. Se algum estilo de `duel.css` for usado fora do duelo antigo, ele passa para `edf.css` antes de apagar o arquivo.

## 5. Testes

- **Regras** (`tests/duelo.test.js`): criar duelo Normal e EDF; jogos inválidos para o modo recusados; migração de salvamento antigo (sem `grade` e sem `mode`) vira EDF 7º ano; `mode` guardado depois de `grade`; ida e volta no `localStorage`; sorteio equilibrado e sem repetição para 2 a 8 equipes nos dois modos (os testes atuais de `edf-expanded.test.js` são adaptados).
- **Navegador** (`tests/browser/duelo.spec.js`): sem token; escolha de conteúdo mostra as seções certas; duelo Normal completo (sorteio de 5 s, troca de um aluno, partida, ranking, final, campeã); duelo EDF no 8º ano; limpeza das chaves antigas; recarregar e **Continuar**; o menu EDF não tem mais o botão de campeonato.
- Os testes de navegador que usavam o token ou as turmas (`upgrade.spec.js`, `edf-expanded.spec.js`, `visual.spec.js`) são atualizados.

## 6. Riscos

- **Tamanho:** troca de motor de ~1.000 linhas de interface e 600 de testes. Mitigação: o motor de torneio e as animações já existem no campeonato EDF e só ganham o modo.
- **Histórico do Git:** os primeiros nomes dos alunos de 9º A/B já estão no histórico e no GitHub. Apagar do código não os remove de lá; reescrever o histórico fica fora desta entrega e só será feito se o professor pedir.
- **Perda de dados locais:** duelos antigos de 3 turmas salvos nos aparelhos são apagados (decisão do professor).
- **Jogo Normal sem turmas:** o professor precisa cadastrar as equipes a cada duelo (o botão **Usar equipes cadastradas** ajuda quando elas existem no campeonato por chaveamento).
