# Terceira leva de pranchas: câmera mais alta, vôlei de dois jogadores e futebol de disco

Este arquivo responde aos pedidos mais recentes: o que já foi corrigido por código, e **quais imagens novas são necessárias** para o resto. Tudo em **PNG com fundo transparente** (cenários podem ser opacos), 1536 x 1024.

## Análise dos pedidos

| Pedido | Situação | Precisa de imagem? |
| --- | --- | --- |
| Jogos cortados no menu | **Corrigido.** O catálogo passou para 8 colunas e ícones menores; os 22 cartões cabem em 1024x768, 1280x800 e 1920x1080 | Não |
| Goleiro desproporcional e dentro do gol | **Corrigido.** Gol menor, goleiro em escala (cerca de 62% da altura do gol) e de pé na linha; argolas dentro da boca do gol | Não |
| Melhorar o giro da bola de basquete | **Melhorado por código** (giro contínuo, mais rápido conforme a velocidade). Para ficar ainda melhor, vale uma bola com giro desenhado | Opcional (prancha Z) |
| Arco e flecha: arco bem transparente e na posição certa; alvos mais distantes | **Corrigido.** Arco a 22% de opacidade e na base da tela; agora há sempre um alvo perto e um distante (pequeno, vale o dobro) | Não |
| Skate com muitos objetos | **Corrigido.** No máximo 8 objetos na tela, média 4, linhas com respiro e sempre uma pista livre | Não |
| Corredeira (rio) com muitos objetos | **Corrigido**, mesma regra do skate | Não |
| Câmera mais alta no skate e no rio | **Parcial.** O código já aceita, mas a câmera mais alta pede cenários e personagens novos | **Sim (pranchas X)** |
| Imagem da corredeira: o rio de frente | **Depende de imagem.** O cenário atual é um rio em curva, visto de lado | **Sim (prancha X2)** |
| Vôlei para 2 jogadores com a mesma bola, quadra horizontal, bola acelera a cada rebatida | **Depende de arquitetura e imagem.** O jogo hoje tem uma arena por aluno; este precisa de uma arena compartilhada | **Sim (pranchas V)** |
| Futebol estilo disco bol | **Depende de arquitetura e imagem.** Também usa uma arena compartilhada | **Sim (pranchas W)** |

Os dois jogos de arena compartilhada exigem mudar o `play-session.js`: um único campo para os dois alunos, com cada um usando o seu lado, e a pontuação creditada ao lado certo. Isso eu faço depois que as imagens chegarem.

## Como usar

1. Abra uma conversa nova no gerador e cole o **Prompt mestre** abaixo. Anexe a **Prancha A** (elenco) quando houver personagens.
2. Gere as pranchas na ordem: **X → V → W → Z**. Uma por vez.
3. Salve em `assets/visual/arcade/pranchas/` com o nome da prancha (por exemplo, `X1-rua-camera-alta.png`).
4. Confira o checklist, use os prompts de correção se preciso, e me avise.

Plano B se o fundo transparente não vier: fundo verde chapado `#00FF00` (o fatiador remove com `--chroma`; para personagens, `--strong`).

---

## Prompt mestre (colar uma vez)

```
Você vai criar pranchas de sprites e cenários para um jogo educativo escolar de Educação Física, para lousa digital horizontal e celular. Siga SEMPRE estas regras em todas as imagens desta conversa:

ESTILO: 3D cartoon polido, estilo animação infantil (como os mascotes Faísca, a lâmpada azul, e Pipo, o foguete laranja): formas arredondadas, volumes macios, contorno limpo, cores vivas e saturadas, brilho suave. Sem realismo.

FORMATO E TRANSPARÊNCIA: peças e personagens em PNG com FUNDO TRANSPARENTE REAL (canal alfa), sem sombra no chão, sem brilho espalhado e sem desfoque fora do contorno, com bordas limpas e nítidas. Nunca desenhe quadriculado, branco ou cinza como fundo. Cenários são imagens opacas, sem personagens. Se o fundo transparente não for possível, use verde chapado #00FF00 e avise; nesse caso não use verde nas peças.

COMPOSIÇÃO: cada peça ou quadro fica ISOLADO na sua célula de uma grade invisível, centralizado, com margem generosa, sem encostar na vizinha nem na borda. Sem linhas de grade, numeração ou legenda.

SEM TEXTO: nenhuma letra, número, logotipo, marca, escudo de clube real ou símbolo de marca esportiva. Superfícies que receberiam texto ficam lisas e vazias.

PERSONAGENS: crianças e adolescentes de 12 a 15 anos, diversos, uniforme esportivo escolar modesto, com proteção quando o esporte pedir. Sem violência.

ANIMAÇÃO: em sequências, o MESMO personagem, a mesma roupa, a mesma escala e o MESMO ponto de apoio em todos os quadros, mudando só a pose.

Responda só com a imagem. Formato 1536 x 1024, horizontal.
```

