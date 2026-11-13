# Plano: limpeza do projeto e versão mobile individual (vertical)

Data: 13/11/2026. Só planejamento, nada deste plano foi implementado.
Ordem: **1) limpeza → 2) mobile vertical individual → 3) multiplayer online** (fase futura, com os pré-requisitos já preparados nas fases 1 e 2).

## Situação medida hoje

- 4.900 linhas de JS na raiz, 23 jogos visíveis, 797 arquivos no cache offline, **56 MB** baixados na primeira abertura (o celular precisaria baixar tudo antes de jogar).
- `assets/` com 229 MB no disco; 147 MB são pranchas originais (não vão para o Git nem para o cache, só pesam na pasta).
- A tela de jogo foi desenhada para duas arenas lado a lado na horizontal. A escala usa `html{font-size:min(1vw,1.778vh)}` e existe a tela "Gire a tela para jogar na horizontal".
- O modo "solo" já existe (sozinho ou contra o robô). O robô (`bot` em `play-session.js`) já funciona como um "adversário plugável": é o ponto de encaixe do multiplayer.
- Os desafios já são determinísticos por semente (`seededRandom`, `layoutRng`): dois jogadores recebem o mesmo desafio. Isso serve de base para duelos online.

---

## Fase 1 — Limpeza de funcionalidades inúteis

### 1A. Candidatos a remoção (verificados no código)

| Item | Evidência | Ação proposta |
|---|---|---|
| **Duelo antigo**: `duel.js`, `duel-ui.js`, `roster.js`, `duel.css` (parte), `tests/duel.test.js`, `tests/browser/duel.spec.js` | O botão Duelo agora abre o Modo Duelo novo (`edf-duel*`). `duel-ui.js` só é importado por `app.js` para mostrar resultado de partidas antigas | Remover. Antes, trocar `duelUI.result` por `edfDuelUI.result` e **migrar o CSS dos carretéis** (`.duel-draw .reel…`, hoje em `duel.css`) para `edf.css` |
| **Rota do EMTI** (jogo desativado) | `disabled: true` em `games.js`; ainda existe `setupRota` e conteúdo associado | Remover o código e o conteúdo do jogo |
| `arcade/throw.js` | Importado em `games.js`, mas nenhum jogo usa mais | Remover |
| **Vôlei antigo** (`arcade/volley.js`, id `rally`) | Duplica o Vôlei Duplo; o `rally` é o único vôlei de 1 jogador | Decisão do usuário (ver perguntas). Sugestão: manter só um, usando o Vôlei Duplo com robô |
| Modo **EDF Torneio** (`edf-tournament`) e **campeonato com chave** (`bracket`, `championship-ui.js`, até 64 equipes) | Três formas de "competir" (campeonato, EDF Torneio, Modo Duelo). O Modo Duelo cobre equipes, rodadas e final | Decisão do usuário. Sugestão: manter só o Modo Duelo e **Jogar solo** |
| Pranchas e sprites sem uso: `sprites/lutas/`, `sprites/queimada/`, atlas antigos em `assets/visual/concepts/` (36 MB) e `arcade-game-icons-*`, `slice-*-v1.png` se nenhum código os referencia | Medir com um script que cruza arquivos do disco × referências em `*.js`/`*.css` | Remover os não referenciados; manter pranchas originais fora do repositório |
| **Documentos soltos** na raiz (`DESENVOLVIMENTO_8_JOGOS.md`, `ATUALIZACAO_JOGOS.md`, 4 `PROMPTS_PRANCHAS_*.md`, `MODO_EDF_7_ANO.md`, etc.) | Poluem a raiz | Mover para `docs/` e `docs/prompts/` |
| Testes de navegador antigos (`tests/browser/*.spec.js`) | Vários referem token, Rota e o duelo antigo | Reescrever só os que protegem o que ficou; apagar o resto |
| Funções de administração (diagnóstico, backup, importar) | Úteis para o professor, inúteis para o aluno no celular | Manter, mas escondidas em Configurações > Professor |

