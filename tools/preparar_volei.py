#!/usr/bin/env python3
"""Recorta as pranchas do vôlei (T) em sprites WebP. Uso: python tools/preparar_volei.py"""
import json
import os
import subprocess
import sys

from PIL import Image

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
P = 'assets/visual/arcade/pranchas'
O = 'assets/visual/arcade/sprites/volei'
tool = os.path.join('tools', 'fatiar_prancha.py')
env = {**os.environ, 'PYTHONIOENCODING': 'utf-8'}
SHEETS = [
    ('T1-rede-animacoes-acessorios.png', 'rede', '4x2', 8),
    ('T2-volei-bolas-zonas-efeitos.png', 'bola', '6x4', 24),
    ('T3-volei-rastros-golpes.png', 'golpe', '6x3', 18),
]
for sheet, prefix, cells, expected in SHEETS:
    r = subprocess.run([sys.executable, '-I', tool, os.path.join(P, sheet), '--out', O, '--prefix', prefix, '--cells', cells, '--scale', '0.6'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace', env=env)
    n = len(json.load(open(os.path.join(O, prefix + '.json'), encoding='utf-8'))['items']) if r.returncode == 0 else -1
    print(f'volei/{prefix}: {n} peças (esperado {expected})', 'ok' if n == expected else 'CONFERIR')
im = Image.open(os.path.join(P, 'T1-quadra-rede-cenario.png'))
im = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS)
im.save(os.path.join(O, 'cenario.webp'), 'WEBP', quality=84, method=6)
print('cenario ok')
print('FIM')
