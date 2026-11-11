# Os 8 jogos escolhidos (2 por ano) — prompt de desenvolvimento e imagens

Este documento tem duas partes:

- **Parte 1 — Prompt de desenvolvimento** para colar no Codex (ou outro agente de código).
- **Parte 2 — Prompts de imagem** para o ChatGPT, todos pedindo **PNG com fundo transparente**, para o recorte ser preciso.

Base técnica: `ARQUITETURA_ARCADE.md` (motor e contrato), `JOGOS_POR_SERIE.md` (os 20 jogos) e `PROMPTS_PRANCHAS_ARCADE.md` (pranchas anteriores, com fundo verde; use este documento no lugar delas quando houver conflito).

## Os 8 escolhidos

Escolhi pelo conteúdo, pelo movimento na tela e pela economia de programação: **4 motores cobrem os 8 jogos**.

| Ano | Jogo | Motor | Por que entrou |
| --- | --- | --- | --- |
| 6º | **Corte Saúde** | Corte | Mais fácil de acertar na lousa (arrastar o dedo) e valida o canvas e o toque. Cobre Corpo em forma. |
| 6º | **Roda de Capoeira** | Ritmo | Visual forte e cultura brasileira. Cobre Lutas do Brasil sem nenhuma cena de golpe. |
| 7º | **Corrida Urbana de Skate** | Pistas | O mais parecido com Subway Surfers e liga direto à segurança urbana. |
| 7º | **Pose por Pose** | Ritmo | Reaproveita o motor da capoeira e cobre Ginástica e saúde. |
| 8º | **Passe Certo** | Arrastar | O único que ensina tática de invasão de verdade, com defensores correndo. |
| 8º | **Rally na Rede** | Ritmo | Reaproveita o motor de ritmo e cobre rede/parede. |
| 9º | **Descida do Rio** | Pistas | Reaproveita o motor de pistas e cobre Aventura na natureza. |
| 9º | **Volta ao Mundo das Lutas** | Arrastar (mapa) | Mapa-múndi com avião voando; ensina origem cultural das lutas do mundo. |

Motores: **Corte** (1 jogo), **Ritmo** (3 jogos), **Pistas** (2 jogos), **Arrastar** (2 jogos).

---

# PARTE 1 — Prompt de desenvolvimento (colar no Codex)