### 1B. Método (seguro)

1. Rodar `npm test` e anotar a linha de base (hoje 108 passando).
2. Um commit por item acima, sempre com: remover código → remover do `sw.js` (lista `FILES`) → remover testes do item → `npm test` → conferir no navegador que menu, catálogo, Modo Duelo e solo abrem.
3. Script `tools/auditar_assets.py` que lista arquivos nunca referenciados; só apagar depois de revisar a lista.
4. Atualizar a versão do cache (`sw.js`, `app.js`, `tests/sw-files.test.js`) uma vez por lote.

**Critério de pronto:** mesmos 23 jogos funcionando (menos os que forem decididos), 0 imports quebrados, cache offline menor, testes verdes, raiz do projeto só com código e `docs/`.

---

## Fase 2 — Mobile vertical, jogo individual

### 2A. Princípios

- Um jogador, tela em pé, uma mão ou duas, toque com o polegar.
- Mesma base de código: a lousa continua funcionando (o layout escolhe por orientação, não por dispositivo).
- Sem multiplayer nesta fase, mas com a interface "adversário" já separada (ver Fase 3).

### 2B. Casca do app (menu, catálogo, partida)

1. **Escala**: hoje `html{font-size:min(1vw,1.778vh)}` pressupõe 16:9 deitado. Em retrato usar `min(2.6vw, 1.3vh)` (referência 390×844). Remover/ocultar o aviso "Gire a tela" em retrato.
2. **Início**: lista vertical com o logo, **Jogar solo** em destaque, **Modo Duelo** (só professor), configurações. Catálogo em grade de 3 colunas com as capas novas, rolagem vertical, rodapé fixo.
3. **Partida solo em retrato**: arena única ocupando a tela; HUD em sobreposição fina no topo (pontos, tempo, pausa); instrução curta que some após 3 s; sem molduras (o "modo foco" já ajuda).
4. **Resultado**: ranking pessoal (melhores marcas por jogo e dificuldade já existem), botão "Jogar de novo" e "Outro jogo".
5. **PWA**: manifest com `orientation: portrait` no mobile, ícones, `viewport-fit=cover`, áreas seguras (`env(safe-area-inset-*)`), `touch-action:none` na arena, sem zoom por duplo toque, **Wake Lock** para a tela não apagar, **vibração** curta nos acertos (opcional), desbloqueio de áudio no primeiro toque.
6. **Peso**: trocar o pré-cache total de 56 MB por **cache por jogo**: núcleo (≈3 MB) no primeiro acesso; os assets de cada jogo são baixados ao abrir o jogo (e ficam em cache). Capas em WebP menores (≈20 KB cada).
7. **Desempenho**: limitar `devicePixelRatio` a 2 nos canvas, pausar `requestAnimationFrame` com a aba oculta, descarregar sprites ao sair do jogo.

### 2C. Adaptação por jogo

`createArena` e o contrato de `ctx` ganham `ctx.portrait` e aceitam tamanho lógico por orientação (ex.: 720×1280 em pé).

| Grupo | Jogos | Esforço | O que muda |
|---|---|---|---|
| **A. DOM (texto, números)** | Memória, Monte a EEJAM, Caça-Palavras, Desembaralha, Forca, Sílabas, Caça-Erro, Balança, Palavra Secreta, Cabo de Guerra, Toque Turbo | Baixo | Uma coluna, botões grandes (mín. 48 px), teclado QWERTY da Forca ocupando a largura, peças do quebra-cabeça maiores |
| **B. Canvas que já combina com retrato** | Corrida Urbana (skate), Descida do Rio, Roda de Capoeira, Pose por Pose | Baixo a médio | Pistas verticais já são a ideia; só trocar o tamanho do canvas e as posições do herói |
| **C. Canvas com ajuste de enquadramento** | Corte Certo, Cesta, Chute a Gol, Arco e Flecha, Vôlei (rally) | Médio | Novo enquadramento em pé (cena recortada/alta), cesta e alvos reposicionados, gestos iguais |
| **D. Canvas horizontal por natureza** | Mountain Bike | Alto | Opção 1: manter horizontal com aviso para girar. Opção 2: refazer em visão vertical (descida por cima). Sugestão: Opção 1 no começo |
| **E. Dois jogadores na mesma tela** | Vôlei Duplo, Futebol de Disco | — | Ficam **ocultos no mobile individual**; voltam na Fase 3 como duelo online ou contra o robô |

