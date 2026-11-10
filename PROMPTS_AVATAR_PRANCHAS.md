# Kit de prompts — Avatares do Duelo do Futuro (pranchas de itens)

Objetivo: cada aluno monta o próprio personagem combinando **corpo + cabelo + camisa + calça/bermuda/short/saia + calçado + acessórios**. Cada categoria vira **uma prancha** (uma imagem com vários itens em grade). Depois eu fatio as pranchas, recorto o fundo e monto as camadas no jogo.

Estilo: o mesmo 3D cartoon dos mascotes Faísca e Pipo e da equipe da escola.

---

## 0. Como usar (ordem)

1. Abra **um chat novo** no gerador de imagens (ChatGPT, Gemini ou outro). Anexe como referência de estilo `assets/visual/concepts/mascots-faisca-pipo-9-poses-v1.png`.
2. Cole o **Prompt mestre** (seção 1) e envie. Ele só fixa as regras; ainda não gera nada.
3. Gere primeiro a **Prancha 0 (corpos-modelo)**. Aprove o corpo antes de seguir.
4. Para cada prancha seguinte, **anexe a Prancha 0 aprovada** como referência de tamanho e posição, e cole o prompt da prancha.
5. Gere **uma prancha por vez, no mesmo chat**, para o estilo não mudar.
6. Mande-me cada prancha aprovada. Eu fatio, tiro o fundo verde, converto para WebP e crio o arquivo de posições.

Se o resultado sair torto, use os **prompts de correção** (seção 4) em vez de recomeçar.

---

## 1. Prompt mestre (cole uma vez, no início do chat)

```
Você vai criar pranchas de itens de vestuário e cabelo para um jogo educativo
escolar brasileiro. O jogo é usado por estudantes de 13 a 15 anos em uma lousa
digital. Todas as imagens seguem as regras abaixo. Responda "entendido" e espere
a descrição de cada prancha.

ESTILO
- 3D cartoon de animação infantil-juvenil: formas arredondadas, material liso
  como argila ou vinil, sombreado suave, brilho discreto, expressivo e simpático.
- Mesmo estilo, proporções e acabamento das imagens de referência anexadas.
- Luz de estúdio suave vinda do alto à esquerda, em TODAS as peças. Sem sombra
  projetada no chão ou no fundo. Sombreado só dentro da própria peça.
- Contorno: nenhum contorno preto; o volume e a cor definem o formato.
- Cores vivas e limpas. Paleta de apoio do jogo: azul #2167DA, laranja #E76C2D,
  amarelo #FFE06A, roxo #5236B8, verde-escuro #0E7C5A, azul-marinho #1E2359,
  além de branco, preto suave, cinza e tons terrosos. Pode usar outras cores
  quando o item pedir.

FUNDO E RECORTE
- Fundo 100% chapado na cor #00FF00 (verde puro), sem degradê, textura, sombra
  ou reflexo. Nenhuma peça pode usar verde igual ou parecido com #00FF00; para
  peças verdes use verde-escuro ou verde-azulado.
- Bordas nítidas e limpas, sem brilho ou halo em volta das peças.

GRADE
- A prancha é uma grade regular de células do MESMO tamanho, lado a lado.
- UMA peça por célula, centralizada, com margem de pelo menos 8% em todos os lados.
- Nada encostando nas bordas da célula nem em outra peça. Sem linhas de grade,
  molduras, números, setas ou legendas desenhadas.
- Ordem de leitura: esquerda para direita, de cima para baixo (a lista de
  cada prancha segue essa ordem).

POSIÇÃO E ESCALA (muito importante)
- Cada peça é desenhada JÁ NA POSIÇÃO E NO TAMANHO em que ficaria vestida no
  corpo-modelo da Prancha 0, vista de frente, sem perspectiva.
- Desenhe SOMENTE a peça. Sem corpo, sem manequim, sem mãos ou pés dentro dela,
  sem cabide. O interior da roupa aparece vazio, como se o corpo estivesse
  invisível.
- Todas as peças da mesma prancha têm a mesma escala. Mesma câmera: de frente,
  na altura dos olhos, sem inclinar.

CONTEÚDO
- Nenhum texto, letra, número, logotipo ou marca real em nenhuma peça. Estampas
  só com formas geométricas, listras, xadrez, bolinhas ou desenhos simples.
- Roupas adequadas a uma escola: comprimento modesto, tecido opaco, nada
  transparente, justo demais ou sensual.
- Inclusivo: cabelos de várias texturas e penteados reais do Brasil. Nenhuma
  peça pode lembrar uma pessoa real.
- Sem símbolos políticos, religiosos ou de torcida real.
```