```
Você vai implementar 8 jogos de ação 2D (canvas) no projeto "Duelo do Futuro — EEJAM 2027", um jogo escolar offline em JavaScript puro (módulos ES, sem dependências), para lousa digital Samsung na horizontal, com dois alunos jogando ao mesmo tempo, um em cada metade da tela.

LEIA ANTES DE QUALQUER CÓDIGO (nesta ordem):
1. ARQUITETURA_ARCADE.md — contrato com createGame/ctx de games.js, motor de canvas, pontuação, cache offline, critérios de aceitação.
2. JOGOS_POR_SERIE.md — a ficha de cada jogo (ação, aprendizado, regras de toque).
3. DESENVOLVIMENTO_8_JOGOS.md (este arquivo) — as especificações abaixo e os prompts de imagem.
4. games.js (createGame, ctx, GAMES), mathgames.js e jigsaw.js (exemplos de setupX), edf-theme.js e edf-ano6.js a edf-ano9.js (conteúdo EDF por ano), sw.js e app.js (cache offline).

REGRAS INEGOCIÁVEIS
- Só JavaScript puro, módulos ES, sem bibliotecas novas, sem rede. Tudo funciona offline.
- Layout em rem, sem rolagem em 1920x1080 e 1280x800.
- Cada aluno joga na sua arena com Pointer Events (setPointerCapture) e multitoque independente. O excesso de toques bloqueia só aquele lado por 1 segundo. Nenhuma mecânica dá ponto por força ou por repetição de toques.
- Alvos de toque com no mínimo 6 rem de lado. Gestos de no máximo metade da arena. Janela de timing de 250 ms no nível 1 (configurável em uma constante).
- Mesmo desafio nos dois lados (use ctx.challengeRng para o que deve ser igual; ctx.layoutRng para o resto).
- Use ctx.awardSolved / ctx.awardWrong para pontuar e ctx.onDestroy para limpar laço de animação, ouvintes e timers. Respeite ctx.active() (pausa).
- Modo "Reduzir animações" continua jogável (sem partículas e sem tremor).
- Nenhuma cena mostra golpes em pessoas. Lutas = ritmo, história, cultura e respeito.
- Texto de resposta e placar são desenhados no canvas ou em HTML, nunca dentro das imagens.
- Não refatore os jogos existentes. Mexa só nos arquivos novos e nos pontos de integração (games.js, edf-theme.js, sw.js, app.js, testes, README).

ENTREGUE EM ETAPAS E PARE PARA APROVAÇÃO APÓS CADA UMA
Etapa 0 — Motor comum: pasta arcade/ com engine.js (canvas lógico 1000x700, laço com dt limitado a 50 ms, pausa), input.js (toque por pointerId, rastro, arrasto e lançamento), sprites.js (carrega atlas e quadros; se a imagem faltar, desenha uma forma colorida com a mesma caixa), fx.js (partículas e tremor, limite de 150 por arena), content.js (bancos de itens e perguntas por ano e tema, modo EDF e modo normal), arcade.css. Testes unitários do motor e do conteúdo.
Etapa 1 — Corte Saúde (6º).
Etapa 2 — Motor de ritmo + Roda de Capoeira (6º), Pose por Pose (7º) e Rally na Rede (8º).
Etapa 3 — Motor de pistas + Corrida Urbana de Skate (7º) e Descida do Rio (9º).
Etapa 4 — Passe Certo (8º) e Volta ao Mundo das Lutas (9º).
Etapa 5 — Troca das formas desenhadas pelas imagens (veja "Imagens" abaixo), cache offline e documentação.

ESPECIFICAÇÃO DOS JOGOS
Todos: duração 60 s (campo duration), 3 níveis pelo ctx.level, finish() no fim do tempo ou da meta. Registro em GAMES (games.js, id em minúsculas sem acento) e variante EDF em EDF_VARIANTS (edf-theme.js), aparecendo na lista do ano certo e no sorteio do Duelo EDF e do campeonato. As rodadas vêm de createEdfTheme(topics, grade) (cartas, palavras, categorias, sequências, com a página do caderno). Não invente conteúdo; se faltar item, varie o que existe. Cada erro mostra em ctx.helper uma frase curta com o motivo.

1) corte-saude (6º, tema "Corpo em forma"): itens voam em arco do fundo (gravidade, giro). O pedido diz a categoria ("corte só o que ajuda o corpo em forma"). Corte = segmento entre dois pontos consecutivos do arrasto, testado contra o círculo do item. Certo: awardSolved(10). Errado: awardWrong e perde 1 vida. Bomba: perde 2 vidas. Item certo que cai não pune. 3 vidas. O pedido muda a cada 5 acertos. Quantidade simultânea: 2 a 4 (nível 1), até 6 (nível 3).
2) capoeira (6º, "Lutas do Brasil"): ritmo. Anéis encolhem sobre 3 a 4 zonas de toque (berimbau, atabaque, pandeiro, agogô). Toque dentro da janela = acerto (awardSolved(5)); fora = erro leve (sem ponto). A cada 8 acertos aparece uma pergunta de 3 alternativas sobre história e instrumentos da capoeira (carta do tema). Os personagens da roda dançam (ginga) mais rápido conforme o combo.
3) skate (7º, "Aventura urbana segura"): corredor de costas em 3 pistas. Deslizar para os lados troca de pista; para cima pula; para baixo agacha. Coletáveis de segurança dão awardSolved(5). Obstáculo: perde vida (3). Portões de pergunta: 3 portais com respostas, um por pista; correto awardSolved(15), errado awardWrong. A pista vem da semente (igual nos dois lados). Velocidade sobe por nível e por tempo, com teto.
4) pose-por-pose (7º, "Ginástica e saúde"): ritmo. Uma sequência de poses de ginástica aparece (de 3 poses no nível 1 a 6 no nível 3). O aluno repete tocando, na ordem, os botões de pose (silhuetas) no compasso da batida. Acerto de sequência completa = awardSolved(15). Cada pose mostra qual capacidade física trabalha.
5) passe-certo (8º, "Invasão e combate: tática"): quadra vista de cima. Defensores correm em trajetórias previsíveis (da semente). O aluno arrasta da bola para um companheiro; o passe só vale se o companheiro estiver livre (sem defensor a menos de um raio) quando a bola chegar. Passe bom = awardSolved(10); interceptado = awardWrong. A bola leva um tempo de voo, então o aluno precisa prever o espaço livre. Mostre a explicação tática em ctx.helper.
6) rally-rede (8º, "Rede/parede"): ritmo com escolha. Uma bola cruza a rede em arco; um anel marca o tempo. O aluno toca no tempo e escolhe o gesto (manchete, toque, cortada) conforme o pedido da situação. Tempo e gesto certos = awardSolved(10). Oito trocas por rodada; a bola acelera por nível.
7) descida-rio (9º, "Aventura na natureza"): mesmo motor de pistas do skate, com barco em 3 pistas descendo corredeira. Desvia de pedras e lixo; pega equipamentos e itens de preservação; portões de pergunta sobre natureza e segurança.
8) volta-mundo (9º, "Lutas do mundo"): mapa-múndi vazio de texto. Um avião cruza o mapa soltando cartões de lutas (judô, karatê, taekwondo, muay thai, capoeira, boxe, kung fu, sumô; ajuste a lista às páginas do caderno do 9º ano). O aluno arrasta o cartão ao país de origem antes de sair da tela. Zonas de soltura generosas (região do país, não o contorno). Certo = awardSolved(10) e mostra uma curiosidade; errado = awardWrong e mostra a origem certa.

CRITÉRIOS DE ACEITAÇÃO (por jogo)
- npm test passa. Testes unitários: rodadas determinísticas por semente, pontuação correta, nenhuma rodada impossível, mesmo desafio nos dois lados.
- Testes de navegador (Playwright) em 1920x1080 e 1280x800: sem rolagem, dois lados com toques simultâneos, pausa e retomada, ao destruir não sobra laço de animação nem ouvinte.
- Modo de reduzir animações jogável. Funciona offline com o cache novo.
- Um jogo por commit, mensagem em português. Não envie ao repositório remoto sem pedido.
- Ao final de cada etapa, liste o que NÃO foi testado (por exemplo, desempenho na lousa real).

IMAGENS (etapa 5 e formas provisórias antes)
- Enquanto não houver imagens, desenhe formas coloridas no canvas com a mesma caixa de colisão. O manifesto de sprites é JSON: {id, file, cols, rows, fps, anchor:{x,y}}.
- As imagens chegam como PNG com fundo transparente (canal alfa) em assets/visual/arcade/<jogo>/. Crie tools/fatiar_prancha.py (Python + Pillow + numpy, sem rede) que: (a) lê uma prancha PNG RGBA; (b) separa as peças por componentes conectados do canal alfa (alfa > 20) com dilatação pequena, ou pela grade informada; (c) recorta cada peça com o menor retângulo, remove o halo claro das bordas (defringe/pré-multiplicação) e preserva a transparência; (d) salva WebP com alfa (qualidade 88) e gera o manifesto JSON com id, arquivo, largura, altura e ponto de apoio (centro da base). Para quadros de animação, mantenha a ordem da esquerda para a direita e de cima para baixo e o MESMO ponto de apoio em todos os quadros.
- Se uma prancha vier com fundo quadriculado "falso de transparência" ou fundo sólido, não use: devolva e peça uma nova geração com o prompt de correção do documento de imagens.
- Inclua os arquivos novos em sw.js (FILES), suba a versão do cache em sw.js e app.js e confirme o funcionamento offline.
```

