#!/usr/bin/env python3
"""Fatia uma prancha de sprites em peças individuais com fundo transparente.

Uso (Python 3 + Pillow + numpy + scipy, sem rede):

  # prancha PNG já com transparência real (canal alfa), peças soltas:
  python tools/fatiar_prancha.py prancha.png --out assets/visual/arcade/skate --prefix obst

  # prancha com fundo verde #00FF00 (plano B): remove o verde e fatia
  python tools/fatiar_prancha.py prancha.png --out saida --prefix item --chroma

  # quadros de animação em grade (4 colunas x 3 linhas), mesmo ponto de apoio em todos:
  python tools/fatiar_prancha.py skatista.png --out saida --prefix skate --grid 4x3 --anchor bottom

Saída: peças em WebP com alfa (<prefix>-01.webp ...) e <prefix>.json:
  {"sheet":..., "mode":"components|grid", "items":[{"id","file","w","h","anchor":{"x","y"}}]}
As peças saem em ordem de leitura (linhas de cima para baixo, esquerda para direita).
Se a prancha tiver fundo opaco (sem transparência real), o script recusa e explica.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def key_strong(a):
    """Remove qualquer pixel dominado por verde (fundo e sombras verdes no chão).
    Use em pranchas de personagens, onde não há objetos verdes."""
    r, g, b = (a[..., i].astype(float) for i in range(3))
    dom = g - np.maximum(r, b)
    alpha = np.clip(1 - (dom - 22) / 40, 0, 1)
    out = a.copy()
    out[..., 3] = (alpha * a[..., 3]).astype(np.uint8)
    edge = (alpha > 0) & (alpha < 1)
    out[..., 1] = np.where(edge, np.minimum(g, np.maximum(r, b)), g).astype(np.uint8)
    return out


def key_green(a, tol=70, soft=60):
    """Remove o fundo verde medindo a cor real nas bordas da imagem.

    O gerador nem sempre entrega #00FF00 exato; por isso a cor do fundo é a mediana das
    bordas e só o que está perto dela some. Verdes escuros ou claros das peças (folhas,
    melancia) ficam, porque estão longe do verde vivo do fundo.
    """
    border = np.concatenate([a[0, :, :3], a[-1, :, :3], a[:, 0, :3], a[:, -1, :3]]).astype(float)
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a[..., :3].astype(float) - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - tol) / soft, 0, 1)    # 0 no fundo, 1 nas peças, borda suave no meio
    out = a.copy()
    out[..., 3] = (alpha * a[..., 3]).astype(np.uint8)
    # tira o verde que escorre só nas bordas semitransparentes
    r, g, b = (out[..., i].astype(float) for i in range(3))
    edge = (alpha > 0) & (alpha < 1)
    out[..., 1] = np.where(edge, np.minimum(g, np.maximum(r, b)), g).astype(np.uint8)
    return out


def defringe(a, solid=250):
    """Em pixels semitransparentes, copia a cor do pixel opaco mais próximo (tira halo claro)."""
    opaque = a[..., 3] >= solid
    if not opaque.any() or opaque.all():
        return a
    idx = ndi.distance_transform_edt(~opaque, return_distances=False, return_indices=True)
    out = a.copy()
    edge = ~opaque
    out[..., :3][edge] = a[..., :3][idx[0][edge], idx[1][edge]]
    return out


def trim(a, pad):
    ys, xs = np.where(a[..., 3] > 20)
    if len(xs) == 0:
        return None
    x0 = max(xs.min() - pad, 0)
    x1 = min(xs.max() + 1 + pad, a.shape[1])
    y0 = max(ys.min() - pad, 0)
    y1 = min(ys.max() + 1 + pad, a.shape[0])
    return a[y0:y1, x0:x1], (x0, y0, x1, y1)


def anchor_of(h, w, mode):
    if mode == 'center':
        return {'x': round(w / 2, 1), 'y': round(h / 2, 1)}
    return {'x': round(w / 2, 1), 'y': float(h)}   # bottom: centro da base


def save(a, path, quality, scale):
    im = Image.fromarray(a, 'RGBA')
    if scale != 1:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    im.save(path, 'WEBP', quality=quality, method=6, exact=True)
    return im.size


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('sheet')
    ap.add_argument('--out', required=True)
    ap.add_argument('--prefix', default='peca')
    ap.add_argument('--grid', help='COLUNASxLINHAS: fatia em células iguais (quadros de animação)')
    ap.add_argument('--chroma', action='store_true', help='remove fundo verde #00FF00 (plano B)')
    ap.add_argument('--strong', action='store_true', help='como --chroma, mas remove também sombras verdes (personagens)')
    ap.add_argument('--anchor', choices=['bottom', 'center'], default='bottom')
    ap.add_argument('--min-area', type=int, default=1500, help='ignora manchas menores (px² originais)')
    ap.add_argument('--gap', type=int, default=4, help='dilatação para unir partes da mesma peça')
    ap.add_argument('--pad', type=int, default=2)
    ap.add_argument('--scale', type=float, default=0.5)
    ap.add_argument('--quality', type=int, default=90)
    args = ap.parse_args()

    a = np.array(Image.open(args.sheet).convert('RGBA'))
    if args.strong:
        a = key_strong(a)
    elif args.chroma:
        a = key_green(a)
    elif (a[..., 3] < 250).mean() < 0.02:
        sys.exit('ERRO: a prancha não tem transparência (fundo opaco). Peça PNG com fundo transparente '
                 'ao gerador, ou use --chroma se o fundo for verde #00FF00.')
    a = defringe(a)
    os.makedirs(args.out, exist_ok=True)
    items = []

    if args.grid:
        cols, rows = (int(v) for v in args.grid.lower().split('x'))
        ch, cw = a.shape[0] // rows, a.shape[1] // cols
        cells = [a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] for r in range(rows) for c in range(cols)]
        boxes = [trim(c, 0) for c in cells]
        valid = [b for b in boxes if b]
        if not valid:
            sys.exit('ERRO: nenhuma peça encontrada.')
        # caixa comum a todos os quadros: mantém o mesmo ponto de apoio
        x0 = min(b[1][0] for b in valid)
        y0 = min(b[1][1] for b in valid)
        x1 = max(b[1][2] for b in valid)
        y1 = max(b[1][3] for b in valid)
        for i, (cell, b) in enumerate(zip(cells, boxes), 1):
            if not b:
                continue
            fn = f'{args.prefix}-{i:02d}.webp'
            w, h = save(cell[y0:y1, x0:x1], os.path.join(args.out, fn), args.quality, args.scale)
            items.append({'id': f'{args.prefix}-{i:02d}', 'file': fn, 'w': w, 'h': h,
                          'anchor': anchor_of(h, w, args.anchor), 'frame': i - 1})
        mode = 'grid'
    else:
        mask = a[..., 3] > 20
        lab, _ = ndi.label(ndi.binary_dilation(mask, iterations=args.gap))
        found = []
        for i, sl in enumerate(ndi.find_objects(lab), 1):
            own = lab[sl] == i
            if (mask[sl] & own).sum() < args.min_area:
                continue
            piece = a[sl].copy()
            piece[~own] = 0
            t = trim(piece, args.pad)
            if t:
                found.append((sl[0].start, sl[1].start, t[0]))
        if not found:
            sys.exit('ERRO: nenhuma peça encontrada.')
        band = max(1, int(np.median([f[2].shape[0] for f in found]) * 0.6))   # agrupa por linha
        found.sort(key=lambda f: (f[0] // band, f[1]))
        for i, (_, _, piece) in enumerate(found, 1):
            fn = f'{args.prefix}-{i:02d}.webp'
            w, h = save(piece, os.path.join(args.out, fn), args.quality, args.scale)
            items.append({'id': f'{args.prefix}-{i:02d}', 'file': fn, 'w': w, 'h': h,
                          'anchor': anchor_of(h, w, args.anchor)})
        mode = 'components'

    with open(os.path.join(args.out, f'{args.prefix}.json'), 'w', encoding='utf-8') as f:
        json.dump({'sheet': os.path.basename(args.sheet), 'mode': mode, 'scale': args.scale, 'items': items},
                  f, ensure_ascii=False, indent=1)
    print(f'{len(items)} peças ({mode}) -> {args.out}')


if __name__ == '__main__':
    main()