---

## 2. Medidas de referência (para o gerador e para mim)

Personagem montado em um quadro de **1024 × 1536 px** (proporção 2 : 3). Cabeça grande, estilo cartoon (cabeça ≈ 1/4 da altura).

| Zona | Onde fica no quadro | Usada por |
|---|---|---|
| Cabeça | x 192–832, y 32–592 (640 × 560) | cabelos, bonés, óculos |
| Tronco | x 192–832, y 500–1100 (640 × 600) | camisas, agasalhos, mochilas |
| Pernas | x 192–832, y 920–1440 (640 × 520) | calças, bermudas, shorts, saias |
| Pés | x 256–768, y 1360–1520 (512 × 160) | calçados |

Você não precisa respeitar os pixels exatos: o que vale é **a mesma posição e escala do corpo-modelo**. Eu corrijo diferenças pequenas com um deslocamento por peça.

**Ordem das camadas (de baixo para cima):** cabelo atrás → mochila (parte de trás) → corpo → calçado → calça, bermuda, short ou saia → camisa → agasalho → cabelo (frente) → óculos → boné ou chapéu → outros acessórios.

---

## 3. Pranchas

Cada bloco abaixo é o que você cola **depois do prompt mestre**. Anexe a Prancha 0 aprovada (menos na própria Prancha 0).

### Prancha 0 — Corpos-modelo (6 tons de pele)

Grade 3 colunas × 2 linhas. Célula: quadro inteiro 2 : 3.

```
PRANCHA 0 — CORPOS-MODELO. Grade de 3 colunas × 2 linhas, 6 células iguais, cada
uma com o quadro inteiro na proporção 2:3 (largura 2, altura 3).

Em cada célula, um mesmo personagem-base de corpo inteiro, de frente, em pose
neutra "A" (braços levemente afastados do corpo, palmas para dentro, pés
paralelos e um pouco separados), olhando para a frente, sorriso simpático.
Estudante adolescente, corpo de boneco de vinil estilizado: cabeça grande
(cerca de 1/4 da altura), olhos grandes e expressivos, sobrancelhas, nariz
pequeno, boca sorrindo. O personagem NÃO tem cabelo (cabeça lisa e careca, como
boneco), para que os cabelos sejam adicionados depois.

Veste uma roupa de base lisa, colada ao corpo e na cor da pele (regata e
bermuda justas até o meio da coxa), sem pregas, costuras, anatomia ou detalhes,
só o formato do corpo. Mãos com cinco dedos simples, pés descalços de boneco.

Os 6 tons de pele, na ordem: 1 muito claro #F7D8C2, 2 claro #EBBF9A,
3 médio #D49A6A, 4 moreno #A9714A, 5 escuro #7A4A30, 6 muito escuro #4A2C1F.
Mesmo rosto, mesma pose, mesmo tamanho e mesma posição em todas as células;
muda apenas a cor da pele (e o tom dos lábios e das bochechas).

Margem de 6% ao redor de cada corpo. Fundo #00FF00 chapado.
```

### Prancha 1 — Cabelos (frente)

Grade 4 × 4 = 16 cabelos. Célula: zona da cabeça (640 × 560).

