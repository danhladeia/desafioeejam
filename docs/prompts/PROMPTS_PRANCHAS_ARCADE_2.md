# Pranchas de imagem — segunda leva dos jogos arcade

Novos jogos e mudanças pedidos: **Cesta** (só fazer cestas, com a cesta se movendo), **Chute a Gol** de chute livre (alvos de pontos e goleiro defendendo), **Vôlei** refeito (sem jogadores: o aluno desliza o dedo sobre a bola, como no Fruit Ninja, e o tipo de deslize dá efeito e velocidade), **câmera isométrica** nos jogos de pista (skate e rio), **corrida de mountain bike** (2D horizontal), **tiro ao alvo com arco e flecha**, **modo solo contra bot** e **dificuldades fácil, médio e difícil**. Também há pranchas para os jogos que ainda não têm arte: Roda de Capoeira (O), Pose por Pose (P), Passe Certo (Q) e Volta ao Mundo das Lutas (R); a Descida do Rio está na J.

Todas as pranchas pedem **PNG com fundo transparente** (canal alfa), na grade de 1536 x 1024. Elas complementam `PROMPTS_PRANCHAS_ARCADE.md` e `DESENVOLVIMENTO_8_JOGOS.md`; os personagens seguem o elenco da **Prancha A** (`assets/visual/arcade/pranchas/A-elenco.png`).

## Como usar

1. Abra uma **conversa nova** no gerador e cole o **Prompt mestre** abaixo. Anexe a **Prancha A** (elenco) e, se quiser, uma imagem de Faísca ou Pipo.
2. Gere as pranchas na ordem abaixo, uma por vez. Anexe a Prancha A em todas as que têm personagens.
3. Salve cada uma como **PNG** em `assets/visual/arcade/pranchas/` com o nome da prancha (por exemplo, `K1-mtb-ciclista.png`).
4. Confira o **checklist** e use os **prompts de correção** se algo vier errado.
5. Me envie ou avise que estão na pasta. O fatiador (`tools/fatiar_prancha.py`) recorta, e eu ligo ao jogo.

Se o gerador **não** entregar transparência real (mostrar quadriculado desenhado ou fundo branco), use o **plano B**: fundo verde chapado `#00FF00`, que o fatiador remove (`--chroma`, ou `--strong` nas pranchas de personagens).

Ordem sugerida: **K → L → S → T → I → J → M → N → O → P → Q → R** (o multiplayer ficou para depois).

---

## Prompt mestre (colar uma vez)

```
Você vai criar pranchas de sprites para um jogo educativo escolar de Educação Física, para lousa digital horizontal. Siga SEMPRE estas regras em todas as imagens desta conversa:

ESTILO: 3D cartoon polido, estilo animação infantil (como os mascotes Faísca, a lâmpada azul, e Pipo, o foguete laranja): formas arredondadas, volumes macios, contorno limpo, cores vivas e saturadas, brilho suave. Sem realismo.

FORMATO E TRANSPARÊNCIA: entregue PNG com FUNDO TRANSPARENTE REAL (canal alfa). Não desenhe fundo, não desenhe quadriculado, não use branco nem cinza como fundo. Nada de sombra projetada no chão, reflexo, brilho espalhado (glow) ou desfoque fora do contorno das peças: as bordas devem ser limpas e nítidas, para recorte preciso. Se o fundo transparente não for possível, use verde chapado #00FF00 uniforme e avise. Não use verde #00FF00 nem verdes muito próximos nas peças.

COMPOSIÇÃO: cada peça ou quadro fica ISOLADO dentro da sua célula de uma grade invisível, centralizado, com margem generosa, sem encostar em outra peça nem na borda. Todas as peças de uma prancha têm tamanho parecido. Sem linhas de grade, numeração ou legenda.

SEM TEXTO: nenhuma letra, número, logotipo, marca, camisa de time ou símbolo de marca esportiva. Superfícies que receberiam texto ficam lisas e vazias.

PERSONAGENS: crianças e adolescentes de 12 a 15 anos, diversos (tons de pele, cabelos e corpos variados), expressão alegre e concentrada, uniforme esportivo escolar simples e modesto, com equipamento de proteção quando o esporte pedir (capacete, joelheiras, cotoveleiras). Inclusivos. Sem violência e sem armas reais: arco e flecha são de treino escolar, com ponta de borracha arredondada e flechas coloridas.

ANIMAÇÃO: em sequências de quadros, mantenha o MESMO personagem, a mesma roupa, a mesma escala e a MESMA posição do ponto de apoio (pés, rodas ou base do barco) em todos os quadros, mudando só a pose.

Responda só com a imagem. Formato 1536 x 1024 pixels, horizontal, PNG com transparência.
```

