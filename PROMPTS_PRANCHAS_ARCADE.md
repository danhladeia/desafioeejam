# Pranchas de imagem — jogos arcade do EDF

Kit para gerar no ChatGPT as imagens dos jogos de ação: **Corte Certo**, **Corrida Urbana (skate)**, **Cesta do Saber (basquete)**, **Chute a Gol**, **Rally no Vôlei** e **Combo de Treino (3 em linha)**, mais efeitos comuns.

Cada prancha vira peças soltas com fundo transparente. Os quadros de animação são lidos da esquerda para a direita, de cima para baixo.

## Como usar

1. Abra **uma conversa nova** e cole o **Prompt mestre** (abaixo). Anexe, se tiver, uma imagem de Faísca ou Pipo (`assets/visual/menu/faisca-abertura.webp`) como referência de estilo.
2. Gere a **Prancha A (atletas)** primeiro. Ela define o rosto, as roupas e as proporções dos personagens. Anexe a prancha aprovada em todas as seguintes.
3. Cole o prompt de uma prancha por vez. Se vier errada, use os **prompts de correção**.
4. Confira o **checklist** e me envie cada prancha aprovada. Eu fatio, removo o verde, converto para WebP e monto o jogo.

Ordem sugerida: **A → B (Corte Certo) → C (efeitos) → D (skate) → E (basquete) → F (gol) → G (vôlei) → H (3 em linha)**.

---

## Prompt mestre (colar uma vez, no início)

```
Você vai criar pranchas de sprites para um jogo educativo escolar de Educação Física, em tela horizontal de lousa digital. Siga SEMPRE estas regras em todas as imagens desta conversa:

ESTILO: 3D cartoon polido, estilo animação infantil (como os mascotes Faísca, a lâmpada azul, e Pipo, o foguete laranja): formas arredondadas, volumes macios, contorno limpo, cores vivas e saturadas, brilho suave, leve sombra interna. Sem realismo, sem traços finos de lápis.

FUNDO: verde chapado #00FF00, uniforme, sem gradiente, sem sombra projetada no chão, sem reflexo, sem textura. Nenhum elemento pode usar a cor verde #00FF00 ou tons muito próximos (evite verde-limão forte nas peças; use verde mais escuro ou azulado quando precisar de verde).

COMPOSIÇÃO: cada peça ou quadro fica ISOLADO dentro da sua célula de uma grade invisível, centralizado, com margem generosa e sem encostar em outra peça ou na borda. Todas as peças de uma mesma prancha têm o mesmo tamanho aproximado. Sem linhas de grade desenhadas, sem numeração, sem legenda.

SEM TEXTO: nenhuma letra, número, logotipo, marca, camisa de time real, escudo de clube ou símbolo de marca esportiva (nada de swoosh, listras de marca, etc.). Bolas e roupas são genéricas.

PERSONAGENS: crianças e adolescentes de 12 a 15 anos, diversos (tons de pele, cabelos e corpos variados), expressão alegre e concentrada, uniforme esportivo escolar simples, modesto e confortável (camiseta, bermuda ou calça de moletom, tênis). Inclusivos. Sem violência, sem armas, sem sangue.

ANIMAÇÃO: quando eu pedir quadros de animação, mantenha o MESMO personagem, a mesma roupa, a mesma escala e a MESMA posição do ponto de apoio (pés/chão) em todos os quadros da sequência, mudando só a pose.

Responda só com a imagem. Formato: 1536 x 1024 pixels, horizontal, PNG.
```

---

## Prancha A — Atletas (define o elenco; gerar primeiro)

Dois personagens base, vistos **de frente e de costas** em pose neutra, para eu e você conferirmos as roupas antes de animar.

```
Prancha A — Elenco. Grade de 4 colunas x 2 linhas (8 células iguais).
Linha 1 (de frente, pose neutra, braços relaxados): 1) menina negra de cabelo cacheado volumoso, camiseta azul, bermuda cinza; 2) menino branco de cabelo castanho liso curto, camiseta laranja, bermuda azul-marinho; 3) menina de pele parda com cabelo preso em coque, camiseta amarela, calça de moletom azul; 4) menino de pele morena com cabelo curto preto, camiseta branca, bermuda vermelha.
Linha 2: os MESMOS quatro personagens, na mesma ordem, vistos DE COSTAS.
Todos com tênis brancos. Fundo verde chapado #00FF00.
```