```
PRANCHA 1 — CABELOS (FRENTE). Grade de 4 colunas × 4 linhas, 16 células iguais,
cada uma na proporção 8:7 (zona da cabeça do corpo-modelo).

Cada célula mostra SOMENTE o cabelo (sem rosto, sem cabeça, sem pescoço), na
posição exata em que ficaria sobre a cabeça do corpo-modelo da Prancha 0: a
parte de cima na altura do topo da cabeça, a franja sobre a testa, as laterais
junto às orelhas. Deixe vazio o espaço do rosto.

Todos os cabelos na mesma cor neutra clara, cinza-quente #CFC8C0, com sombreado
e brilho suaves e volume bem definido (a cor final será aplicada por código).
Fios ou cachos modelados como massas arredondadas, estilo 3D cartoon, sem fios
soltos soltando do volume.

Ordem (linha 1: itens 1–4; linha 2: 5–8; linha 3: 9–12; linha 4: 13–16):
1 curto social, repartido de lado
2 raspado nas laterais (degradê) com topo curto
3 black power curto e redondo
4 black power grande e volumoso
5 cacheado médio, na altura do queixo
6 cacheado longo, solto até o peito
7 liso curto tipo chanel, com franja
8 liso médio, na altura dos ombros, repartido ao meio
9 liso longo, solto, repartido ao meio
10 ondulado longo, solto
11 rabo de cavalo alto (mostre o rabo na frente do ombro; a base na parte de trás será
   da prancha de cabelos "atrás")
12 duas marias-chiquinhas com presilhas simples
13 coque alto, com franja lateral
14 tranças longas (box braids) presas em parte, caindo até o peito
15 liso médio com franja reta cobrindo a testa
16 twists/dreads curtos, volumosos

Margem de 8% em cada célula. Fundo #00FF00 chapado.
```

### Prancha 2 — Cabelos (atrás)

Grade 4 × 4, **mesma ordem da Prancha 1**. Célula: zona da cabeça.

```
PRANCHA 2 — CABELOS (ATRÁS). Grade de 4 colunas × 4 linhas, 16 células iguais,
na MESMA ordem e posição da Prancha 1 (anexe a Prancha 1 aprovada como
referência).

Cada célula mostra apenas a parte do cabelo que fica ATRÁS da cabeça e dos
ombros (a massa que aparece atrás do pescoço e cai pelas costas), na mesma cor
neutra clara #CFC8C0 e no mesmo estilo da Prancha 1, no mesmo tamanho e posição.

Quando o penteado não tem parte de trás visível (itens 1, 2, 3, 7, 13 e 15),
deixe a célula COMPLETAMENTE VAZIA, só com o fundo #00FF00.

Itens com volume atrás: 4, 5, 6, 8, 9, 10, 11 (base do rabo de cavalo),
12 (as duas marias-chiquinhas por trás), 14, 16.

Fundo #00FF00 chapado.
```

### Prancha 3 — Camisetas e blusas

Grade 4 × 3 = 12. Célula: zona do tronco (640 × 600).

```
PRANCHA 3 — CAMISETAS E BLUSAS. Grade de 4 colunas × 3 linhas, 12 células
iguais, na proporção 16:15 (zona do tronco do corpo-modelo).

Cada célula mostra SOMENTE a peça, vazia por dentro, na posição exata em que
ficaria no tronco do corpo-modelo da Prancha 0: gola ao redor do pescoço, ombros
na altura dos ombros, mangas pendendo ao lado do corpo na pose "A", barra na
altura do quadril. Sem mãos, sem pescoço, sem corpo.

Cores variadas e vivas, tecido com dobras suaves, estilo 3D cartoon.

Ordem (linha 1: 1–4; linha 2: 5–8; linha 3: 9–12):
1 camiseta lisa, gola redonda, azul #2167DA
2 camiseta lisa, gola V, laranja #E76C2D
3 camisa polo, amarela, com gola e dois botões
4 regata lisa, roxa #5236B8
5 camiseta de manga longa, lisa, cinza
6 camiseta com listras horizontais finas, azul-marinho e branco
7 camiseta com estampa geométrica simples (triângulos e círculos coloridos), sem texto
8 camiseta larga (oversized), verde-escuro, manga caindo até o cotovelo
9 camisa social de manga curta, branca, com botões
10 camiseta de time GENÉRICA: listras verticais vermelhas e brancas, sem escudo,
   sem marca e sem número
11 camiseta de UNIFORME ESCOLAR: branca, gola e barra das mangas azul #2167DA,
   sem logotipo e sem texto
12 camiseta amarela #FFE06A, lisa, com bolso pequeno no peito

Fundo #00FF00 chapado.
```