---

## K — Corrida de Mountain Bike (2D horizontal, vista lateral)

O ciclista sempre aponta para a **direita**. O terreno sobe e desce; o jogador acelera e controla o salto.

### K1 — Ciclista (animação, 12 quadros, grade 4 x 3)

```
Prancha K1 — Ciclista de mountain bike em VISTA LATERAL, apontando para a DIREITA, de capacete, joelheiras e luvas, em bicicleta de montanha de cores vivas. Use um personagem da Prancha A (anexada). Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra no chão. Os pneus tocam a mesma linha base em todos os quadros do chão; o centro da roda traseira fica no mesmo ponto.
Linha 1 (no chão): 1-4) pedalada em 4 quadros do ciclo (pedais e pernas em posições diferentes, roda girando).
Linha 2: 5) acelerando forte (corpo baixo e inclinado à frente, rastros de velocidade simples ao redor); 6) empinando em uma roda de leve (roda dianteira levantando); 7) preparando o salto (agachado, comprimindo a bicicleta); 8) subindo no ar (bicicleta inclinada para cima).
Linha 3: 9) no topo do salto (bicicleta reta, braços estendidos); 10) descendo com a roda dianteira para baixo; 11) aterrissagem amortecida (suspensão comprimida); 12) queda: ciclista caído ao lado da bicicleta, aborrecido mas sem se machucar (sem sangue).
```

### K2 — Terreno, obstáculos e itens (24 peças, grade 6 x 4)

```
Prancha K2 — Elementos de trilha de mountain bike em VISTA LATERAL, apontando para a direita, escala parecida com a bicicleta, PNG com fundo transparente, sem sombra. Grade 6 colunas x 4 linhas, uma peça por célula, cada uma com a base reta (para encaixar no chão).
Linha 1 (rampas e saltos): rampa de terra pequena, rampa de terra grande, trampolim de madeira, rampa dupla (dois montes), ponte de madeira curta, rampa de pedras.
Linha 2 (obstáculos): pedra pequena, pedra grande, tronco caído, raízes no chão, poça de lama, buraco no chão visto de lado (corte da terra).
Linha 3 (placas e referências, sem texto): cone, barreira listrada, arco de largada (vazio, sem texto), arco de chegada com bandeirinhas xadrez (sem letras), bandeirola de distância, placa de seta para a direita.
Linha 4 (itens para pegar): garrafa de água, capacete, moeda dourada lisa, estrela dourada, coração, raio de turbo (formato de raio, amarelo).
```

### K3 — Cenário em camadas (efeito de profundidade)

Peça **cinco imagens separadas**, uma por vez, cada uma no formato **1536 x 1024**. As camadas de montanha, floresta e chão precisam **repetir sem emenda** na horizontal.

```
Camada 1 — Céu: céu azul claro com nuvens grandes e macias, sem sol forte, sem montanhas. Imagem única opaca, 1536 x 1024.
```

```
Camada 2 — Montanhas distantes: cordilheira suave em azul-esverdeado claro, bem ao longe. PNG com fundo TRANSPARENTE, ocupando só a metade inferior da imagem (a de cima fica transparente). A borda esquerda e a borda direita devem ter o MESMO contorno, para repetir sem emenda ao lado de si mesma.
```

```
Camada 3 — Floresta média: faixa de árvores arredondadas e arbustos em verdes diversos (pode usar verdes, ela não é o fundo), com colinas. PNG com fundo TRANSPARENTE, ocupando só a metade inferior. Borda esquerda e direita idênticas para repetir sem emenda.
```

```
Camada 4 — Terra da trilha (tile do chão): faixa horizontal de terra batida marrom, com pedrinhas e grama curta no topo, vista de lado, bem plana. PNG com fundo TRANSPARENTE, a faixa ocupa só o terço inferior da imagem. Borda esquerda e direita idênticas para repetir sem emenda.
```

```
Camada 5 — Primeiro plano: arbustos e capim alto que passam rápido na frente do ciclista, só nas laterais inferiores. PNG com fundo TRANSPARENTE, peças soltas em grade 4 x 1, cada uma isolada.
```

### K4 — Efeitos (grade 6 x 3)

