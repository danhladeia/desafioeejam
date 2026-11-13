#!/usr/bin/env python3
"""Recorta a terceira leva de pranchas (X, V, W, Z) em sprites WebP.
Uso: python tools/preparar_terceira.py   (originais intactos em assets/visual/arcade/pranchas)"""
import json
import os
import subprocess
import sys

from PIL import Image

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
P = 'assets/visual/arcade/pranchas'
O = 'assets/visual/arcade/sprites'
tool = os.path.join('tools', 'fatiar_prancha.py')
env = {**os.environ, 'PYTHONIOENCODING': 'utf-8'}
# (prancha, pasta, prefixo, argumentos)
SHEETS = [
    ('X3-skatista-camera-alta.png', 'skate-alto', 'skater', ['--grid', '4x3', '--scale', '0.6', '--anchor', 'bottom']),
    ('X4-caiaque-camera-alta.png', 'rio-alto', 'boat', ['--grid', '4x3', '--scale', '0.6', '--anchor', 'bottom']),
    ('V2-rede-e-elementos-lateral.png', 'volei2', 'rede', ['--cells', '4x2', '--scale', '0.6']),
    ('V3-jogadora-volei-lateral.png', 'volei2', 'jogadora', ['--grid', '4x3', '--scale', '0.6', '--anchor', 'bottom']),
    ('W2-futebol-disco-pecas-efeitos.png', 'disco', 'peca', ['--gap', '3', '--scale', '0.6']),
    ('Z-giro-bolas-basquete-futebol.png', 'bolas', 'giro', ['--gap', '3', '--scale', '0.6']),
]
SCENES = [
    ('X1-rua-camera-alta.png', 'skate-alto', 'cenario.webp', 1280),
    ('X2-rio-reto-camera-alta.png', 'rio-alto', 'cenario.webp', 1280),
    ('V1-quadra-volei-lateral.png', 'volei2', 'cenario.webp', 1280),
    ('W1-campo-futebol-disco.png', 'disco', 'campo.webp', 1280),
]
for sheet, game, prefix, extra in SHEETS:
    out = os.path.join(O, game)
    r = subprocess.run([sys.executable, '-I', tool, os.path.join(P, sheet), '--out', out, '--prefix', prefix, *extra],
                       capture_output=True, text=True, encoding='utf-8', errors='replace', env=env)
    n = len(json.load(open(os.path.join(out, prefix + '.json'), encoding='utf-8'))['items']) if r.returncode == 0 else -1
    print(f'{game}/{prefix}: {n} peças', flush=True)
for src, game, name, width in SCENES:
    out = os.path.join(O, game)
    os.makedirs(out, exist_ok=True)
    im = Image.open(os.path.join(P, src))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(out, name), 'WEBP', quality=84, method=6)
    print(f'{game}/{name}: cenário', flush=True)
print('FIM', flush=True)