### Prancha 4 — Agasalhos e jaquetas (camada por cima da camisa)

Grade 4 × 3 = 12. Célula: zona do tronco.

```
PRANCHA 4 — AGASALHOS E JAQUETAS. Grade de 4 colunas × 3 linhas, 12 células
iguais, mesma proporção e posição da zona do tronco da Prancha 3.

Peças que vão POR CIMA de uma camiseta: mangas compridas, mais volumosas que a
camiseta, vazias por dentro, abertas ou fechadas conforme o item (quando
abertas, o interior e o centro do peito ficam vazios, para a camiseta aparecer
por baixo). Mangas pendendo ao lado do corpo na pose "A".

Ordem:
1 moletom com capuz (capuz caído atrás do pescoço), azul-marinho
2 moletom com zíper aberto, cinza
3 jaqueta jeans aberta, azul médio
4 jaqueta corta-vento esportiva, laranja e preta, aberta
5 jaqueta bomber, verde-escuro
6 cardigã de lã aberto, bege
7 colete acolchoado aberto, amarelo
8 jaqueta de UNIFORME ESCOLAR: azul-marinho com faixa branca, aberta, sem logotipo
9 camisa xadrez aberta (vermelha e preta), usada como casaco
10 casaco de frio com gola alta, roxo
11 capa de chuva amarela, aberta, com capuz caído
12 blazer escuro aberto

Fundo #00FF00 chapado.
```

### Prancha 5 — Calças

Grade 4 × 3 = 12. Célula: zona das pernas (640 × 520).

```
PRANCHA 5 — CALÇAS. Grade de 4 colunas × 3 linhas, 12 células iguais, na
proporção 5:4 (zona das pernas do corpo-modelo).

Cada célula mostra SOMENTE a calça, vazia por dentro, na posição exata em que
ficaria no corpo-modelo: cós na cintura, duas pernas retas ou conforme o
modelo, barra na altura do tornozelo (acima dos pés). Sem corpo e sem pés.
Opaca, tecido com dobras suaves, estilo 3D cartoon.

Ordem:
1 jeans reto, azul médio
2 jeans justo, azul-escuro
3 jeans largo (wide leg), azul claro
4 jogger de moletom, cinza, com punho no tornozelo
5 cargo, verde-oliva, com bolsos laterais
6 social, preta
7 legging esportiva opaca, preta
8 calça de agasalho azul-marinho com listra lateral branca (sem marca)
9 pantalona fluida, vermelha escura
10 brim colorido, mostarda #E0A020
11 linho, bege claro, perna reta
12 jeans claro com a barra dobrada

Fundo #00FF00 chapado.
```

### Prancha 6 — Bermudas

Grade 4 × 3 = 12. Célula: zona das pernas.

```
PRANCHA 6 — BERMUDAS. Grade de 4 colunas × 3 linhas, 12 células iguais, mesma
proporção e posição da zona das pernas da Prancha 5.

Bermudas na altura do joelho (ou logo acima), vazias por dentro, na posição
exata do corpo-modelo: cós na cintura, barra no joelho. Sem corpo, sem
pernas, sem pés. Opacas.

Ordem:
1 jeans azul
2 cargo bege, com bolsos laterais
3 sarja caqui
4 tactel esportivo azul-marinho, com listra lateral branca (sem marca)
5 moletom cinza
6 estampa geométrica colorida (triângulos e círculos), sem texto
7 listrada horizontal, azul e branca
8 ciclista até o joelho, preta
9 xadrez vermelho e preto
10 social cinza-escura
11 jeans claro com a barra dobrada
12 UNIFORME ESCOLAR: azul-marinho com detalhe branco, sem logotipo

Fundo #00FF00 chapado.
```