```
Prancha K4 — Efeitos do mountain bike, PNG com fundo transparente, sem texto. Grade 6 x 3, uma sequência por linha.
Linha 1: poeira levantada pelas rodas em 6 quadros (nasce, cresce, some).
Linha 2: respingo de lama em 6 quadros; faíscas de turbo amarelas atrás da bicicleta em 6 quadros alternativos (3 de turbo + 3 de aterrissagem com poeira).
Linha 3: linhas de velocidade horizontais em 3 intensidades, estrelinhas de acerto douradas em 3 quadros.
```

---

## L — Tiro ao Alvo com Arco e Flecha

Vista de **costas**, atrás do arqueiro, com os alvos à frente. O jogador arrasta para mirar (puxar o arco) e solta.

### L1 — Arqueiro (animação, 12 quadros, grade 4 x 3)

```
Prancha L1 — Arqueiro de COSTAS (3/4 por trás), mirando para a frente, em uniforme esportivo escolar com protetor de braço, arco de treino. Use um personagem da Prancha A (anexada). Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra, pés no mesmo ponto da célula.
Linha 1: 1) em pé, relaxado, arco baixo; 2) pega a flecha; 3) encaixa a flecha no arco; 4) levanta o arco, mirando.
Linha 2: 5) puxa a corda (tensão leve); 6) puxa a corda (tensão média); 7) puxa a corda (tensão total, olho na mira); 8) solta, braço da corda para trás.
Linha 3: 9) acompanha o tiro, arco levantado; 10) comemoração com braços para cima; 11) lamentando, cabeça baixa; 12) olhando o alvo com a mão na testa.
```

### L2 — Arco e flechas (grade 6 x 3)

```
Prancha L2 — Equipamento de tiro com arco, de treino escolar, PNG com fundo transparente, sem sombra, sem texto. Grade 6 colunas x 3 linhas.
Linha 1: arco relaxado de lado; arco com a corda puxada em 3 níveis de tensão (leve, média, total, os três com a flecha encaixada); aljava de couro com 3 flechas coloridas.
Linha 2 (flechas de treino, ponta de borracha arredondada, penas coloridas): flecha reta vista de lado em azul, vermelha e amarela; flecha vista de frente (cravando); flecha com leve borrão de movimento.
Linha 3: flecha cravada no alvo vista de lado (3 cores); flecha cravada vista de frente (1 quadro); flecha caída no chão; protetor de braço; luva de arqueiro.
```

### L3 — Alvos (grade 6 x 3)

```
Prancha L3 — Alvos de tiro com arco, PNG com fundo transparente, sem texto e sem números. Grade 6 colunas x 3 linhas.
Linha 1 (alvos de frente, aros coloridos de fora para dentro: branco, preto, azul, vermelho, amarelo no centro): alvo grande, alvo médio, alvo pequeno, alvo mini (bônus), alvo dourado de bônus, alvo com estrela no centro.
Linha 2: alvo grande em cavalete de madeira (vista 3/4), alvo médio em cavalete, alvo preso em trilho horizontal (com suporte), alvo pendurado por corda, alvo giratório sobre eixo (2 quadros).
Linha 3: biruta de vento (3 quadros: parada, leve, forte), bandeirinha de distância, fardo de palha de apoio, alvo atingido tremendo (2 quadros).
```

### L4 — Cenário do campo de tiro (imagem opaca, 1536 x 1024)

```
Cenário de campo de tiro com arco ao ar livre: gramado largo em perspectiva, árvores e colinas ao fundo, céu azul claro, bandeirinhas coloridas sem texto nas laterais, faixas de distância pintadas no gramado SEM números. Sem pessoas, sem alvos e sem texto. Imagem única opaca, 1536 x 1024.
```

---

## I — Skate em câmera isométrica (3 faixas, ângulo elevado)

A câmera fica **atrás e acima** (cerca de 45° para baixo), para ver os obstáculos de cima e de frente, sem esconder o que vem na pista.

### I1 — Skatista em ângulo elevado (12 quadros, grade 4 x 3)

```
Prancha I1 — Skatista de COSTAS visto de ângulo ELEVADO (câmera atrás e acima, cerca de 45 graus para baixo, estilo isométrico), em skate, com capacete, joelheiras e cotoveleiras. Use um personagem da Prancha A. Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem sombra no chão. Skate e rodas no MESMO ponto da célula.
Linha 1: 4 quadros do ciclo de deslizar.
Linha 2: inclinado para a esquerda, inclinado para a direita, agachado, salto no ar com braços abertos.
Linha 3: aterrissagem com poeira, tropeço, caído sentado, comemorando com braço levantado.
```

### I2 — Obstáculos e itens em ângulo elevado (24 peças, grade 6 x 4)

