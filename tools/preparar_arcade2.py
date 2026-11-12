#!/usr/bin/env python3
"""Recorta a segunda leva de pranchas (assets/visual/arcade/pranchas) em sprites WebP.
Originais intactos; saída em assets/visual/arcade/sprites/<jogo>/.
Uso: python tools/preparar_arcade2.py"""
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

# (prancha, pasta, prefixo, argumentos extras, quantidade esperada)
SHEETS = [
    ('I1-skate-personagem-12-quadros.png', 'skate-iso', 'skater', ['--grid', '4x3', '--scale', '0.6'], 12),
    ('I2-skate-obstaculos-itens.png', 'skate-iso', 'obj', ['--cells', '6x4'], 24),
    ('J1-caiaque-dupla-12-quadros.png', 'rio', 'boat', ['--grid', '4x3', '--flood', '--flood-min', '1500', '--scale', '0.6'], 12),
    ('J2-caiaque-obstaculos-itens.png', 'rio', 'obj', ['--cells', '6x4'], 24),
    ('K1-mtb-ciclista.png', 'mtb', 'rider', ['--grid', '4x3', '--scale', '0.6'], 12),
    ('K2-mtb-terreno-obstaculos-itens.png', 'mtb', 'obj', ['--cells', '6x4'], 24),
    ('K4-mtb-efeitos.png', 'mtb', 'fx', ['--cells', '6x3'], 18),
    ('L2-arco-aljava-flechas.png', 'archery', 'gear', ['--cells', '6x3'], 18),
    ('L3-alvos-arco-e-flecha.png', 'archery', 'target', ['--cells', '6x3'], 18),
    ('M1-basquete-itens-aro-bolas.png', 'hoops2', 'el', ['--cells', '6x3'], 18),
    ('M2-basquete-efeitos-12.png', 'hoops2', 'fx', ['--cells', '6x2'], 12),
    ('N1-robo-poses.png', 'solo', 'bot', ['--grid', '4x2', '--scale', '0.6'], 8),
    ('N2-badges-modos-dificuldade.png', 'solo', 'badge', ['--cells', '4x2'], 8),
    ('O1-instrumentos-ritmo.png', 'capoeira', 'inst', ['--cells', '4x3'], 12),
    ('O2-capoeira-movimentos.png', 'capoeira', 'dancer', ['--grid', '4x3', '--scale', '0.6'], 12),
    ('P1-ginastica-poses.png', 'pose', 'pose', ['--grid', '4x3', '--scale', '0.6'], 12),
    ('P2-botoes-interface.png', 'pose', 'ui', ['--cells', '4x2'], 8),
    ('R1-equipamentos-luta-segura.png', 'lutas', 'eq', ['--cells', '4x2'], 8),
    ('R2-mapa-marcadores-interface.png', 'lutas', 'ui', ['--gap', '3'], 0),
    ('S1-falta-alvos.png', 'penalty2', 'target', ['--cells', '6x3'], 18),
    ('S2-falta-efeitos.png', 'penalty2', 'fx', ['--cells', '6x3'], 18),
]
# cenários e camadas: copiados inteiros (sem fatiar), em WebP
SCENES = [
    ('I3-skate-cenario-isometrico.png', 'skate-iso', 'cenario.webp', 1280),
    ('J3-caiaque-cenario-rio.png', 'rio', 'cenario.webp', 1280),
    ('K3-camada1-ceu.png', 'mtb', 'camada1.webp', 1280),
    ('K3-camada2-montanhas.png', 'mtb', 'camada2.webp', 1536),
    ('K3-camada3-floresta.png', 'mtb', 'camada3.webp', 1536),
    ('K3-camada4-chao.png', 'mtb', 'camada4.webp', 1536),
    ('K3-camada5-arbustos.png', 'mtb', 'camada5.webp', 1536),
    ('L4-cenario-arco-e-flecha.png', 'archery', 'cenario.webp', 1280),
    ('M3-cenario-ginasio-basquete.png', 'hoops2', 'cenario.webp', 1280),
    ('O3-capoeira-cenario-roda.png', 'capoeira', 'cenario.webp', 1280),
    ('P3-ginastica-cenario.png', 'pose', 'cenario.webp', 1280),
    ('Q2-quadra-e-overlays.png', 'queimada', 'quadra.webp', 1280),
    ('R3-mapa-treino-edf.png', 'lutas', 'mapa.webp', 1280),
    ('S3-goleiro-defesa-livre.png', 'penalty2', 'goleiro-defesa.webp', 900),
]

report = []
for sheet, game, prefix, extra, expected in SHEETS:
    out = os.path.join(O, game)
    r = subprocess.run([sys.executable, '-I', tool, os.path.join(P, sheet), '--out', out, '--prefix', prefix, *extra],
                       capture_output=True, text=True, encoding='utf-8', errors='replace', env={**os.environ, 'PYTHONIOENCODING': 'utf-8'})
    n = len(json.load(open(os.path.join(out, prefix + '.json'), encoding='utf-8'))['items']) if r.returncode == 0 else -1
    flag = 'ok' if (n == expected or expected == 0) else 'CONFERIR'
    report.append(f'{game}/{prefix}: {n} peças (esperado {expected}) {flag}')

for src, game, name, width in SCENES:
    out = os.path.join(O, game)
    os.makedirs(out, exist_ok=True)
    im = Image.open(os.path.join(P, src))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(out, name), 'WEBP', quality=84, method=6, exact=True)
    report.append(f'{game}/{name}: cenário {im.size[0]}x{im.size[1]}')

print('\n'.join(report))