---

## Prancha B — Corte Certo (itens que voam)

Todas as peças com aparência apetitosa e fácil de reconhecer a distância, vistas de frente, ligeiramente giradas.

### B1 — Alimentos e hidratação (24 peças, grade 6 x 4)

```
Prancha B1 — Itens do jogo Corte Certo. Grade de 6 colunas x 4 linhas (24 células). Cada célula tem UM item inteiro.
Linha 1 (alimentos saudáveis): maçã, banana, laranja, melancia inteira, uva (cacho), abacaxi.
Linha 2 (saudáveis): cenoura, brócolis, ovo cozido, castanhas, copo de água, garrafa de água.
Linha 3 (ultraprocessados e excesso, genéricos sem marca): refrigerante em lata (rótulo liso, sem texto), pacote de salgadinho (sem texto), rosquinha com cobertura, hambúrguer, batata frita em caixinha, barra de chocolate.
Linha 4 (mais itens): sorvete de casquinha, bolo com cobertura, pirulito, energético em lata (liso), bala de goma, cachorro-quente.
```

### B2 — Equipamentos e segurança (18 peças, grade 6 x 3)

```
Prancha B2 — Itens do jogo Corte Certo. Grade de 6 colunas x 3 linhas (18 células).
Linha 1 (proteção): capacete de skate, joelheira, cotoveleira, protetor de pulso, luva, apito.
Linha 2 (esporte): bola de basquete, bola de vôlei, bola de futebol, corda de pular, cone, par de tênis.
Linha 3 (riscos e descuidos, para o aluno NÃO cortar): bomba cartoon redonda com pavio aceso e carinha irritada, placa de perigo triangular sem desenho nem texto (só exclamação em forma de traço, SEM letras), buraco na calçada, casca de banana, copo vazio amassado, celular distraindo (tela lisa).
```

### B3 — Pontas e metades (corte)

```
Prancha B3 — Metades após o corte. Grade de 6 colunas x 4 linhas (24 células). Para cada item da Prancha B1, desenhe a PARTE ESQUERDA e a PARTE DIREITA do mesmo item cortado em diagonal, com o interior visível (polpa, miolo, recheio). Cada par ocupa duas células vizinhas (esquerda, direita), na mesma ordem de B1. Mesmo estilo, mesmas cores externas.
```

---

## Prancha C — Efeitos comuns (todos os jogos)

```
Prancha C — Efeitos visuais. Grade de 6 colunas x 4 linhas (24 células). Sem texto.
Linha 1 (corte, 3 quadros de sequência cada): rastro de corte branco-azulado em diagonal (3 quadros, do início ao desaparecimento), respingo de suco laranja (3 quadros).
Linha 2: explosão da bomba em 6 quadros (faísca, bola de fogo cartoon, fumaça).
Linha 3: confete colorido (3 quadros), estrelas douradas brilhando (3 quadros).
Linha 4: nuvem de poeira (3 quadros), brilho de acerto em círculo (3 quadros).
Efeitos com bordas macias e cores vivas, SEM verde #00FF00.
```

---

## Prancha D — Corrida Urbana (skate, visto de costas, 3 pistas)

### D1 — Skatista (animação, 12 quadros, grade 4 x 3)

```
Prancha D1 — Skatista de COSTAS em skate, para jogo de corrida em 3 pistas. Use o personagem da Prancha A [indique qual]. Grade de 4 colunas x 3 linhas (12 quadros), todos com o skate e as rodas no MESMO ponto da célula (base centralizada).
Linha 1: 1-4) pedalando/deslizando, 4 quadros do ciclo de movimento (pés alternando, corpo balançando levemente).
Linha 2: 5) inclinado para a esquerda; 6) inclinado para a direita; 7) agachado passando sob obstáculo; 8) salto no ar, braços abertos.
Linha 3: 9) aterrissagem com poeira; 10) tropeço, perdendo o equilíbrio; 11) caído sentado, aborrecido; 12) comemoração com braço levantado.
Capacete de skate, joelheiras e cotoveleiras em TODOS os quadros.
```

### D2 — Obstáculos e coletáveis (24 peças, grade 6 x 4)