### Prancha 7 — Shorts

Grade 4 × 3 = 12. Célula: zona das pernas.

```
PRANCHA 7 — SHORTS. Grade de 4 colunas × 3 linhas, 12 células iguais, mesma
proporção e posição da zona das pernas da Prancha 5.

Shorts de comprimento médio (até o meio da coxa), modestos e opacos, vazios por
dentro, na posição exata do corpo-modelo: cós na cintura, barra no meio da
coxa. Sem corpo, sem pernas, sem pés.

Ordem:
1 de futebol GENÉRICO, azul com listra lateral branca (sem marca, sem escudo)
2 jeans, azul médio
3 de corrida, laranja, leve
4 de moletom, cinza
5 saia-short (skort), azul-marinho, plissada
6 ciclista curto, preto, opaco
7 de praia (surf), estampa de ondas simples, azul e branco
8 de linho, bege
9 com listra lateral, roxo e branco
10 cintura alta, jeans escuro
11 de tactel colorido, amarelo
12 de EDUCAÇÃO FÍSICA da escola: azul-marinho liso, sem logotipo

Fundo #00FF00 chapado.
```

### Prancha 8 — Saias

Grade 4 × 3 = 12. Célula: zona das pernas.

```
PRANCHA 8 — SAIAS. Grade de 4 colunas × 3 linhas, 12 células iguais, mesma
proporção e posição da zona das pernas da Prancha 5.

Saias vazias por dentro, na posição exata do corpo-modelo: cós na cintura, barra
entre o joelho e a panturrilha (comprimento modesto). Sem corpo e sem pernas.
A barra das saias rodadas pode se alargar, mas sempre dentro da célula.

Ordem:
1 plissada de UNIFORME ESCOLAR: azul-marinho, sem logotipo
2 jeans reta, azul médio
3 evasê, laranja #E76C2D
4 lápis até o joelho, preta
5 longa fluida, roxa #5236B8, até o tornozelo
6 rodada, amarela
7 pregueada xadrez, vermelha e preta
8 de moletom, cinza
9 envelope, verde-escuro
10 midi de cetim fosco, azul-marinho
11 tulipa, rosa choque
12 jeans clara, com a barra desfiada

Fundo #00FF00 chapado.
```

### Prancha 9 — Vestidos e macacões (opcional)

Grade 3 × 2 = 6. Célula: **tronco + pernas juntos** (640 × 1100). Esta prancha ocupa o lugar de camisa e calça.

```
PRANCHA 9 — VESTIDOS E MACACÕES. Grade de 3 colunas × 2 linhas, 6 células
iguais, cada uma na proporção 32:55 (da altura do ombro ao tornozelo do corpo-modelo).

Cada célula mostra SOMENTE a peça inteira, vazia por dentro, na posição exata do
corpo-modelo: do pescoço/ombros até a barra, mangas ao lado do corpo na pose "A".
Comprimento modesto, tecido opaco.

Ordem:
1 vestido de alças largas, azul, até o joelho
2 vestido de manga curta, listrado, até o joelho
3 vestido midi plissado, laranja
4 macacão jeans (jardineira) com camiseta branca por baixo
5 macacão esportivo azul-marinho de EDUCAÇÃO FÍSICA, sem logotipo
6 vestido evasê com estampa de bolinhas, vermelho e branco

Fundo #00FF00 chapado.
```

### Prancha 10 — Calçados

Grade 3 × 4 = 12 pares. Célula: zona dos pés (512 × 160).

