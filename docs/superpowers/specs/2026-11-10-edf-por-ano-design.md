# Modo EDF por ano (6º ao 9º), Forca com boneco e Ordene a Sequência

Data: 2026-11-10 · Estado: aguardando revisão do professor

## Objetivo

Hoje o Modo EDF só existe para o 7º ano. Esta entrega:

1. Cria um seletor de ano (6º, 7º, 8º e 9º) no menu EDF. Cada ano usa o conteúdo do seu caderno (`Conteudos EDF/Caderno_DED_Express_EF{6,7,8,9}_leve.pdf`).
2. Adapta os 13 jogos EDF já existentes aos quatro anos.
3. Troca o foguete da Forca por uma forca com boneco tradicional, em todos os modos.
4. Cria um jogo novo, **Ordene a Sequência**, disponível só no EDF.

Fora do escopo: outros jogos novos (Mito ou Fato, Ache o Risco, Monte o Kit, Ligue os Pontos, Quadra Tática, Plano de Trilha, Detetive de Anúncio), mudanças no conteúdo do modo normal além da Forca, nova música ou arte além das figuras de glossário, e mudanças nas regras de campeonato.

## Decisões já tomadas com o professor

- "Turma" significa o ano escolar (6º, 7º, 8º e 9º), uma opção por caderno.
- O boneco da Forca vale no modo normal e no EDF, com 6 erros. A Palavra Secreta continua com o foguete.
- Tudo vai em uma entrega só.
- O único jogo novo é Ordene a Sequência.

## 1. Conteúdo por ano

**Arquivos novos**

- `edf-ano6.js`, `edf-ano7.js`, `edf-ano8.js`, `edf-ano9.js`: um módulo por ano.
- `edf-anos.js`: registro que devolve o módulo de um ano (`getGrade(n)`) e lista os anos disponíveis.

**Cada módulo exporta**: `source` (título e arquivo do caderno), `topics` (as 3 unidades; no 7º ano, mais o complemento Jogos de tabuleiro), `defaultTopics`, `cards`, `words`, `mistakes`, `categories` (Rota dos Saberes), `crossActivities`, `imageSizes` e `sequences`.

**O 7º ano** muda de arquivo e ganha apenas as sequências do jogo novo; o resto do conteúdo existente não é alterado. Seus ids (`ginastica`, `aventura`, `lutas`, `tabuleiro`, `g1`…) e as chaves de recorde solo (`edf:ginastica+aventura+lutas:forca`) continuam iguais. O complemento Jogos de tabuleiro tem 1 sequência por nível (3 no total) em vez de 2.

**6º, 8º e 9º anos** usam ids com prefixo (`e6-`, `e8-`, `e9-`) nas unidades e nas cartas, e chaves de recorde com o ano (`edf6:`, `edf8:`, `edf9:`).

**Conteúdo a escrever por unidade** (3 unidades por ano):

| Item | Quantidade | Regra |
|---|---|---|
| Cartas de quiz | 9 (3 por nível) | Página do caderno citada em cada carta. |
| Palavras | 16 | Com sílabas, dica e figura. |
| Frases do Caça-Erro | 9 (3 por nível) | Uma palavra com erro de escrita por frase. |
| Classificação (Rota dos Saberes) | 6 situações em 3 categorias | Quando só uma unidade é marcada, usa as categorias dela. Com mais de uma, usa `crossActivities`. |
| Sequências (Ordene a Sequência) | 6 (2 por nível) | Ver seção 4. |

O conteúdo vem do texto dos PDFs, com a página citada. Unidades:

- **6º ano:** Corpo em forma; Aventura na cidade; Lutas do Brasil.
- **8º ano:** Rede/parede e campo e taco; Invasão e combate: tática; Esporte e sociedade.
- **9º ano:** Ginásticas e corpo; Aventura na natureza; Lutas do mundo.

Em temas sensíveis (apostas, doping, anabolizantes, padrões de beleza, racismo), as cartas só repetem o que o caderno diz, sem acrescentar fatos externos.