```
Prancha D2 — Objetos de pista urbana, vistos de frente e um pouco de cima, escala parecida. Grade de 6 colunas x 4 linhas.
Linha 1 (obstáculos baixos): cone de trânsito, caixote de madeira, saco de lixo, balde, tábua no chão, poça de água cartoon.
Linha 2 (obstáculos altos): banco de praça, lixeira, barreira de obra listrada (sem texto), poste curto, carrinho de feira, bicicleta parada.
Linha 3 (coletáveis para pegar): capacete, garrafa de água, joelheira, estrela dourada, moeda dourada lisa, coração.
Linha 4 (portões de pergunta): três portais iguais, cada um em arco, com faixa colorida (azul, amarelo, vermelho), VAZIOS no centro (sem texto) para o jogo escrever as respostas. Ao lado, uma placa lisa em branco, uma seta grande para cima e uma seta para a direita.
```

### D3 — Cenário (3 faixas horizontais, 1536 x 1024 cada, sem personagens)

```
Prancha D3 — Cenário de rua para corrida de skate em perspectiva, vista de costas para uma pista com 3 faixas. Imagem única, 1536 x 1024, horizontal. Pista de asfalto clara com 3 faixas separadas por linhas brancas tracejadas, calçadas e prédios coloridos e arborizados nas laterais, céu azul claro com poucas nuvens, ponto de fuga ao centro, bem iluminado. Sem pessoas, sem veículos, sem texto, sem placas com letras. Esta imagem pode ter fundo (NÃO use verde chapado aqui).
```

---

## Prancha E — Cesta do Saber (basquete)

### E1 — Jogador (animação, 8 quadros, grade 4 x 2)

```
Prancha E1 — Jogador de basquete de FRENTE para um arremesso. Use o personagem [da Prancha A]. Grade 4 x 2 (8 quadros), pés sempre no mesmo ponto da célula.
Quadros: 1) parado com a bola na altura do peito; 2) agachando; 3) subindo com a bola acima da cabeça; 4) arremesso, braços esticados; 5) punho em movimento (pós-arremesso); 6) comemorando com os dois braços para cima; 7) lamentando de cabeça baixa; 8) driblando, bola no chão.
```

### E2 — Cenário, cesta e bola

```
Prancha E2 — Elementos de basquete. Grade 4 colunas x 3 linhas (12 células), todos sem texto.
Linha 1: tabela e aro de frente (sem rede), rede de frente balançando parada, rede balançando para a direita, rede balançando para a esquerda.
Linha 2: bola de basquete de frente, bola em movimento com leve borrão, bola girando (2 ângulos), sombra oval suave para chão.
Linha 3: mesma cesta em 3 cores de tabela (azul, amarela, vermelha), cada uma VAZIA na tabela (sem números nem letras), para o jogo escrever a resposta, e uma flecha curva de trajetória pontilhada.
```

---

## Prancha F — Chute a Gol (pênalti)

```
Prancha F1 — Chutador de futebol de COSTAS para o gol. Use o personagem [da Prancha A]. Grade 4 x 2 (8 quadros), pés no mesmo ponto: 1) preparado; 2) recuando a perna; 3) chute no ar (perna esticada); 4) pós-chute com os braços abertos; 5) comemorando correndo; 6) lamentando com as mãos na cabeça; 7) bola parada; 8) bola em movimento com leve borrão.
```

```
Prancha F2 — Goleiro de FRENTE (camiseta amarela e luvas), grade 4 x 3 (12 quadros), pés no mesmo ponto: 1) parado agachado; 2) mergulho alto à esquerda; 3) mergulho baixo à esquerda; 4) mergulho alto à direita; 5) mergulho baixo à direita; 6) salto no meio com as duas mãos; 7) defendeu e segura a bola; 8) bola passando; 9) frustrado deitado; 10) comemorando; 11) braços abertos no centro; 12) agachado olhando para cima.
```

```
Prancha F3 — Gol e campo. Imagem 1: trave e rede do gol, de frente, vazia (3 cantos marcados com círculos vazios). Imagem 2: rede balançando após o gol (3 quadros). Imagem 3: marca de pênalti e faixa de grama escura/clara. Sem texto. Cenário pode ter fundo de estádio sem placas com letras, sem logos.
```

---

## Prancha G — Rally no Vôlei

