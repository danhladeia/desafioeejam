# Arquitetura dos jogos arcade do EDF

Documento para quem vai implementar (Codex ou outro modelo). Objetivo: adicionar seis jogos de ação 2D, estilo arcade, que ensinam conteúdo de Educação Física, usando um motor de canvas compartilhado. As imagens virão das pranchas de `PROMPTS_PRANCHAS_ARCADE.md`; até lá, o jogo usa formas desenhadas pelo próprio canvas.

## 1. Regras do projeto (não quebrar)

- JavaScript puro com módulos ES, sem bibliotecas novas e sem rede. Tudo precisa funcionar offline.
- Tela de lousa Samsung na horizontal. Escala com `rem` (`html{font-size:min(1vw,1.778vh)}`). Sem barra de rolagem em 1920x1080 e 1280x800.
- Dois alunos jogam ao mesmo tempo, cada um na sua arena, com **multitoque independente** por arena (Pointer Events com `setPointerCapture`). O excesso de toques bloqueia só aquele lado por um segundo. Nenhuma mecânica dá ponto por força ou repetição de toques.
- Os dois lados recebem **o mesmo desafio** (mesma semente). Use `ctx.challengeRng` para o que deve ser igual nos dois lados e `ctx.layoutRng` para o que pode diferir.
- Respeitar "Reduzir animações e partículas" (preferência do jogo): sem partículas e com movimento mínimo, mas jogável.
- Lutas e esportes de contato: foco em história, regras e respeito. Nada de golpes em pessoas.
- O conteúdo dos anos 6, 8 e 9 foi extraído por resumo e precisa de conferência do professor antes de uso em turma.

## 2. Contrato com o jogo atual (já existe)

- Cada jogo é uma função `setupX(ctx)` chamada por `createGame` em `games.js` (bloco `switch (id)`, perto da linha 761).
- `ctx` entrega: `id, side, seed, solo, theme (null no modo normal, objeto no EDF), level (1 a 3), doc, view, root, stage, prompt, progress, helper, node, button, listen, active, later, score, finish, feedback, awardSolved, awardWrong, nextChallenge, blockChallenge, unblockChallenge, solveTime, challengeRng, layoutRng, shuffle, seededRandom, normalizeWord, wordBank, setAct, setCancel, onDestroy`.
- Pontuação: `awardSolved(base, alvo)` dá acerto (1000 pontos, mais bônus de até 20 pelo tempo) e `awardWrong(0, alvo)` registra erro. Não invente outro sistema de pontos. Use `ctx.onDestroy(fn)` para limpar tudo (laço de animação, ouvintes, timers).
- Pausa: o jogo pausa por `ctx.active()` (retorna falso quando pausado, terminado ou destruído) e por `later` (timers pausáveis). O laço do canvas deve parar de avançar a simulação quando `active()` for falso.
- Referência de implementação semelhante: `mathgames.js` (`setupBalance`), `wordgames.js` e `jigsaw.js`.
- Registro de jogo em `GAMES` (`games.js`, linha 14): `{id, title, subtitle, icon, rule, duration}`.
- Variante EDF: `edf-theme.js` tem `EDF_VARIANTS` e `makeEdfGame`. O tema vem de `createEdfTheme(topics, grade)` e expõe palavras, cartas e imagens do ano escolhido. Estude como `edf-game.js`, `edf-sequencia.js` e `edf-content.js` lêem os dados de `edf-ano6.js` a `edf-ano9.js` (campos `topics, cards, words, mistakes, categories, sequences`).
- Cache offline: `sw.js` tem `VERSION` e a lista `FILES`. O `app.js` tem o mesmo nome de versão numa verificação. **Os dois precisam subir de versão** a cada entrega, e todo arquivo novo entra em `FILES`.
- Testes: `tests/*.test.js` (Node, `npm test`) e `tests/browser/*.spec.js` (Playwright). Há testes que contam quantos jogos existem; atualize-os.

## 3. Arquivos novos

```
arcade/engine.js     laço, relógio, canvas, pausa, limpeza
arcade/input.js      toques e arrastos por arena (rastro de corte, lançamento)
arcade/sprites.js    carrega imagens, quadros de animação e alternativas desenhadas
arcade/fx.js         partículas, rastros, tremor (respeita "reduzir animações")
arcade/content.js    bancos de itens e perguntas por ano e tema, modo normal e EDF
arcade/slice.js      Corte Certo
arcade/hoops.js      Cesta do Saber (basquete)
arcade/penalty.js    Chute a Gol
arcade/runner.js     Corrida Urbana (skate)
arcade/rally.js      Rally no Vôlei
arcade/match3.js     Combo de Treino
arcade.css           estilos comuns
tests/arcade.test.js e tests/browser/arcade.spec.js
```