**Figuras.** Para cada ano novo, extraio as 12 ilustrações do glossário (página 25 do PDF), com transparência, para `assets/visual/edf/ano6`, `ano8` e `ano9`, com um `proveniencia.json` por pasta (arquivo, página e caderno de origem). As ilustrações do 7º ano ficam onde estão. Se uma figura não puder ser extraída com qualidade, a palavra usa o ícone de livro, que já existe.

**Funções que ganham o parâmetro `ano`** (padrão 7, para manter o comportamento atual):

- `normalizeEdfTopics(ids, ano)` e `edfPool(ids, level, ano)`.
- `edfRecordId(ids, ano)` e `makeEdfGame(base, topics, ano)`.
- `createEdfTheme(topics, ano)`.
- `createGame({..., edfGrade})`, repassado por `play-session.js` a partir de `g.edfGrade`.

## 2. Menu, configuração e campeonato

- O botão da tela inicial vira **EDF**, sem "7º ano".
- A tela EDF abre com 4 cartões de ano. O ano escolhido destaca o cartão e troca a lista de unidades, a contagem de cartas, o painel "Conferir cartas e fontes" e os textos (eyebrow, subtítulo, "Desafio • Nº ano").
- **Configuração salva** (`eejam-edf-v1`): ganha `grade` e `topicsByGrade`. Sem o campo `grade`, vale 7 e os temas antigos passam para `topicsByGrade[7]`. Ao trocar de ano, as unidades marcadas voltam às unidades padrão daquele ano, salvo se o aparelho já guardar a seleção anterior desse ano.
- **Campeonato EDF** (`edf-duel.js`, `edf-duel-ui.js`): `createEdfDuel` recebe e guarda `grade`; ao reconstruir um campeonato salvo sem `grade`, usa 7. A tela "Equipes, alunos e sorteio" usa o ano escolhido no menu. O campeonato continua independente do campeonato normal.
- Os recordes solo são separados por ano, jogo, unidades e dificuldade.

## 3. Forca com boneco

- Novo arquivo `forca-boneco.js` exporta `createHangman()`, que devolve um elemento SVG com a forca de madeira sempre visível e o boneco em 6 partes, na ordem: cabeça, tronco, braço esquerdo, braço direito, perna esquerda e perna direita. O método `setMistakes(n)` mostra as primeiras `n` partes.
- `setupSecret()` em `games.js` (jogo `forca`) passa a usar o SVG no lugar da barra de combustível. O texto fica "Erros: n de 6", e o SVG tem `role="img"` com `aria-label` equivalente (por exemplo, "Boneco da forca, 3 de 6 erros"). Com 6 erros a rodada acaba como hoje.
- Cada parte aparece com um traço animado curto. Com animações reduzidas, aparece sem animação.
- A Palavra Secreta (`setupSecretRace` em `wordgames.js`) não muda.
- A regra do jogo e o texto de ajuda deixam de falar em combustível e foguete. Isso vale tanto no modo normal (`GAMES`) quanto no EDF (`EDF_VARIANTS.forca`).
- Estilos em `play.css`.

## 4. Ordene a Sequência (novo, só no EDF)

**Registro.** Entrada nova em `edfGames` (lista do menu EDF e do campeonato EDF) com id `ordem`, título "Ordene a Sequência", duração de 90 segundos e ícone já existente em `ui-art.js`. O modo normal (`GAMES`) não muda. `createGame` ganha `case 'ordem'` que chama `setupSequence(ctx, edfTopics, edfGrade)`, em `edf-sequencia.js`.

**Como se joga.** A tela mostra uma pergunta ("Coloque em ordem: …") e uma lista de *n* linhas numeradas de 1 a *n*, cada uma com um cartão, já embaralhados. O jogador arrasta um cartão sobre outro, ou toca em dois cartões, e os dois trocam de lugar (alternativa sem arrastar). O botão **Conferir ordem** fica sempre visível. Essa lista única é mais compacta que "bandeja + espaços" e cabe em telas 16:9.

