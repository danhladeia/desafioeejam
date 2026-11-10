"""Extrai as 12 ilustracoes do glossario (pagina 25) de um caderno DED Express.

Uso (na raiz do projeto):
  python -W ignore -I scripts/extrair-glossario.py <pdf> <pasta_saida> <titulo_do_caderno> <nome1,...,nome12>

As ilustracoes saem na ordem em que aparecem na pagina (linha a linha, da esquerda para a direita),
e os nomes devem seguir essa mesma ordem. A transparencia original (mascara suave do PDF) e
preservada; nada e redesenhado. Alem dos PNG, grava proveniencia.json na pasta de saida.
"""
import hashlib
import io
import json
import os
import sys

import pymupdf
from PIL import Image

PAGE_INDEX = 24   # pagina fisica 25
MIN_SIDE = 300    # ignora icones pequenos (seta, logo)


def main(pdf_path, out_dir, title, names):
    doc = pymupdf.open(pdf_path)
    page = doc[PAGE_INDEX]
    infos = [i for i in page.get_image_info(xrefs=True) if i['width'] >= MIN_SIDE and i['width'] != i['height']]
    infos.sort(key=lambda i: (round(i['bbox'][1] / 40), i['bbox'][0]))
    if len(infos) != len(names):
        raise SystemExit(f'Esperava {len(names)} ilustracoes, encontrei {len(infos)}')
    os.makedirs(out_dir, exist_ok=True)
    images = []
    for name, info in zip(names, infos):
        data = doc.extract_image(info['xref'])
        base = Image.open(io.BytesIO(data['image'])).convert('RGBA')
        if data.get('smask'):
            mask = doc.extract_image(data['smask'])
            alpha = Image.open(io.BytesIO(mask['image'])).convert('L').resize(base.size)
            base.putalpha(alpha)
        target = os.path.join(out_dir, f'{name}.png')
        base.save(target, 'PNG')
        with open(target, 'rb') as handle:
            digest = hashlib.sha256(handle.read()).hexdigest()
        images.append({
            'file': f'{name}.png', 'page': 25, 'resource': f"xref {info['xref']}",
            'width': base.size[0], 'height': base.size[1], 'sha256': digest,
            'process': 'Original raster and transparency extracted from the user-provided PDF; no redraw or image edits.',
        })
    with open(os.path.join(out_dir, 'proveniencia.json'), 'w', encoding='utf-8') as handle:
        json.dump({'source': f'{title}, 3º trimestre de 2026', 'images': images}, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    print(f'{len(images)} ilustracoes gravadas em {out_dir}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(','))