```
Prancha I2 — Objetos de pista urbana vistos de ângulo ELEVADO isométrico (câmera acima e à frente, cerca de 45 graus), de modo que se vejam o topo e a frente de cada objeto. PNG com fundo transparente, sem sombra, sem texto. Grade 6 colunas x 4 linhas, base de cada objeto centralizada.
Linha 1 (baixos, para pular): cone, caixote de madeira, saco de lixo, balde, tábua no chão, poça de água.
Linha 2 (laterais, para desviar): banco de praça, lixeira, barreira de obra listrada, poste curto, carrinho de feira, bicicleta parada.
Linha 3 (itens): capacete, garrafa de água, joelheira, estrela dourada, moeda lisa, coração.
Linha 4: três arcos de passagem sobre a pista (azul, amarelo, vermelho) vazios no centro, para agachar; rampa de salto; seta para cima; placa lisa em branco.
```

### I3 — Cenário isométrico (imagem opaca, 1536 x 1024)

```
Rua de cidade em ângulo ELEVADO isométrico: pista de asfalto com 3 faixas separadas por linhas tracejadas, vista de cima e um pouco de trás, com perspectiva suave (as faixas quase paralelas, sem ponto de fuga forte), calçadas, prédios baixos coloridos e árvores nas laterais. Sem pessoas, sem veículos, sem texto. Imagem única opaca, 1536 x 1024.
```

---

## J — Descida do Rio em câmera isométrica (3 faixas)

### J1 — Barco (12 quadros, grade 4 x 3)

```
Prancha J1 — Caiaque duplo com DOIS remadores de COSTAS, vistos de ângulo ELEVADO isométrico (câmera atrás e acima, 45 graus), de colete salva-vidas e capacete (use dois personagens da Prancha A). Grade 4 x 3 (12 quadros), PNG com fundo transparente, sem água desenhada e sem sombra. Base do barco no MESMO ponto.
Linha 1: 4 quadros do ciclo de remada. Linha 2: inclinado à esquerda, inclinado à direita, pulando uma onda, batendo na pedra (susto). Linha 3: virado de lado, equilibrando, comemorando, parado.
```

### J2 — Obstáculos e itens do rio (24 peças, grade 6 x 4)

```
Prancha J2 — Objetos de rio em ângulo ELEVADO isométrico, topo e frente visíveis. PNG com fundo transparente, sem sombra, sem texto. Grade 6 x 4.
Linha 1 (obstáculos): pedra pequena, pedra grande, tronco boiando, galho, rede de pesca presa, arbusto.
Linha 2 (lixo que NÃO se deve pegar): garrafa plástica, saco plástico, lata, pneu, sacola, copo.
Linha 3 (itens): colete salva-vidas, capacete, remo, garrafa de água, estrela dourada, folha verde azulada.
Linha 4: três arcos de portal sobre o rio (azul, amarelo, vermelho) vazios no centro; redemoinho; onda com espuma em 3 quadros; rampa de cachoeira pequena.
```

### J3 — Cenário do rio (imagem opaca, 1536 x 1024)

```
Rio descendo em ângulo ELEVADO isométrico visto de cima e um pouco de trás, 3 faixas de corrente, margens com mata densa e rochas, luz de fim de tarde. Sem pessoas, sem barcos, sem texto. Imagem única opaca, 1536 x 1024.
```

---

## M — Cesta (só fazer cestas)

As imagens da **Prancha E** já existem. Faltam a **cesta com rede animada** e itens para a cesta que se move.

### M1 — Cesta, rede e variações (grade 6 x 3)

```
Prancha M1 — Elementos de cesta de basquete para jogo de arremesso, de FRENTE, PNG com fundo transparente, sem sombra, sem texto. Grade 6 colunas x 3 linhas.
Linha 1: cesta com tabela em 3 tamanhos (grande, média, pequena), a mesma cesta na versão dourada de bônus, cesta azul, cesta vermelha.
Linha 2 (rede em movimento, mesma cesta): rede parada, rede esticada pela bola entrando, rede balançando para a esquerda, rede balançando para a direita, rede voltando, rede parada de novo.
Linha 3: bola de basquete de frente, bola com borrão de movimento, bola girando em 2 ângulos, anel de destaque vazio ao redor da cesta (pulsando em 2 tamanhos).
```

### M2 — Cenário e efeitos da cesta

```
Prancha M2 — Efeitos de acerto da cesta, PNG com fundo transparente, sem texto. Grade 6 x 2. Linha 1: estrelinhas douradas brilhando em 6 quadros (sequência). Linha 2: explosão de confete colorido em 6 quadros; arco pontilhado de trajetória (3 curvaturas) dos quadros 5 e 6 reduzidos.
```