```
PRANCHA 10 — CALÇADOS. Grade de 3 colunas × 4 linhas, 12 células iguais, na
proporção 16:5 (zona dos pés do corpo-modelo).

Cada célula mostra UM PAR de calçados vistos de frente, lado a lado, na posição
exata dos pés do corpo-modelo: os dois pés paralelos, com a distância entre eles
igual à do corpo-modelo. SEM pés e SEM pernas dentro. Sem marca, sem logotipo
e sem texto.

Ordem (linha 1: 1–3; linha 2: 4–6; linha 3: 7–9; linha 4: 10–12):
1 tênis branco liso
2 tênis colorido (azul e laranja)
3 tênis de corrida esportivo, cinza e amarelo
4 chuteira GENÉRICA, preta e branca
5 sapatilha escura
6 sapato social preto
7 bota curta marrom
8 sandália de tiras, bege
9 chinelo de dedo, azul
10 tênis de lona cano alto, vermelho
11 sapato escolar preto com meia branca
12 tênis de skate, amarelo e preto

Fundo #00FF00 chapado.
```

### Prancha 11 — Bonés e chapéus

Grade 4 × 3 = 12. Célula: zona da cabeça.

```
PRANCHA 11 — BONÉS E CHAPÉUS. Grade de 4 colunas × 3 linhas, 12 células iguais,
mesma proporção e posição da zona da cabeça da Prancha 1.

Cada célula mostra SOMENTE a peça, vazia por dentro, na posição exata em que
ficaria na cabeça do corpo-modelo. Sem rosto e sem cabelo. Sem marca, sem
logotipo e sem texto.

Ordem:
1 boné de aba reta, azul-marinho
2 boné de aba curva, laranja
3 boné de time GENÉRICO, vermelho e branco, sem escudo
4 touca de lã com pompom, listrada
5 gorro de lã, cinza
6 chapéu de palha, aba larga
7 chapéu bucket, bege
8 viseira esportiva, branca
9 faixa de cabelo larga, roxa
10 laço grande no alto da cabeça, amarelo
11 capacete de bicicleta, azul e branco
12 turbante liso, mostarda

Fundo #00FF00 chapado.
```

### Prancha 12 — Óculos e acessórios de rosto

Grade 4 × 3 = 12. Célula: zona da cabeça.

```
PRANCHA 12 — ÓCULOS E ACESSÓRIOS DE ROSTO. Grade de 4 colunas × 3 linhas, 12
células iguais, mesma proporção e posição da zona da cabeça da Prancha 1.

Cada célula mostra SOMENTE o acessório, na posição exata em que ficaria no rosto
do corpo-modelo (olhos, orelhas). Lentes das armações transparentes (deixe ver o
fundo #00FF00 pelas lentes claras; as escuras ficam escuras). Sem rosto.

Ordem:
1 óculos redondos, armação preta
2 óculos quadrados, armação azul
3 óculos aviador, dourado
4 óculos esportivos, preto e laranja
5 óculos escuros redondos
6 óculos escuros quadrados, vermelhos
7 óculos de natação, azul
8 óculos grandes de gatinho, roxos
9 brincos de argola dourados, pequenos
10 fones de ouvido grandes (over-ear), laranja e preto
11 fones de ouvido sem fio, brancos, só as duas peças nas orelhas
12 máscara de super-herói genérica, só a faixa dos olhos, azul

Fundo #00FF00 chapado.
```

### Prancha 13 — Mochilas e acessórios de corpo

Grade 4 × 3 = 12. Célula: zona do tronco.

```
PRANCHA 13 — MOCHILAS E ACESSÓRIOS DE CORPO. Grade de 4 colunas × 3 linhas, 12
células iguais, mesma proporção e posição da zona do tronco da Prancha 3.

Cada célula mostra SOMENTE o acessório, na posição exata do corpo-modelo. As
alças passam pelos ombros e descem pela frente do tronco; a parte do corpo da
mochila aparece ATRÁS dos ombros, nos dois lados do tronco. Sem corpo e sem
mãos. Sem marca, sem logotipo e sem texto.

Ordem:
1 mochila escolar azul, alças brancas
2 mochila laranja, com bolso frontal
3 mochila roxa pequena
4 bolsa transversal bege
5 pochete preta, atravessada no peito
6 relógio de pulso esportivo no punho esquerdo
7 pulseiras coloridas nos dois punhos
8 colar com pingente de estrela, dourado
9 cachecol azul-marinho e amarelo
10 gravata azul-marinho
11 cordão de crachá com crachá em branco (sem texto)
12 faixa de capitão no braço esquerdo, amarela

Fundo #00FF00 chapado.
```