---

# PARTE 2 — Prompts de imagem (ChatGPT, PNG sem fundo)

## Como usar

1. Abra uma **conversa nova** e cole o **Prompt mestre** abaixo. Anexe uma imagem de Faísca ou Pipo (`assets/visual/menu/faisca-abertura.webp`) como referência de estilo.
2. Gere primeiro a **Prancha 0 (elenco)**. Depois anexe-a em todas as pranchas com personagens.
3. Peça uma prancha por vez. Se vier errada, use os **prompts de correção**.
4. Salve cada resultado como **PNG** e me envie (ou ponha em `assets/visual/arcade/<jogo>/`).

**Importante:** peça sempre **PNG com fundo transparente (canal alfa)**. Se o gerador entregar fundo branco, cinza ou o desenho de um quadriculado, trate como erro e use a correção. Se o gerador **não** suportar transparência, use o **plano B**: fundo verde chapado `#00FF00`, que eu removo depois.

## Prompt mestre (colar uma vez)

```
Você vai criar pranchas de sprites para um jogo educativo escolar de Educação Física, em tela horizontal de lousa digital. Siga SEMPRE estas regras em todas as imagens desta conversa:

ESTILO: 3D cartoon polido, estilo animação infantil (como os mascotes Faísca, a lâmpada azul, e Pipo, o foguete laranja): formas arredondadas, volumes macios, contorno limpo, cores vivas e saturadas, brilho suave. Sem realismo.

FORMATO E TRANSPARÊNCIA: entregue PNG com FUNDO TRANSPARENTE REAL (canal alfa). Não desenhe fundo, não desenhe quadriculado, não use branco nem cinza como fundo. Nada de sombra projetada no chão, reflexo, brilho espalhado (glow) ou desfoque fora do contorno das peças: as bordas devem ser limpas e nítidas, para recorte preciso. Se o fundo transparente não for possível, use verde chapado #00FF00 uniforme e avise.

COMPOSIÇÃO: cada peça ou quadro fica ISOLADO dentro da sua célula de uma grade invisível, centralizado, com margem generosa, sem encostar em outra peça nem na borda. Todas as peças de uma prancha têm tamanho parecido. Sem linhas de grade, numeração ou legenda.

SEM TEXTO: nenhuma letra, número, logotipo, marca, camisa de time ou símbolo de marca esportiva. Bolas, roupas e equipamentos são genéricos. Superfícies que receberiam texto ficam lisas e vazias.

PERSONAGENS: crianças e adolescentes de 12 a 15 anos, diversos (tons de pele, cabelos e corpos variados), expressão alegre e concentrada, uniforme esportivo escolar simples, modesto e confortável. Inclusivos. Sem violência, sem armas, sem sangue. Nenhum golpe em pessoas.

ANIMAÇÃO: em sequências de quadros, mantenha o MESMO personagem, a mesma roupa, a mesma escala e a MESMA posição do ponto de apoio (pés, base do barco ou chão) em todos os quadros, mudando só a pose.

Responda só com a imagem. Formato 1536 x 1024 pixels, horizontal, PNG com transparência.
```

