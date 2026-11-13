# Pranchas dos jogos de pista: personagem de costas, estilo Subway Surfers

Duas pranchas novas para a **Corrida Urbana** (skate) e a **Descida do Rio** (caiaque). O problema das atuais é a prancha e o barco aparecerem **atravessados ou de lado**; nas novas, o veículo aponta **para longe da câmera**, na mesma direção da pista.

Formato: **PNG com fundo transparente**, 1536 x 1024, grade de 4 x 3 (12 quadros). Plano B: fundo verde chapado `#00FF00`.

## Câmera (vale para as duas)

- A câmera fica **atrás e um pouco acima** do personagem, cerca de 25 a 30 graus para baixo.
- O personagem e o veículo apontam **para a frente, afastando-se da câmera**. Ele corre para dentro da imagem.
- O comprimento do skate ou do caiaque fica **na linha de visão** (encurtado pela perspectiva). Nunca atravessado.
- Vê-se as costas, a nuca e a parte de trás do capacete. Nunca o rosto.

## Como usar

1. Abra uma conversa nova e cole o **Prompt mestre** de `PROMPTS_PRANCHAS_ARCADE_2.md` (a seção "Prompt mestre"). Anexe a **Prancha A** (elenco, `assets/visual/arcade/pranchas/A-elenco.png`).
2. Gere a prancha **1 (skatista)** e depois a **2 (caiaque)**.
3. Salve em `assets/visual/arcade/pranchas/` como `U1-skatista-de-costas.png` e `U2-caiaque-de-costas.png`.
4. Confira o checklist. Depois eu recorto (`--grid 4x3`) e ligo ao jogo.

---

## Prancha 1 — Skatista de costas, skate para a frente (U1)

```
Prancha U1 — Skatista de COSTAS em skate, para um jogo de corrida em três pistas no estilo "endless runner". Use um personagem da Prancha A (anexada): capacete azul, camiseta branca, bermuda vermelha, joelheiras e cotoveleiras pretas, tênis brancos.

CÂMERA: atrás e um pouco acima do skatista (cerca de 25 a 30 graus para baixo). O skatista e o skate apontam PARA LONGE da câmera, como se ele corresse para dentro da imagem. O comprimento do skate fica NA LINHA DE VISÃO, encurtado pela perspectiva, com as quatro rodas visíveis como pequenas peças nas duas laterais da prancha. O skate NÃO fica atravessado e NÃO fica de lado. Vê-se somente as costas, a nuca e a parte de trás do capacete.

Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, sem sombra no chão e sem brilho espalhado. O skate e as rodas ficam no MESMO ponto da célula em todos os quadros (base centralizada).
Linha 1 (deslizando em linha reta, 4 quadros do ciclo): pés alternando de leve sobre a prancha, ombros balançando, braços relaxados.
Linha 2: 5) inclinado para a ESQUERDA (corpo e skate virando levemente para a esquerda, ainda de costas); 6) inclinado para a DIREITA; 7) AGACHADO, bem baixo, para passar sob um obstáculo; 8) SALTO no ar, braços abertos, skate descolado do chão e apontando para a frente.
Linha 3: 9) aterrissagem com um pouco de poeira; 10) TROPEÇO, desequilibrando para a frente, braços batendo; 11) CAÍDO sentado de costas ao lado do skate, que fica parado atrás dele, apontando para a frente; 12) COMEMORAÇÃO com um braço levantado, ainda de costas.
Mantenha exatamente o mesmo personagem, a mesma roupa e a mesma escala em todos os quadros.
```

---

## Prancha 2 — Caiaque duplo de costas (U2)