## 4. Motor (`arcade/engine.js`)

- `createArena(ctx, {w: 1000, h: 700})` cria um `<canvas>` dentro de `ctx.stage`, com tamanho lógico fixo de 1000x700. O CSS ajusta o canvas à arena preservando a proporção (`aspect-ratio: 10 / 7`). Use `devicePixelRatio` limitado a 2.
- Laço com `requestAnimationFrame`. O passo `dt` é limitado a 50 ms. A simulação só avança quando `ctx.active()` é verdadeiro. A cada quadro, desenhe e chame `update(dt)`.
- A API do jogo para o motor: `{ update(dt), draw(g), onPointer(evento), reset() }`. O motor chama `ctx.onDestroy` para `cancelAnimationFrame` e remover ouvintes.
- `input.js` converte coordenadas da tela em coordenadas lógicas e entrega eventos `down, move, up` por `pointerId`, com captura. Ignore toques fora do canvas.
- `sprites.js`: `loadAtlas(manifest)`; `draw(g, id, x, y, {frame, scale, flip})`. Se a imagem não existir, desenha uma forma colorida com a mesma caixa de colisão. O manifesto vem de um JSON simples: `{id, file, cols, rows, fps, anchor:{x,y}}`. Isso permite trocar as formas pelas pranchas depois sem mudar o jogo.
- Desempenho: sem alocação por quadro nos laços principais, reaproveitar objetos (pool) e limitar partículas a 150 por arena. Meta: 50 quadros por segundo em dois canvases ao mesmo tempo.
- Nunca escreva texto de resposta dentro de imagens. Textos de resposta, perguntas e placar são desenhados no canvas ou em HTML por cima, com a fonte Fredoka.

## 5. Conteúdo (`arcade/content.js`)

Duas fontes, mesma forma de dado:

```
item   { id, rotulo, categoria, tema, pagina?, imagem? }
rodada { pedido, categoriaCorreta, itensCertos[], itensErrados[], explicacao }
pergunta { texto, alternativas[], indiceCorreto, explicacao, pagina? }
```

- **Modo EDF:** monte rodadas a partir de `theme`: cartas (pergunta e alternativas), palavras, categorias e sequências do ano e dos temas escolhidos. Cada rodada cita a página do caderno. Se um tema tiver poucos itens, repita com variação, nunca invente conteúdo novo.
- **Modo normal:** use `learningBank` e `mathQuestions` de `learning.js`.
- Uma função pura `buildRound(rng, level, theme)` por jogo, testável com sementes.
- A explicação aparece em `ctx.helper` depois de cada erro, em uma frase curta, para a criança aprender o motivo.

## 6. Jogos

Todos: duração padrão 60 segundos (campo `duration`), 3 níveis de dificuldade pelo `ctx.level`, e `finish()` ao acabar o tempo ou a meta.

### 6.1 Corte Certo (`slice.js`) — fazer primeiro

- Itens são lançados do fundo da arena em arco, com gravidade, girando. O pedido (`ctx.prompt`) diz a categoria: "Corte só o que é aquecimento".
- O aluno corta arrastando o dedo. Um corte é um segmento entre dois pontos consecutivos do arrastar. Teste interseção segmento × círculo do item. Mostre o rastro.
- Corte certo: `awardSolved(10)`. Corte errado: `awardWrong(0)`, perde uma vida e mostra a explicação. Bomba: perde duas vidas. Item certo que cai sem cortar não pune.
- Vidas: 3. O pedido muda a cada 5 acertos (nova categoria) e sobe o ritmo por nível.
- Itens certos e errados: 2 a 4 por vez no nível 1, até 6 no nível 3.
- Regra anti-bagunça: cada item só pode ser cortado uma vez, e o excesso de movimento rápido sem acertar não vale ponto.
- Aprendizado: categorias do caderno (por exemplo, aquecimento, equipamentos de proteção, capacidades físicas).

### 6.2 Cesta do Saber (`hoops.js`)

- Três cestas (ou quatro no nível 3), cada uma com a letra/resposta de uma alternativa. A pergunta aparece no topo.
- O aluno arrasta a bola para trás e solta, como estilingue. O vetor define velocidade e ângulo. Física simples com gravidade e colisão com aro e tabela.
- Só conta como acerto se a bola entrar na cesta da resposta correta. Cesta errada = erro. Errar o arremesso não pune, mas gasta a bola (5 bolas por pergunta).
- Prevenção de abuso: um arremesso por vez; o próximo só depois de a bola sair da arena.