## Prancha 0 — Elenco (gerar primeiro)

```
Prancha 0 — Elenco. Grade de 4 colunas x 2 linhas (8 células). Linha 1, de frente, pose neutra: 1) menina negra de cabelo cacheado volumoso, camiseta azul, bermuda cinza; 2) menino branco de cabelo castanho liso curto, camiseta laranja, bermuda azul-marinho; 3) menina de pele parda com cabelo preso em coque, camiseta amarela, calça de moletom azul; 4) menino de pele morena com cabelo curto preto, camiseta branca, bermuda vermelha. Linha 2: os mesmos quatro, na mesma ordem, de COSTAS. Tênis brancos. PNG com fundo transparente.
```

---

## Jogo 1 — Corte Saúde (6º ano)

**1A. Itens que voam** (24 peças, grade 6 x 4)

```
Prancha 1A — Itens do jogo Corte Saúde. Grade 6 colunas x 4 linhas. UM item por célula, inteiro, visto de frente, levemente girado, bem reconhecível a distância. PNG com fundo transparente.
Linha 1 (ajudam o corpo em forma): maçã, banana, laranja, melancia inteira, cacho de uva, cenoura.
Linha 2: garrafa de água, copo de água, tênis de corrida, corda de pular, bola de futebol, halter pequeno.
Linha 3 (hábitos e itens que prejudicam, genéricos sem marca): refrigerante em lata (rótulo liso), pacote de salgadinho (liso), rosquinha com cobertura, hambúrguer, controle de videogame, sofá confortável com pessoa dormindo desenhada só como almofadas (sem rosto).
Linha 4: sorvete de casquinha, bolo com cobertura, pirulito, batata frita em caixinha, celular com tela lisa, relógio de parede marcando tarde da noite (sem números, só ponteiros).
```