---

## X — Câmera mais alta (skate e rio)

A câmera sobe para cerca de **50 a 60 graus** para baixo, atrás do personagem. Isso mostra mais pista à frente e deixa os obstáculos legíveis de longe.

### X1 — Rua vista de cima, reta (cenário opaco)

```
Cenário de uma rua reta de cidade vista de uma câmera ALTA, atrás e acima, cerca de 55 graus para baixo, olhando para a frente ao longo da rua. A rua tem 3 faixas largas separadas por linhas tracejadas, quase paralelas (perspectiva suave, ponto de fuga distante), com calçadas largas dos dois lados, fachadas coloridas baixas e árvores nas bordas, vistas de cima. A pista ocupa a maior parte da imagem, com bastante asfalto visível. Sem pessoas, sem veículos, sem placas com texto. Imagem única opaca, 1536 x 1024.
```

### X2 — Rio reto visto de cima (cenário opaco)

```
Cenário de um rio RETO de corredeira visto de uma câmera ALTA, atrás e acima, cerca de 55 graus para baixo, olhando para a frente ao longo do rio, que desce em linha reta para dentro da imagem (o rio de frente, não em curva). O rio ocupa a maior parte da imagem, com 3 faixas de correnteza largas e paralelas (perspectiva suave), margens com mata e rochas dos dois lados, espuma leve. Sem pessoas, sem barcos, sem pontes cruzando no primeiro plano, sem texto. Imagem única opaca, 1536 x 1024.
```

### X3 — Skatista de costas, câmera alta (12 quadros, grade 4 x 3)

```
Prancha X3 — Skatista de COSTAS em skate, visto de uma câmera ALTA, atrás e acima (cerca de 55 graus para baixo). Use um personagem da Prancha A (anexada): capacete azul, camiseta branca, bermuda vermelha, joelheiras. O skatista e o skate apontam PARA LONGE da câmera, com o comprimento do skate na linha de visão. Vê-se as costas, o topo do capacete e o skate encurtado pela perspectiva. Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra no chão, skate no MESMO ponto da célula.
Linha 1: deslizando em linha reta, 4 quadros do ciclo. Linha 2: inclinado à esquerda, inclinado à direita, agachado, salto no ar com braços abertos. Linha 3: aterrissagem com poeira, tropeço, caído sentado ao lado do skate, comemorando com um braço levantado.
```

### X4 — Caiaque de costas, câmera alta (12 quadros, grade 4 x 3)

```
Prancha X4 — Caiaque duplo com DOIS remadores de COSTAS, visto de uma câmera ALTA, atrás e acima (cerca de 55 graus para baixo). Use dois personagens da Prancha A, de capacete, colete amarelo e camiseta colorida. O caiaque aponta PARA LONGE da câmera, descendo o rio; o comprimento fica na linha de visão, popa perto e grande, proa distante e menor. Vê-se o topo dos capacetes, as costas dos remadores e as pás nas laterais. Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem água desenhada além de pequenos respingos presos ao casco, sem sombra, popa no MESMO ponto da célula.
Linha 1: remando em linha reta, 4 quadros do ciclo. Linha 2: inclinado à esquerda, inclinado à direita, debruçado para passar sob uma ponte, salto sobre uma onda. Linha 3: aterrissagem com respingo, batida na pedra (susto), equilibrando, comemorando com as pás levantadas.
```

---

## V — Vôlei de dois jogadores (bola compartilhada, quadra horizontal)

Um único campo para os dois alunos: a quadra vista **de lado**, na horizontal, com a rede no meio. Cada aluno defende um lado. A bola começa lenta e acelera a cada rebatida.

### V1 — Quadra de lado (cenário opaco)

```
Cenário de uma quadra de vôlei vista LATERALMENTE (corte lateral), na horizontal, com a rede no centro e a quadra se estendendo à esquerda e à direita, piso de madeira clara com linhas simples, arquibancada simples e paredes do ginásio ao fundo, luz suave. O espaço aéreo acima da quadra fica livre e limpo, para a bola voar. Sem pessoas, sem bola, sem texto, sem placas, sem logotipos. Imagem única opaca, 1536 x 1024.
```

### V2 — Rede e elementos (grade 4 x 2)

```
Prancha V2 — Elementos do vôlei lateral, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto. Grade 4 colunas x 2 linhas: rede vista de LADO (inteira, com os dois postes), rede esticada pela bola (2 quadros), rede balançando (2 quadros), marcador de zona de defesa em forma de oval no chão (verde azulado) e outro em amarelo, aro de destaque brilhante vazio para mostrar onde a bola vai chegar.
```

### V3 — Jogadores laterais, opcional (grade 4 x 3)

