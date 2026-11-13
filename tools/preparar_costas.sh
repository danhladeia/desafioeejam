#!/usr/bin/env bash
# Recorta as pranchas de costas (skatista U1 e caiaque U2) em sprites WebP transparentes.
# Originais intactos em assets/visual/arcade/pranchas/. Saída em assets/visual/arcade/sprites/.
set -e
cd "$(dirname "$0")/.."
P=assets/visual/arcade/pranchas
O=assets/visual/arcade/sprites
python -I tools/fatiar_prancha.py $P/U1-skatista-de-costas.png --out $O/skate-back --prefix skater --grid 4x3 --scale 0.6 --strong --anchor bottom
# U2 já tem transparência real: não usar --flood nem --chroma
python -I tools/fatiar_prancha.py $P/U2-caiaque-de-costas.png --out $O/rio-back --prefix boat --grid 4x3 --scale 0.6 --anchor bottom