**1B. Bomba, metades e efeitos** (24 peças, grade 6 x 4)

```
Prancha 1B — Jogo Corte Saúde. Grade 6 x 4, PNG com fundo transparente, sem sombra.
Linha 1: bomba cartoon redonda com pavio aceso e carinha irritada (2 poses), placa triangular de perigo sem desenho nem texto, buraco na calçada, casca de banana, copo amassado.
Linha 2 (metades cortadas em diagonal, esquerda e direita, mesmas cores externas, interior visível): maçã (E, D), banana (E, D), laranja (E, D).
Linha 3: melancia (E, D), uva (E, D), cenoura (E, D).
Linha 4 (efeitos): rastro de corte branco-azulado em 3 quadros, respingo de suco laranja em 3 quadros.
```

---

## Jogo 2 — Roda de Capoeira (6º ano)

**2A. Roda e instrumentos** (grade 4 x 3)

```
Prancha 2A — Jogo Roda de Capoeira. Grade 4 colunas x 3 linhas, PNG com fundo transparente, sem sombra no chão. Cada instrumento isolado, de frente, bem detalhado e fácil de reconhecer.
Linha 1: berimbau (arco de madeira com cabaça e corda), atabaque (tambor alto de madeira com couro), pandeiro, agogô (dois sinos de metal).
Linha 2: a mesma sequência dos quatro instrumentos em versão "tocando" (com brilho dourado nas bordas e pequenas ondas de som, sem glow espalhado).
Linha 3: quatro anéis de timing em cores diferentes (azul, laranja, amarelo, roxo), vazios no centro, em tamanho grande, e quatro marcas de acerto em forma de estrela correspondentes.
```

**2B. Personagens da roda** (grade 4 x 3)

```
Prancha 2B — Roda de capoeira, personagens de FRENTE, uniforme branco de capoeira com cordão colorido na cintura (calça branca e camiseta branca). Use dois personagens da Prancha 0 (cada um em uma linha). Grade 4 colunas x 3 linhas (12 quadros), pés no mesmo ponto em cada linha, cada quadro com a mesma escala.
Linha 1: personagem A, ginga em 4 quadros (movimento de pés alternando, braços protegendo o corpo).
Linha 2: personagem B, ginga em 4 quadros, mais animada.
Linha 3: tocador sentado tocando berimbau (2 quadros), tocador de atabaque (2 quadros), comemorando (2 quadros), batendo palmas (2 quadros).
Sem golpes, sem contato entre personagens.
```

**2C. Cenário** (uma imagem, 1536 x 1024; este PODE ter fundo)

```
Cenário da roda de capoeira: praça de terra batida ao entardecer, círculo de pessoas seguindo o ritmo, palmeiras e casario colorido ao fundo, bandeirolas sem texto, céu laranja suave. Estilo 3D cartoon. Sem texto. Imagem única opaca, 1536 x 1024.
```

---

## Jogo 3 — Corrida Urbana de Skate (7º ano)

**3A. Skatista** (grade 4 x 3)