```
Prancha V3 — Jogador de vôlei visto LATERALMENTE, virado para a DIREITA, uniforme azul genérico, sem número. Use um personagem da Prancha A. Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra, pés no mesmo ponto: 1) em espera; 2) deslocando; 3) manchete; 4) toque por cima; 5) preparação da cortada; 6) cortada no ar; 7) bloqueio; 8) aterrissagem; 9) comemorando; 10) lamentando; 11) mergulho para defender; 12) levantando depois do mergulho. (O jogo espelha a imagem para o jogador do outro lado.)
```

---

## W — Futebol de disco (estilo disco bol / air hockey)

Campo visto **de cima**, na horizontal. Cada aluno move um disco-jogador no seu lado e tenta empurrar a bola para o gol do outro. As paredes laterais rebatem a bola.

### W1 — Campo visto de cima (cenário opaco)

```
Cenário de um campo de futebol de mesa visto de CIMA, na horizontal, estilo "disco bol": grama listrada em dois tons, linha do meio e círculo central, uma pequena área e um gol em cada extremidade (esquerda e direita), com paredes laterais arredondadas em cima e embaixo (bordas de acrílico azul), cantos arredondados. Sem peças, sem bola, sem texto, sem logotipos. Imagem única opaca, 1536 x 1024.
```

### W2 — Peças, bola e efeitos (grade 6 x 3)

```
Prancha W2 — Peças do futebol de disco, 3D cartoon, vistas de CIMA, PNG com fundo transparente, sem sombra, sem texto e sem números. Grade 6 colunas x 3 linhas.
Linha 1: disco-jogador azul (um disco grande com um pequeno jogador estilizado de cima, camisa azul), disco-jogador vermelho, os mesmos dois "pressionados" (mais claros, brilho no contorno), disco-jogador azul com destaque dourado (bônus), disco-jogador vermelho com destaque dourado, anel de destaque vazio.
Linha 2: bola de futebol vista de cima (normal), com borrão de movimento, girando em 2 quadros diferentes, bola pequena, trave de gol vista de cima (azul e vermelha).
Linha 3 (efeitos): bola na rede (rede esticando, 2 quadros), faíscas de impacto na parede (3 quadros), explosão de confete de gol (3 quadros), estrelinhas douradas (2 quadros).
```

---

## Z — Bolas com giro desenhado (opcional)

```
Prancha Z — Sequências de giro de bolas, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto. Grade 8 colunas x 2 linhas. Linha 1: bola de basquete girando em 8 quadros (a bola rodando em torno de si, com as linhas pretas se movendo, rotação completa ao longo da sequência). Linha 2: bola de futebol girando em 8 quadros do mesmo modo. Todas do mesmo tamanho, centralizadas na célula.
```

---

## Prompts de correção

**Fundo não transparente:** `A imagem precisa ser PNG com fundo transparente real (canal alfa). Não use branco, cinza nem quadriculado desenhado. Refaça a mesma prancha corrigindo só o fundo.`

**Câmera errada:** `A câmera deve ficar atrás e acima, cerca de 55 graus para baixo, olhando para a frente ao longo da pista (ou do rio). O personagem aponta para longe da câmera. Refaça todas as peças com o mesmo ângulo.`

**Rio em curva:** `O rio deve ser reto, descendo em linha reta para dentro da imagem, com as margens em simetria aproximada. Não use curva nem diagonal. Refaça só o cenário.`

**Veículo atravessado:** `O veículo deve apontar para longe da câmera, com o comprimento na linha de visão. Refaça corrigindo só a orientação.`

**Peças encostando:** `Cada peça precisa ficar centralizada na própria célula, com margem em todos os lados. Refaça reorganizando na grade.`

**Texto ou marca:** `Remova qualquer letra, número, logotipo ou marca. As superfícies devem ficar lisas.`

## Checklist antes de enviar

- [ ] Câmera alta (cerca de 55 graus) e igual em todas as peças das pranchas X.
- [ ] Rio **reto**, de frente (X2).
- [ ] Quadra de vôlei de **lado**, rede no meio (V1) e campo do futebol de **cima** (W1).
- [ ] PNG com transparência real nas peças; cenários opacos.
- [ ] Sem texto, números ou logotipos.
- [ ] Mesmo personagem, roupa e escala em todos os quadros.
- [ ] 1536 x 1024.

## Depois que as imagens chegarem

1. O fatiador recorta tudo e eu troco as artes das pistas por quadros de câmera mais alta.
2. Crio a **arena compartilhada** no `play-session.js` e implemento o **Vôlei de dois jogadores** (bola lenta que acelera a cada rebatida) e o **Futebol de disco**.
3. Se vier a prancha Z, troco o giro da bola de basquete pelos quadros desenhados.