```
Cenário: ginásio de basquete visto de frente, parede de fundo clara com arquibancada simples, piso de madeira, sem pessoas e sem texto. Imagem única opaca, 1536 x 1024.
```

---

## N — Modo solo: bot e dificuldades (interface)

### N1 — Bot (robô amigo, 8 poses, grade 4 x 2)

```
Prancha N1 — Mascote ROBÔ AMIGO (o "bot" adversário), estilo 3D cartoon como os mascotes Faísca e Pipo: corpo arredondado cinza-azulado, cabeça grande com olhos digitais simpáticos, antenas, luvas brancas, tênis. Sem texto. Grade 4 colunas x 2 linhas (8 poses), PNG com fundo transparente, sem sombra, pés no mesmo ponto: 1) em pé, esperando; 2) pensando (mão no queixo, olhos piscando); 3) preparando o lance; 4) jogando (braço em movimento); 5) comemorando; 6) errando, cabeça baixa; 7) saudando, mão no alto; 8) com um troféu pequeno.
```

### N2 — Ícones de modo e dificuldade (grade 4 x 2)

```
Prancha N2 — Ícones de interface, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto. Grade 4 colunas x 2 linhas, cada ícone dentro de um selo redondo de tamanho igual.
Linha 1 (dificuldade): FÁCIL (uma tartaruga simpática verde-azulada com uma estrela); MÉDIO (um coelho amarelo com duas estrelas); DIFÍCIL (um foguete vermelho com três estrelas); estrela dourada solta.
Linha 2 (modo): JOGAR SOZINHO (uma criança sozinha); CONTRA O BOT (a criança ao lado do robô, em duelo amistoso); troféu dourado; medalha de participação.
```

---

## O — Roda de Capoeira (ritmo, sem golpes)

Ritmo, cultura e história. Nenhuma imagem mostra pessoas lutando.

### O1 — Instrumentos e marcas de ritmo (grade 4 x 3)

```
Prancha O1 — Instrumentos da roda de capoeira, estilo 3D cartoon, PNG com fundo transparente, sem sombra no chão, sem texto. Grade 4 colunas x 3 linhas. Cada instrumento isolado, de frente, bem detalhado.
Linha 1: berimbau (arco de madeira com cabaça e corda), atabaque (tambor alto de madeira com couro), pandeiro, agogô (dois sinos de metal).
Linha 2: os mesmos quatro instrumentos em versão "tocando" (pequenas ondas sonoras simples ao redor, sem brilho espalhado).
Linha 3: quatro anéis de marca de ritmo (azul, laranja, amarelo, roxo), vazios no centro, e a marca de acerto em estrela dourada com versões nas mesmas quatro cores.
```

### O2 — Personagens da roda (grade 4 x 3)

```
Prancha O2 — Roda de capoeira, personagens de FRENTE, uniforme branco de capoeira (calça e camiseta brancas) com cordão colorido na cintura. Use dois personagens da Prancha A (anexada). Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra, pés no mesmo ponto por linha.
Linha 1: personagem A, ginga em 4 quadros (pés alternando, braços protegendo o corpo, sem contato com ninguém).
Linha 2: personagem B, ginga em 4 quadros, mais animada, com pequeno giro.
Linha 3: tocador sentado tocando berimbau (2 quadros), tocador de atabaque (2 quadros), batendo palmas (2 quadros), comemorando (2 quadros).
Sem golpes, sem chutes, sem contato entre personagens.
```

### O3 — Cenário (imagem opaca, 1536 x 1024)

```
Cenário da roda de capoeira: praça de terra batida ao entardecer, casario colorido e palmeiras ao fundo, bandeirolas sem texto, céu laranja suave, espaço central livre. Estilo 3D cartoon, sem pessoas e sem texto. Imagem única opaca, 1536 x 1024.
```

---

## P — Pose por Pose (ginástica no ritmo)

### P1 — Poses de ginástica (grade 4 x 3, 12 poses)

```
Prancha P1 — Poses de ginástica, personagem de FRENTE, roupa de ginástica escolar (camiseta e shorts), sapatilha. Use dois personagens da Prancha A (anexada): seis poses com cada um. Grade 4 colunas x 3 linhas (12 poses), PNG com fundo transparente, sem tapete, sem sombra, apoio no mesmo ponto da célula.
Poses: 1) equilíbrio em uma perna, braços abertos; 2) avião (tronco inclinado à frente, uma perna atrás); 3) estrela de pé (braços e pernas abertos); 4) agachamento com braços à frente; 5) alongamento lateral com um braço sobre a cabeça; 6) ponte; 7) salto com as pernas afastadas; 8) parada de duas mãos (sem parede desenhada); 9) rolamento (posição de bolinha); 10) flexão de braços no solo; 11) alongamento sentado de pernas; 12) comemoração com braços para cima.
```