```
Prancha 3A — Skatista de COSTAS em skate, para jogo de corrida em 3 pistas. Use o personagem [da Prancha 0]. Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem sombra no chão. Skate e rodas no MESMO ponto da célula (base centralizada).
Linha 1: 4 quadros do ciclo de deslizar (pés alternando, corpo balançando).
Linha 2: inclinado à esquerda, inclinado à direita, agachado passando sob obstáculo, salto no ar com braços abertos.
Linha 3: aterrissagem com poeira, tropeço perdendo o equilíbrio, caído sentado aborrecido, comemoração com braço levantado.
Capacete, joelheiras e cotoveleiras em todos os quadros.
```

**3B. Obstáculos, coletáveis e portões** (grade 6 x 4)

```
Prancha 3B — Objetos da pista, vistos de frente e um pouco de cima, escala parecida, PNG com fundo transparente, sem sombra. Grade 6 x 4.
Linha 1 (obstáculos baixos): cone de trânsito, caixote de madeira, saco de lixo, balde, tábua no chão, poça de água.
Linha 2 (altos): banco de praça, lixeira, barreira de obra listrada (sem texto), poste curto, carrinho de feira, bicicleta parada.
Linha 3 (coletáveis): capacete, garrafa de água, joelheira, estrela dourada, moeda lisa, coração.
Linha 4: três portais iguais em arco, cada um com faixa colorida (azul, amarela, vermelha), vazios no centro; seta para cima; seta para a direita; placa lisa em branco.
```

**3C. Cenário da pista** (1536 x 1024, PODE ter fundo)

```
Rua em perspectiva vista de costas, 3 faixas separadas por linhas tracejadas, calçadas, prédios coloridos e árvores nas laterais, céu azul claro, ponto de fuga ao centro. Sem pessoas, veículos, texto ou placas. Imagem única opaca, 1536 x 1024.
```

---

## Jogo 4 — Pose por Pose (7º ano)

**4A. Poses de ginástica** (grade 4 x 3, 12 poses)

```
Prancha 4A — Poses de ginástica, personagem de FRENTE (use o personagem 3 da Prancha 0 em 6 poses e o personagem 1 em outras 6), roupa de ginástica escolar (camiseta e shorts), descalço ou de sapatilha. Grade 4 colunas x 3 linhas (12 poses), PNG com fundo transparente, sem tapete, sem sombra. Pés ou apoio no mesmo ponto da célula.
Poses: 1) equilíbrio em uma perna, braços abertos; 2) avião (tronco inclinado à frente, uma perna atrás); 3) estrela (estrela aberta de pé, braços e pernas abertos); 4) agachamento com braços à frente; 5) alongamento lateral com um braço sobre a cabeça; 6) ponte; 7) salto com as pernas afastadas; 8) parada de duas mãos com apoio na parede (sem parede desenhada); 9) rolamento (posição de bolinha); 10) flexão de braços no solo; 11) alongamento de pernas sentado; 12) comemoração de braços para cima.
```

**4B. Cenário e interface** (grade 4 x 2)

```
Prancha 4B — Elementos de interface do jogo de ritmo, PNG com fundo transparente. Grade 4 x 2 (8 peças): botão redondo de pose (azul), botão redondo de pose (laranja), botão (verde azulado escuro), botão (roxo), os mesmos quatro botões em estado "pressionado" (mais claro, com pequeno brilho), sem ícone no centro (vazios), e uma nota musical, um coração e uma estrela douradas.
```

```
Cenário: ginásio escolar visto de frente, piso de madeira, colchonetes coloridos e barras ao fundo, luz suave, sem pessoas e sem texto. Imagem única opaca, 1536 x 1024.
```

---

## Jogo 5 — Passe Certo (8º ano)

**5A. Jogadores vistos de cima** (grade 6 x 3)