```
Prancha G1 — Jogadora e jogador de vôlei. Use os personagens da Prancha A. Grade 4 x 3 (12 quadros), pés no mesmo ponto: 1) postura de espera; 2) manchete, braços unidos para baixo; 3) toque por cima, mãos na testa; 4) preparação da cortada; 5) cortada no ar; 6) bloqueio com braços para cima; 7) saque, bola lançada; 8) saque batendo na bola; 9) comemorando; 10) lamentando; 11) correndo para a esquerda; 12) correndo para a direita.
```

```
Prancha G2 — Elementos de vôlei. Grade 4 x 3: bola de vôlei de frente, bola com borrão de movimento, bola girando; rede de frente (inteira, vazia); rede balançando 2 quadros; quadra vista de lado com linhas simples, sem texto; alvo circular colorido para marcar onde a bola cai (3 cores: verde-escuro azulado, amarelo, vermelho); marcador de timing em forma de anel que encolhe (3 quadros).
```

---

## Prancha H — Combo de Treino (3 em linha)

```
Prancha H1 — Peças do jogo de 3 em linha, todas do MESMO tamanho e formato-base: um círculo ou cápsula arredondada colorida com um ícone de Educação Física no centro, 3D cartoon, brilhante. Grade 6 colunas x 3 linhas (18 células).
Linha 1 (6 tipos, uma cor cada): halter (azul), tênis (laranja), coração (vermelho), gota de água (azul claro), cronômetro (amarelo), apito (roxo).
Linha 2: as 6 mesmas peças "especiais" (com brilho dourado e estrelinhas) que representam combinações de 4.
Linha 3: as 6 peças "estourando" (meio desfeitas, com faíscas), preparadas para a animação de eliminação.
Sem texto.
```

```
Prancha H2 — Tabuleiro e interface do 3 em linha. Grade 3 colunas x 3 linhas: moldura de tabuleiro 8x8 vazio, moldura de tabuleiro 6x6 vazio, célula de fundo clara, célula de fundo escura, brilho de seleção quadrado, seta de dica, medidor de progresso vazio e cheio, estrela de meta, cadeado.
```

---

## Prompts de correção

**Fundo sujo ou degradê:** `O fundo precisa ser verde chapado #00FF00 uniforme, sem gradiente, sem sombra no chão e sem reflexo. Refaça a mesma prancha, idêntica, apenas corrigindo o fundo.`

**Peças encostando ou fora de grade:** `Cada peça precisa ficar centralizada na própria célula, com margem em todos os lados, sem encostar em outra peça nem na borda. Refaça, mantendo o conteúdo, apenas reorganizando na grade.`

**Texto ou marca apareceu:** `Remova qualquer letra, número, logotipo ou marca. As superfícies devem ficar lisas. Refaça mantendo todo o resto igual.`

**Personagem mudou entre quadros:** `O personagem, a roupa e a escala devem ser idênticos em todos os quadros, com os pés no mesmo ponto. Refaça usando como referência o quadro 1 e mudando apenas a pose.`

**Estilo mudou:** `Volte ao estilo 3D cartoon polido, igual à Prancha A, com volumes macios e cores vivas. Refaça a prancha.`

**Verde na peça:** `A peça usa um verde parecido com o fundo. Troque esse verde por um verde mais escuro e azulado e mantenha o fundo #00FF00.`

---

## Checklist antes de me enviar

- [ ] Fundo verde chapado, sem degradê, sem sombra.
- [ ] Cada peça isolada na célula, sem tocar nas vizinhas.
- [ ] Sem letras, números, logotipos ou marcas.
- [ ] Mesmo personagem, roupa e escala em todos os quadros; pés no mesmo ponto.
- [ ] Equipamentos de proteção nas cenas de skate.
- [ ] Peças de fundo verde (grama, rede) sem confundir com o #00FF00.
- [ ] Tamanho 1536 x 1024 e arquivo PNG.

## O que eu faço com cada prancha

1. Removo o verde `#00FF00` e fatio cada célula em um arquivo transparente.
2. Converto para WebP leve e monto um catálogo (`json`) com nome, tamanho e ponto de apoio de cada peça.
3. Monto os quadros de animação em sequência e ajusto a velocidade.
4. Troco as formas provisórias do jogo pelas imagens.
5. Adiciono tudo ao cache offline do jogo.