- Uma tentativa por sequência. Acerto: `awardSolved(1000)`. Erro: `awardWrong(0)` e a ordem correta é mostrada com a explicação do caderno, no mesmo formato de feedback das outras cartas EDF.
- Dificuldade: nível 1 usa 3 cartões, nível 2 usa 4 e nível 3 usa 5.
- A ordem inicial é sorteada pela semente da partida, igual para os dois lados no duelo, e nunca começa já na ordem correta.
- O jogo termina pelo relógio (90 s), com o mesmo bônus de rapidez, pausa, desempate e recordes dos outros jogos EDF. Funciona em solo e em duelo.
- Aproveita `attachDrag` de `drag.js` (`onDrop` e `onTap`). Os controles têm no mínimo a mesma área de toque dos outros jogos.

**Conteúdo.** Cada unidade tem 6 sequências (2 por nível), com `id`, `topic`, `level`, `page`, `prompt`, `steps` (na ordem correta) e `explain`. Exemplos vindos do caderno: aquecimento → parte principal → volta à calma (7º); patins → skate → slackline → parkour (6º, com as décadas citadas); amador → profissional → espetáculo (8º); passos do ukemi, da checagem em dupla e da frequência cardíaca (9º e 6º).

## 5. Testes e entrega

- **Regras e conteúdo** (`tests/edf-expanded.test.js`): os checks atuais passam a percorrer os 4 anos e todas as unidades. Para cada unidade: ≥ 8 palavras, ≥ 1 figura, ≥ 2 cartas, ≥ 2 frases do Caça-Erro e ≥ 2 sílabas por nível, mais 2 sequências por nível com 3, 4 e 5 passos (1 por nível no complemento de tabuleiro). Também: ids únicos por ano, `edfRecordId` do 7º ano igual ao atual, config antiga sem `grade` caindo no 7º ano, campeonato salvo sem `grade` caindo no 7º ano.
- **Navegador** (`tests/browser/*.spec.js`): abrir os 14 jogos EDF em solo e duelo em pelo menos um ano novo, trocar de ano no menu, Forca com boneco (de 0 a 6 partes, no modo normal e no EDF), Ordene a Sequência (arrastar, tocar e tocar, acerto, erro, nível), campeonato EDF salvo e retomado com o ano.
- **Revisão de testes existentes** que citam combustível/foguete na Forca (`tests/browser/game-contracts.spec.js`) e os textos "7º ano".
- **Offline:** incluir os novos módulos, figuras e `forca-boneco.js`/`edf-sequencia.js` no cache de `sw.js`, e subir a versão do cache em `sw.js` e `app.js`.
- **Documentação:** atualizar `MODO_EDF_7_ANO.md` (cobre todos os anos; o nome do arquivo não muda) e `README.md`.
- Nenhum commit inclui as alterações do Codex que já estavam pendentes na árvore de trabalho.

## 6. Riscos

- **Conteúdo escrito por IA a partir dos PDFs:** o professor precisa conferir cartas, respostas e sequências dos anos 6, 8 e 9 pelo painel "Conferir cartas e fontes" antes de usar em turma.
- **Extração de figuras:** a qualidade depende de cada PDF; o plano reserva a extração para o começo, antes de escrever as palavras que dependem das figuras.
- **Volume:** cerca de 27 cartas, 48 palavras, 27 frases, 18 sequências e 12 figuras por ano novo. O plano divide o trabalho por ano, cada um testável sozinho.
- **Forca e testes antigos:** os testes que dependem do foguete serão atualizados junto com o jogo. A Palavra Secreta, que mantém o foguete, é coberta por um teste novo para garantir que não mudou.
- **Arte do catálogo:** o selo da Forca no catálogo do modo normal (`assets/visual/menu/seal-forca.webp`) é uma imagem de foguete. Trocar a imagem exige gerar arte nova e fica fora desta entrega; o jogo em si passa a mostrar o boneco.
- **Linha de base do Git:** o repositório tem edições do Codex ainda sem commit nos mesmos arquivos que este trabalho altera. O plano começa com um commit de linha de base (com autorização do professor) num ramo novo, para que os commits seguintes contenham só este trabalho.