### 6.3 Chute a Gol (`penalty.js`)

- O gol tem 3 cantos (ou 5 no nível 3), cada um associado a uma alternativa. O aluno arrasta da bola para o canto e solta; a força define a velocidade.
- O goleiro, controlado pelo jogo, mergulha para um canto escolhido pela semente (igual nos dois lados). Se a bola entra no canto da resposta certa e o goleiro não pega, é gol (`awardSolved`).
- Cinco cobranças por pergunta rápida. Defesa do goleiro no canto certo conta como erro leve (sem ponto).

### 6.4 Corrida Urbana (`runner.js`)

- Skatista em 3 pistas, visto de costas. Toque ou arraste lateral troca de pista; deslize para cima pula; deslize para baixo agacha.
- Itens: coletáveis de segurança (capacete, joelheira, água) dão `awardSolved(5)`. Obstáculos: batida perde uma vida (3 vidas). Portões de pergunta: três portais com respostas; atravessar o correto dá `awardSolved(15)`, o errado `awardWrong`.
- Gere a pista por semente (`challengeRng`), com a mesma sequência nos dois lados. Velocidade sobe por nível e por tempo, com teto.
- Aprendizado: o que faz parte do equipamento de segurança e das boas práticas na cidade (tema "Aventura urbana segura").

### 6.5 Rally no Vôlei (`rally.js`)

- Uma bola chega em arco. O aluno toca na hora certa (anel que encolhe) e escolhe o gesto: manchete, toque ou cortada, conforme a situação mostrada no pedido ("bola baixa": manchete).
- Acerto de tempo + gesto certo: `awardSolved`. Gesto errado ou tempo ruim: erro.
- Sequência de 8 trocas por rodada; a bola acelera por nível.

### 6.6 Combo de Treino (`match3.js`) — por último

- Tabuleiro 6x6 (8x8 no nível 3) com 6 tipos de peça. Trocar duas peças vizinhas por arrasto ou toque-toque, formando 3 ou mais iguais.
- Missão: o pedido diz o que juntar ("junte 9 de Flexibilidade"). Só peças da missão contam pontos; a missão muda a cada conclusão.
- Peças especiais para 4 ou mais. Queda de peças com animação. Gerador sem combos prontos no início e sem tabuleiro sem jogada (reembaralha).
- Mesmo tabuleiro inicial nos dois lados (semente).

## 7. Integração

1. Acrescente cada jogo a `GAMES` em `games.js` (id, título, ícone, regra, duração) e ao `switch`.
2. Crie a variante EDF em `edf-theme.js` (`EDF_VARIANTS`) e confirme que aparece na lista de desafios do EDF, no sorteio do Duelo e nos jogos válidos do campeonato.
3. Selos de menu: use ícones simples até as imagens chegarem. Registre em `new-art.js`/`ui-art.js` só depois de existirem os arquivos.
4. Acrescente todos os arquivos novos a `sw.js` (`FILES`) e suba a versão em `sw.js` e `app.js`.
5. Atualize a documentação (`README.md`, `MODO_EDF_7_ANO.md`) com os novos jogos e a conferência de conteúdo.

## 8. Critérios de aceitação (por jogo)

- Testes unitários passam (`npm test`): rodadas determinísticas por semente; pontuação (`awardSolved`/`awardWrong`) correta; nenhuma rodada com resposta impossível; mesmo desafio nos dois lados.
- Testes de navegador (Playwright), em 1920x1080 e 1280x800: sem rolagem; dois lados jogando ao mesmo tempo com toques simultâneos; pausa e retomada; ao destruir o jogo, não sobra laço de animação nem ouvinte.
- Desempenho medido no navegador: sem quedas fortes de quadros com dois canvases ativos.
- Modo "reduzir animações": o jogo continua jogável.
- Funciona offline depois da primeira abertura (cache novo instalado).
- Nenhum texto de resposta fica dentro de imagem.

## 9. Ordem e processo

1. Motor + Corte Certo, com formas desenhadas. Peça aprovação visual antes de seguir.
2. Cesta do Saber e Chute a Gol, que compartilham o lançamento por arrasto.
3. Corrida Urbana.
4. Rally no Vôlei.
5. Combo de Treino.
6. Trocar as formas pelas imagens das pranchas (via manifesto de sprites).

Regras de trabalho:
- Um jogo por commit; rode `npm test` e os testes de navegador antes de cada commit.
- Mexa só nos arquivos listados e nos pontos de integração. Não refatore jogos existentes.
- Não envie nada ao repositório remoto sem pedido do professor.
- Registre no fim de cada entrega o que não foi testado (por exemplo, o desempenho na lousa real).