Ordem sugerida: casca (2B) → grupo A → grupo B → grupo C → D.

### 2D. Testes e aceite

- Playwright com viewports 360×740, 390×844 e 412×915 (retrato) e a lousa 1920×900; verificar: nada cortado, sem rolagem horizontal, botões ≥ 44 px, jogos jogáveis por toque.
- Teste de carga: primeira abertura abaixo de ~5 MB e o jogo inicial em menos de 3 s em 4G.
- Conferir em celular real (Android Chrome e iOS Safari): áudio, tela cheia, instalar na tela inicial, offline.

**Critério de pronto:** os jogos dos grupos A, B e C jogáveis em retrato, solo (sozinho e contra o robô), sem cortes, instalável como app.

---

## Fase 3 — Multiplayer online (futura, só o desenho)

Objetivo: jogadores aparecem online e fazem desafios entre si.

### 3A. Preparar já nas fases 1 e 2

- Interface única de **adversário** em `play-session.js`: hoje o robô, amanhã um jogador remoto (`opponent.onScore`, `opponent.finished`). Nada de lógica específica do robô fora dela.
- **Identidade do jogador**: apelido + avatar (Faísca, Pipo etc.), salvo localmente; sem dado pessoal de aluno (ver regra do repositório sobre nomes de menores).
- **Semente do desafio** já enviada como dado da partida.

### 3B. Caminho recomendado (em duas etapas)

1. **Desafio assíncrono** (mais simples e robusto): o jogador cria um desafio (jogo + semente + dificuldade), outro aceita e joga **a mesma semente**; o servidor compara as pontuações. Funciona com conexão ruim, sem sincronização em tempo real.
2. **Tempo real** (depois): lobby de jogadores online, convite, partida simultânea com placar ao vivo trocando só pontuações (cada um joga na própria tela, como já acontece na lousa). Jogos de bola compartilhada (Vôlei Duplo, Disco) precisam de sincronização de física: deixar por último.

### 3C. Infraestrutura (decisão futura)

O hospedagem atual é estática (GitHub). Para online é preciso um serviço de backend. Opções: Supabase (Realtime + banco), Firebase, ou um servidor WebSocket próprio. Pontos a resolver: contas anônimas, moderação de apelidos, antitrapaça básica (validar pontuação máxima plausível por jogo), LGPD para menores (consentimento da escola, sem dados reais).

---

## Decisões tomadas (13/11/2026)

1. **Vôlei antigo (`rally`)**: remover. Fica só o Vôlei Duplo; no solo ele roda contra o robô.
2. **Campeonato com chave e EDF Torneio**: remover. Ficam o Modo Duelo e o Jogar solo.
3. **Mountain Bike no celular**: manter horizontal, pedindo para girar a tela.
4. **Conteúdo no mobile**: só o modo normal. O conteúdo EDF por ano fica para depois.

Consequência: o Vôlei Duplo deixa de ser "oculto no mobile" e passa a precisar de um modo solo contra o robô (entra na Fase 2, grupo C).

## Resumo de entregas

1. Fase 1: projeto menor e organizado, mesmos jogos válidos, cache menor.
2. Fase 2: app em pé, solo, instalável, jogos A/B/C adaptados, cache por jogo.
3. Fase 3: desenho aprovado antes de qualquer servidor.