---

## 4. Prompts de correção (cole no mesmo chat)

**Peça fora de posição ou tamanho:**
```
As peças não estão na mesma posição e escala do corpo-modelo da Prancha 0.
Refaça a prancha mantendo exatamente o mesmo enquadramento, escala e altura
do corpo-modelo anexado. Mantenha os itens e a ordem; corrija só a posição.
```

**Corpo, mãos ou pés aparecendo dentro da roupa:**
```
Há partes do corpo (mãos, pés, pescoço ou pernas) visíveis dentro das peças.
Refaça removendo todo o corpo: só as peças, vazias por dentro, como se o corpo
estivesse invisível.
```

**Fundo ou bordas sujas:**
```
O fundo precisa ser #00FF00 chapado, sem degradê, sombra, brilho ou halo em
volta das peças. Refaça com bordas nítidas, sem mudar as peças.
```

**Texto, marca ou logotipo apareceu:**
```
Apareceu texto, letra, número ou logotipo em algumas peças. Remova tudo e
refaça essas peças com cores lisas ou formas geométricas simples.
```

**Uma peça só saiu errada (não refaça a prancha inteira):**
```
Refaça apenas o item número N (linha L, coluna C). Mantenha todos os outros
itens exatamente iguais. Item N: [descreva de novo].
```

**Estilo mudou entre pranchas:**
```
O estilo desta prancha está diferente das anteriores (acabamento, luz,
volume). Refaça no mesmo estilo 3D cartoon da Prancha 0 e das pranchas
aprovadas anexadas, com a mesma luz do alto à esquerda.
```

---

## 5. Checklist antes de me enviar cada prancha

- [ ] Grade regular, células do mesmo tamanho, uma peça por célula.
- [ ] Nenhuma peça encostando em outra ou na borda da célula.
- [ ] Fundo todo #00FF00, sem sombra nem halo.
- [ ] Sem texto, logotipo ou marca em nenhuma peça.
- [ ] Peças vazias por dentro (sem corpo, mãos ou pés).
- [ ] Mesma posição e escala do corpo-modelo da Prancha 0.
- [ ] Mesma ordem da lista do prompt.
- [ ] Roupas modestas e opacas.
- [ ] Mesmo estilo das pranchas anteriores.

---

## 6. O que eu faço depois

1. Fatio cada prancha em peças e removo o fundo verde (recorte com borda limpa).
2. Converto para WebP e ajusto o tamanho para o quadro de 1024 × 1536.
3. Crio o arquivo `avatar-pecas.json` com, para cada peça: nome, categoria, camada, posição e um pequeno deslocamento, se precisar.
4. Aplico a cor nos cabelos por código (a prancha de cabelos é neutra de propósito).
5. Monto a tela de criação de personagem e testo as combinações (por exemplo, camisa com agasalho, cabelo com boné).

**Nomes de arquivo sugeridos:** `avatar-00-corpos.png`, `avatar-01-cabelos-frente.png`, `avatar-02-cabelos-atras.png`, `avatar-03-camisetas.png`, `avatar-04-agasalhos.png`, `avatar-05-calcas.png`, `avatar-06-bermudas.png`, `avatar-07-shorts.png`, `avatar-08-saias.png`, `avatar-09-vestidos.png`, `avatar-10-calcados.png`, `avatar-11-bonés.png`, `avatar-12-oculos.png`, `avatar-13-acessorios.png`.

**Total:** 14 pranchas e 154 peças (6 corpos, 16 cabelos, 16 cabelos de trás, 12 camisetas, 12 agasalhos, 12 calças, 12 bermudas, 12 shorts, 12 saias, 6 vestidos, 12 calçados, 12 bonés, 12 óculos, 12 acessórios). Dá para começar só com as pranchas 0 a 8 e 10, que já formam um personagem completo, e deixar as outras para depois.