```
Prancha 5A — Jogadores e bola de uma quadra de esportes de invasão, vistos de CIMA (top-down), estilo 3D cartoon, PNG com fundo transparente, sem sombra. Grade 6 colunas x 3 linhas.
Linha 1 (ataque, uniforme azul, de cima): 6 jogadores em poses diferentes de corrida e giro (cabeça e ombros, braços, pés), todos com cabelos diferentes.
Linha 2 (defesa, uniforme vermelho, de cima): 6 jogadores correndo e marcando, braços abertos.
Linha 3: bola de basquete de cima, bola de handebol, bola de futebol, círculo de destaque azul (anel vazio), círculo de destaque amarelo (anel vazio), seta curva de passe pontilhada.
```

**5B. Quadra e marcações** (uma imagem + peças)

```
Imagem 1 (opaca, 1536 x 1024): quadra poliesportiva vista de cima, piso de madeira clara, linhas brancas simples, sem texto, sem logos, sem plateia.
Imagem 2 (PNG com fundo transparente, grade 4 x 2): marca de espaço livre (círculo verde azulado translúcido com contorno), marca de espaço ocupado (círculo vermelho com contorno), linha pontilhada de trajetória, alvo de passe (cruz), marca de interceptação (X cartoon), três estrelas de acerto (bronze, prata, ouro), e um ícone de apito.
```

---

## Jogo 6 — Rally na Rede (8º ano)

**6A. Jogadores** (grade 4 x 3)

```
Prancha 6A — Jogadores de vôlei de FRENTE, uniforme genérico, use os personagens da Prancha 0. Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem sombra, pés no mesmo ponto.
1) postura de espera; 2) manchete; 3) toque por cima; 4) preparação da cortada; 5) cortada no ar; 6) bloqueio; 7) saque, bola lançada; 8) saque batendo na bola; 9) comemorando; 10) lamentando; 11) correndo para a esquerda; 12) correndo para a direita.
```

**6B. Elementos** (grade 4 x 3)

```
Prancha 6B — Elementos de vôlei, PNG com fundo transparente, sem sombra, sem texto. Grade 4 x 3: bola de vôlei de frente, bola com borrão suave de movimento, bola girando; rede de frente (inteira, vazia); rede balançando 2 quadros; alvo circular colorido para marcar onde a bola cai (azul, amarelo, vermelho); anel de timing que encolhe em 3 tamanhos; seta curva de trajetória.
```

```
Cenário: quadra de vôlei ao ar livre vista de lado, areia clara, céu azul claro, palmeiras, sem pessoas e sem texto. Imagem única opaca, 1536 x 1024.
```

---

## Jogo 7 — Descida do Rio (9º ano)

**7A. Barco** (grade 4 x 3)

```
Prancha 7A — Caiaque duplo (ou bote) com DOIS remadores de COSTAS, uniformes com colete salva-vidas e capacete (use dois personagens da Prancha 0). Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem sombra e sem água desenhada. A base do barco no MESMO ponto da célula.
Linha 1: 4 quadros do ciclo de remada. Linha 2: inclinado à esquerda, inclinado à direita, pulando uma onda, batendo na pedra (com susto). Linha 3: virado de lado, tentando equilibrar, comemorando, parado.
```

**7B. Obstáculos e itens** (grade 6 x 4)

```
Prancha 7B — Objetos de rio, PNG com fundo transparente, sem sombra, sem texto. Grade 6 x 4.
Linha 1 (obstáculos): pedra pequena, pedra grande, tronco boiando, galho, rede de pesca presa, arbusto.
Linha 2 (lixo que NÃO deve pegar): garrafa plástica, saco plástico, lata, pneu, sacola, copo.
Linha 3 (itens para pegar): colete salva-vidas, capacete, remo, garrafa de água, estrela dourada, folha verde azulada (preservação).
Linha 4: três arcos de portal sobre o rio (azul, amarelo, vermelho) vazios no centro; redemoinho; onda com espuma 3 quadros.
```

```
Cenário: rio descendo em perspectiva, vista de costas, 3 faixas de corrente, margens com mata densa e rochas, cachoeira ao fundo, luz de fim de tarde, sem pessoas, sem texto. Imagem única opaca, 1536 x 1024.
```

---

## Jogo 8 — Volta ao Mundo das Lutas (9º ano)