### P2 — Botões e interface do ritmo (grade 4 x 2)

```
Prancha P2 — Elementos de interface do jogo de ritmo, 3D cartoon, PNG com fundo transparente, sem texto. Grade 4 x 2 (8 peças): quatro botões redondos de pose vazios (azul, vermelho, amarelo, verde azulado escuro), os mesmos quatro botões "pressionados" (mais claros, com pequeno brilho interno). Em uma segunda prancha, se preferir: nota musical, coração, estrela dourada, anel de marca vazio, marca de acerto em estrela, marca de erro em X cartoon, barra de combo vazia e barra de combo cheia.
```

### P3 — Cenário (imagem opaca, 1536 x 1024)

```
Ginásio escolar visto de frente, piso de madeira clara, colchonetes coloridos e barras de ginástica ao fundo, luz suave, espaço livre no centro, sem pessoas e sem texto. Estilo 3D cartoon. Imagem única opaca, 1536 x 1024.
```

---

## Q — Passe Certo (tática de invasão, vista de cima)

### Q1 — Jogadores vistos de cima (grade 6 x 3)

```
Prancha Q1 — Jogadores e bola de uma quadra de esportes de invasão, vistos de CIMA (top-down), estilo 3D cartoon, PNG com fundo transparente, sem sombra, sem texto. Grade 6 colunas x 3 linhas, uma peça por célula, todas com o mesmo tamanho.
Linha 1 (ataque, uniforme azul): 6 jogadores em poses diferentes de corrida e giro, cabelos diferentes.
Linha 2 (defesa, uniforme vermelho): 6 jogadores correndo e marcando, braços abertos.
Linha 3: bola de basquete de cima, bola de handebol, bola de futebol, anel de destaque azul vazio, anel de destaque amarelo vazio, seta curva de passe pontilhada.
```

### Q2 — Quadra e marcações

```
Imagem 1 (opaca, 1536 x 1024): quadra poliesportiva vista de cima, piso de madeira clara, linhas brancas simples, sem texto, sem logotipos, sem plateia.
Imagem 2 (PNG com fundo transparente, grade 4 x 2): marca de espaço livre (círculo verde azulado translúcido com contorno), marca de espaço ocupado (círculo vermelho com contorno), linha pontilhada de trajetória, alvo de passe (cruz), marca de interceptação (X cartoon), três estrelas de acerto (bronze, prata, ouro) e um apito.
```

---

## R — Volta ao Mundo das Lutas (mapa)

Confirme a lista de lutas nas páginas do caderno do 9º ano antes de gerar. **Nenhuma imagem mostra pessoas lutando**: só equipamentos, uniformes e ícones.

### R1 — Cartões (grade 4 x 2, 8 ícones)

```
Prancha R1 — Ícones de lutas do mundo para cartões, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto, sem bandeiras. Grade 4 colunas x 2 linhas. Cada ícone mostra só o equipamento ou uniforme, nunca uma pessoa lutando.
1) judô: kimono branco dobrado com faixa colorida; 2) karatê: kimono branco com faixa preta; 3) taekwondo: protetor de tronco e capacete; 4) muay thai: luvas e bermuda de tecido listrado genérico; 5) capoeira: berimbau e cordão; 6) boxe: par de luvas; 7) kung fu: leque e fita vermelha; 8) sumô: faixa de tecido e leque de arbitragem.
```

### R2 — Avião, marcadores e interface (grade 4 x 2)

```
Prancha R2 — Elementos do jogo de mapa, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto. Grade 4 x 2: avião cartoon visto de cima (2 quadros), avião de lado, nuvem pequena, pino de mapa vazio (3 cores), estrela de acerto, balão de dica em silhueta SEM letra, moldura de cartão arredondada em branco.
```

### R3 — Mapa-múndi (imagem opaca, 1536 x 1024)

```
Mapa-múndi ilustrado, estilo 3D cartoon, continentes em cores suaves e distintas, oceanos azuis claros, sem nomes, sem bandeiras, sem fronteiras tracejadas e sem texto. Escala adequada para sobrepor zonas de toque sobre Japão, Coreia, Tailândia, China, Brasil e outros. Imagem única opaca, 1536 x 1024.
```

---

## S — Chute a Gol, de chute livre (alvos de pontos e goleiro defendendo)