```
Prancha U2 — Caiaque duplo com DOIS remadores de COSTAS, para um jogo de descida de rio em três faixas no estilo "endless runner". Use dois personagens da Prancha A (anexada), de capacete, colete salva-vidas (amarelo) e camiseta colorida.

CÂMERA: atrás e um pouco acima do caiaque (cerca de 25 a 30 graus para baixo). O caiaque aponta PARA LONGE da câmera, descendo o rio para dentro da imagem. O comprimento do caiaque fica NA LINHA DE VISÃO, encurtado pela perspectiva, com a popa (parte de trás) grande e perto da câmera e a proa pequena e distante. O caiaque NÃO fica de lado e NÃO fica atravessado. Vê-se as costas e a nuca dos dois remadores, um atrás do outro, e as pás nas duas laterais. Nunca os rostos.

Grade 4 colunas x 3 linhas (12 quadros), PNG com fundo transparente, SEM água desenhada além de pequenos respingos presos ao casco, sem sombra e sem brilho espalhado. A popa do caiaque fica no MESMO ponto da célula em todos os quadros.
Linha 1 (remando em linha reta, 4 quadros do ciclo): as pás entrando na água alternadamente, direita e esquerda, os dois remadores no mesmo ritmo, pequenos respingos na lateral.
Linha 2: 5) inclinado para a ESQUERDA (o caiaque inclina e a proa vira levemente para a esquerda, ainda apontando para a frente); 6) inclinado para a DIREITA; 7) remadores DEBRUÇADOS para a frente, bem baixos, para passar sob uma ponte; 8) SALTO sobre uma pequena onda, proa levantada, respingos na lateral.
Linha 3: 9) aterrissagem com respingo grande dos dois lados; 10) BATIDA na pedra: o caiaque sacode, remadores com susto, pás para o alto; 11) caiaque equilibrando, remadores se segurando; 12) COMEMORAÇÃO com as pás levantadas.
Mantenha os mesmos dois personagens, o mesmo caiaque e a mesma escala em todos os quadros.
```

---

## Prompts de correção

**Veículo atravessado ou de lado:**
`O skate (ou o caiaque) está atravessado ou de lado. O comprimento dele deve ficar na linha de visão da câmera, apontando para longe, para dentro da imagem, com perspectiva de quem está atrás e um pouco acima. Refaça a mesma prancha corrigindo só a orientação.`

**Aparece o rosto:**
`Os personagens devem aparecer só de costas: nuca e parte de trás do capacete, sem rosto. Refaça.`

**Fundo não transparente:**
`A imagem precisa ser PNG com fundo transparente real (canal alfa). Não use branco, cinza nem quadriculado desenhado. Refaça a mesma prancha corrigindo só o fundo.`

**Água ou sombra desenhada:**
`Remova a água desenhada, a sombra no chão e qualquer brilho espalhado. Só pequenos respingos presos ao casco. Refaça mantendo o resto.`

**Personagem ou escala mudaram entre quadros:**
`O personagem, a roupa e a escala devem ser idênticos em todos os quadros, com a base do skate (ou da popa do caiaque) no mesmo ponto. Use o quadro 1 como referência e mude só a pose.`

**Quadros encostando:**
`Cada quadro precisa ficar centralizado na própria célula, com margem em todos os lados, sem encostar no vizinho nem na borda.`

## Checklist antes de enviar

- [ ] O skate e o caiaque apontam **para longe da câmera** em todos os quadros (exceto a queda, em que o skate pode estar parado atrás).
- [ ] Só costas e nuca; nenhum rosto.
- [ ] PNG com transparência real, sem sombra e sem brilho espalhado.
- [ ] Mesmo personagem, roupa e escala em todos os quadros; base no mesmo ponto.
- [ ] 12 quadros em 4 colunas x 3 linhas, sem encostar uns nos outros.
- [ ] Tamanho 1536 x 1024.

## Depois que as pranchas chegarem

1. O fatiador recorta em `--grid 4x3` e gera os WebP transparentes.
2. Eu troco os quadros do skatista e do caiaque no jogo e removo a prancha desenhada por código.
3. Confiro a partida completa nas duas pistas.