Confirme a lista de lutas nas páginas do caderno do 9º ano antes de gerar e troque nomes se necessário. **Nenhuma imagem mostra pessoas lutando**: use só equipamentos, uniformes e ícones.

**8A. Cartões** (grade 4 x 2, 8 ícones)

```
Prancha 8A — Ícones de lutas do mundo para cartões, estilo 3D cartoon, PNG com fundo transparente, sem sombra, sem texto, sem bandeiras. Cada ícone mostra apenas o equipamento ou uniforme, nunca uma pessoa lutando. Grade 4 colunas x 2 linhas.
1) judô: kimono branco dobrado com faixa colorida; 2) karatê: kimono branco com faixa preta; 3) taekwondo: protetor de tronco e capacete; 4) muay thai: luvas e bermuda de tecido listrado genérico; 5) capoeira: berimbau e cordão; 6) boxe: par de luvas; 7) kung fu: leque e fita vermelha; 8) sumô: faixa de tecido e leque de arbitragem.
```

**8B. Avião, marcadores e interface** (grade 4 x 2)

```
Prancha 8B — Elementos de interface, PNG com fundo transparente, sem sombra, sem texto. Grade 4 x 2: avião cartoon visto de cima (2 quadros), avião de lado, nuvem pequena, pino de mapa vazio (3 cores), estrela de acerto, ponto de interrogação em forma de balão SEM letra (apenas silhueta de balão), moldura de cartão arredondada em branco.
```

**8C. Mapa-múndi** (uma imagem, PODE ter fundo)

```
Mapa-múndi ilustrado, estilo 3D cartoon, continentes em cores suaves e distintas, oceanos azuis claros, sem nomes, sem bandeiras, sem fronteiras tracejadas e sem texto. Escala adequada para sobrepor zonas de toque sobre Japão, Coreia, Tailândia, China, Brasil e outros. Imagem única opaca, 1536 x 1024.
```

---

## Prompts de correção

**Fundo não transparente:** `A imagem precisa ser PNG com fundo transparente real (canal alfa). Não use branco, cinza nem desenho de quadriculado. Refaça a mesma prancha, idêntica, apenas corrigindo o fundo.`

**Sombra ou brilho espalhado:** `Remova sombras no chão, reflexos e brilhos que se espalham fora dos contornos. As bordas devem ser limpas e nítidas. Refaça mantendo o resto.`

**Peças encostando:** `Cada peça precisa ficar centralizada na própria célula, com margem em todos os lados, sem encostar em outra peça nem na borda. Refaça reorganizando na grade.`

**Texto ou marca:** `Remova qualquer letra, número, logotipo ou marca. As superfícies devem ficar lisas.`

**Personagem mudou:** `O personagem, a roupa e a escala devem ser idênticos em todos os quadros, com os pés no mesmo ponto. Use o quadro 1 como referência e mude só a pose.`

**Estilo mudou:** `Volte ao estilo 3D cartoon polido, igual à Prancha 0.`

## Checklist antes de enviar

- [ ] PNG com transparência real (abra num programa que mostre o quadriculado do editor; o fundo não pode estar desenhado).
- [ ] Sem sombras no chão e sem brilho espalhado fora do contorno.
- [ ] Cada peça isolada na célula, sem encostar nas vizinhas.
- [ ] Sem letras, números, logotipos ou marcas.
- [ ] Mesmo personagem, roupa, escala e ponto de apoio em todos os quadros.
- [ ] Nenhuma imagem mostra golpe ou contato entre pessoas.
- [ ] Tamanho 1536 x 1024.

## O que eu (ou o Codex) fazemos depois

1. `tools/fatiar_prancha.py` separa as peças pelo canal alfa, recorta, limpa o halo claro das bordas e converte para WebP com transparência.
2. Gera o manifesto com nome, tamanho e ponto de apoio de cada peça e quadro.
3. O jogo troca as formas provisórias pelas imagens, sem mudar a lógica.
4. Entra tudo no cache offline.