Novo jogo: o aluno chuta para **fazer gol de verdade**. Há **alvos específicos que valem mais pontos** e o **goleiro tenta defender**. As pranchas F1 (chutador), F2 (goleiro) e F3 (gol) já existem; faltam alvos, efeitos e mais poses do goleiro.

### S1 — Alvos de pontuação no gol (grade 6 x 3)

```
Prancha S1 — Alvos de pontuação para o gol de futebol, 3D cartoon, PNG com fundo transparente, sem sombra, SEM texto e SEM números (a pontuação é indicada por cor, tamanho e estrelas). Grade 6 colunas x 3 linhas.
Linha 1 (alvos circulares para o canto do gol, aros de fora para dentro): alvo grande bronze, alvo médio prata, alvo pequeno dourado, alvo mini dourado com uma estrela no centro, alvo azul de bônus, alvo vermelho de bônus.
Linha 2: alvo de ângulo (canto superior, em formato de quarto de círculo, esquerdo e direito), alvo retangular baixo (rente à trave), alvo retangular no meio, alvo móvel (disco com setas laterais), alvo que pisca (2 quadros).
Linha 3: três estrelas (bronze, prata, ouro) de acerto, marca de acerto em círculo brilhante em 3 quadros.
```

### S2 — Efeitos do chute (grade 6 x 3)

```
Prancha S2 — Efeitos do jogo de chute a gol, 3D cartoon, PNG com fundo transparente, sem sombra no chão, sem texto. Grade 6 colunas x 3 linhas, uma sequência por linha.
Linha 1: bola na rede (rede se esticando e voltando) em 6 quadros, vista de frente, o gol inteiro e a bola dentro.
Linha 2: bola na trave (impacto com pequenas faíscas em 3 quadros) e bola na trave com a bola quicando (3 quadros).
Linha 3: defesa do goleiro (luvas segurando a bola com estrelinhas, 3 quadros) e poeira de grama levantada pelo chute (3 quadros).
```

### S3 — Goleiro, poses extras de defesa (grade 4 x 3)

```
Prancha S3 — Goleiro de FRENTE (camiseta amarela, shorts azuis, luvas), o mesmo da Prancha F2 (anexe a F2 como referência). Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra, pés no mesmo ponto quando em pé.
Linha 1: espera agachado (2 quadros de balanço leve), desloca para a esquerda, desloca para a direita.
Linha 2: salto alto com as duas mãos, defesa com uma mão à esquerda, defesa com uma mão à direita, soco na bola.
Linha 3: defesa baixa com as duas mãos, deslizando de joelhos, perde a bola (frustrado), comemora a defesa.
```

---

## T — Vôlei por deslize (sem jogadores)

Um jogador de cada lado, **sem personagens na tela**. O aluno desliza o dedo sobre a bola como no Fruit Ninja, e o tipo de deslize define o golpe: cortada (rápido e reto), levantada (para cima e curto), efeito (curvo) e direção (diagonal). Só aparecem a rede, a bola, a quadra, o rastro do dedo e as zonas de pontos. O adversário (outro aluno ou bot) é representado pela quadra do outro lado e por efeitos.

Reaproveita da **Prancha G** (`G2`: bolas e rede) o que servir. As pranchas abaixo trazem a quadra em perspectiva e os elementos que faltam.

### T1 — Quadra e rede em perspectiva (peças e cenário)

```
Imagem 1 (opaca, 1536 x 1024): quadra de vôlei vista de trás da linha de fundo, em perspectiva, com a rede cruzando a quadra no meio e a quadra adversária ao fundo, piso de madeira clara com linhas brancas, arquibancada simples e ginásio desfocado ao fundo. Sem pessoas, sem texto, sem placas com letras, sem logotipos.
Imagem 2 (PNG com fundo transparente, grade 4 x 2): rede de vôlei de frente (inteira, vazia), rede esticada pela bola (2 quadros), rede balançando (2 quadros), antena lateral da rede, poste da rede, marca de linha da quadra em perspectiva.
```

### T2 — Bola, zonas de pontos e efeitos (grade 6 x 4)

```
Prancha T2 — Elementos do vôlei, 3D cartoon, PNG com fundo transparente, sem sombra, sem texto e sem números. Grade 6 colunas x 4 linhas.
Linha 1 (bola): bola de vôlei de frente, com borrão suave de movimento, girando em 3 quadros diferentes, bola pequena (para a distância).
Linha 2 (zonas de pontuação desenhadas no chão da quadra adversária, em perspectiva): zona verde azulada (1 ponto), zona amarela (2 pontos), zona vermelha (3 pontos), zona dourada pequena com estrela (bônus), faixa de linha lateral, marca de queda da bola.
Linha 3 (efeitos de rebatida): estrelinhas douradas de acerto em 3 quadros, impacto da mão na bola (onda curta) em 3 quadros.
Linha 4 (efeitos de ponto): confete colorido em 3 quadros, nuvem de poeira da quadra em 3 quadros.
```

