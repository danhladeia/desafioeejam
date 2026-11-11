#!/usr/bin/env bash
# Recorta as pranchas de assets/visual/arcade/pranchas em sprites WebP (originais intactos).
set -e
cd "$(dirname "$0")/.."
P=assets/visual/arcade/pranchas; O=assets/visual/arcade/sprites; T="python -I tools/fatiar_prancha.py"
$T $P/D1-skatista.png          --out $O/skate    --prefix skater  --grid 4x3 --strong --scale 0.6
$T $P/D2-corrida-objetos.png   --out $O/skate    --prefix obj     --chroma
$T $P/E1-basquete-jogador.png  --out $O/hoops    --prefix player  --grid 4x2 --strong --scale 0.6
$T $P/E2-basquete-elementos.png --out $O/hoops   --prefix el      --strong --gap 12
$T $P/F1-chutador.png          --out $O/penalty  --prefix kicker  --grid 4x2 --strong --scale 0.6
$T $P/F2-goleiro.png           --out $O/penalty  --prefix keeper  --grid 4x3 --strong --scale 0.6
$T $P/F3-gol-campo.png         --out $O/penalty  --prefix el      --chroma --gap 6 --scale 1.0
$T $P/G1-volei-jogadores.png   --out $O/rally    --prefix player  --grid 4x3 --strong --scale 0.6
$T $P/G2-volei-elementos.png   --out $O/rally    --prefix el      --chroma --gap 8