### T3 — Rastro do deslize e golpes (grade 6 x 3)

```
Prancha T3 — Efeitos do deslize do dedo e dos golpes de vôlei, 3D cartoon, PNG com fundo transparente, sem texto. Grade 6 colunas x 3 linhas.
Linha 1 (rastros do dedo): rastro reto rápido branco-azulado (3 quadros do início ao fim), rastro curvo em arco (3 quadros).
Linha 2 (golpes na bola): cortada (bola com cauda de velocidade vermelha, 2 quadros), levantada (bola subindo com cauda azul, 2 quadros), efeito (bola com espiral amarela, 2 quadros).
Linha 3: ponto de impacto do dedo na bola (anel curto em 3 quadros), bola saindo da quadra (aviso: pequena seta vermelha pulsando, 3 quadros).
```

---

## Prompts de correção

**Fundo não transparente:** `A imagem precisa ser PNG com fundo transparente real (canal alfa). Não use branco, cinza nem desenho de quadriculado. Refaça a mesma prancha, idêntica, apenas corrigindo o fundo.`

**Sombra ou brilho espalhado:** `Remova sombras no chão, reflexos e brilhos que se espalham fora dos contornos. As bordas devem ser limpas e nítidas. Refaça mantendo o resto.`

**Peças encostando:** `Cada peça precisa ficar centralizada na própria célula, com margem em todos os lados, sem encostar em outra peça nem na borda. Refaça reorganizando na grade.`

**Texto ou marca:** `Remova qualquer letra, número, logotipo ou marca. As superfícies devem ficar lisas.`

**Personagem mudou entre quadros:** `O personagem, a roupa e a escala devem ser idênticos em todos os quadros, com a base no mesmo ponto. Use o quadro 1 como referência e mude só a pose.`

**Câmera errada (isométrica):** `A câmera deve ficar atrás e acima, cerca de 45 graus para baixo, mostrando o topo e a frente dos objetos. Refaça todas as peças com o mesmo ângulo.`

**Camada que não repete sem emenda:** `A borda esquerda e a borda direita desta imagem precisam ter exatamente o mesmo contorno, para repetir lado a lado sem emenda. Refaça só ajustando as bordas.`

**Estilo mudou:** `Volte ao estilo 3D cartoon polido, igual à Prancha A, com volumes macios e cores vivas.`

---

## Checklist antes de enviar

- [ ] PNG com transparência real (o fundo não pode estar desenhado).
- [ ] Sem sombras no chão e sem brilho espalhado fora do contorno.
- [ ] Cada peça isolada na célula, sem tocar nas vizinhas.
- [ ] Sem letras, números, logotipos ou marcas.
- [ ] Mesmo personagem, roupa, escala e ponto de apoio em todos os quadros.
- [ ] Câmera elevada igual em todas as peças das pranchas I e J.
- [ ] Camadas do cenário de mountain bike repetem sem emenda (K3, camadas 2 a 4).
- [ ] Arco e flechas de treino, com ponta de borracha, sem aparência de arma real.
- [ ] Tamanho 1536 x 1024.

## Depois que as pranchas chegarem

1. O fatiador recorta cada peça (`tools/fatiar_prancha.py`, com `--grid` para os quadros de animação).
2. Eu ligo as artes aos jogos e ajusto o cache offline.
3. Só então implemento as mudanças de jogabilidade:
   - Cesta: só fazer cestas, a cesta troca de lugar a cada acerto e, depois de certa pontuação, desliza para os lados.
   - Chute a Gol: o aluno chuta para fazer gol de verdade, sem relação com resposta. Alvos específicos valem mais pontos e o goleiro tenta defender.
   - Vôlei: deslize do dedo sobre a bola (cortada, levantada, efeito, direção) para marcar ponto na quadra adversária, sem jogadores na tela. Substitui o Rally na Rede atual (de ritmo).
   - Dificuldade crescente em todos os jogos e seleção fácil, médio e difícil.
   - Câmera isométrica no skate e no rio.
   - Corrida de mountain bike e tiro ao alvo com arco e flecha.
   - Modo solo: jogar sozinho ou contra o bot.
   - Desativar o jogo Rota do EMTI.
