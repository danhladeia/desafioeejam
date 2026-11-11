import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tool = os.path.join(root, 'tools', 'fatiar_prancha.py')
tmp = tempfile.mkdtemp()


def run(*a):
    r = subprocess.run([sys.executable, '-I', tool, *a], capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


# 1) sintética com transparência real e halo claro: 4x2 = 8 peças
im = Image.new('RGBA', (800, 400), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
for r in range(2):
    for c in range(4):
        cx, cy = 100 + c * 200, 100 + r * 200
        d.ellipse((cx - 50, cy - 50 + c * 6, cx + 50, cy + 50 + c * 6), fill=(220, 60, 60, 255), outline=(255, 255, 255, 120), width=4)
syn = os.path.join(tmp, 'syn.png'); im.save(syn)
code, out = run(syn, '--out', os.path.join(tmp, 'c'), '--prefix', 's')
print('componentes:', code, out)
data = json.load(open(os.path.join(tmp, 'c', 's.json')))
assert code == 0 and len(data['items']) == 8, data
print('  ordem ok, primeira peça', data['items'][0])

# 2) grade: tamanhos iguais e mesmo apoio
code, out = run(syn, '--out', os.path.join(tmp, 'g'), '--prefix', 'q', '--grid', '4x2')
g = json.load(open(os.path.join(tmp, 'g', 'q.json')))['items']
print('grade:', code, out)
assert code == 0 and len({(i['w'], i['h']) for i in g}) == 1, g

# 3) fundo opaco deve ser recusado
opaque = Image.new('RGBA', (400, 300), (255, 255, 255, 255)); ImageDraw.Draw(opaque).ellipse((100, 80, 300, 220), fill=(0, 90, 200, 255))
op = os.path.join(tmp, 'op.png'); opaque.save(op)
code, out = run(op, '--out', os.path.join(tmp, 'o'))
print('opaco:', code, out[:70])
assert code != 0

# 4) fundo verde #00FF00 com --chroma
gr = Image.new('RGBA', (600, 300), (0, 255, 0, 255)); dd = ImageDraw.Draw(gr)
dd.ellipse((60, 60, 200, 200), fill=(230, 40, 40, 255)); dd.rectangle((380, 80, 520, 220), fill=(40, 90, 230, 255))
gp = os.path.join(tmp, 'gr.png'); gr.save(gp)
code, out = run(gp, '--out', os.path.join(tmp, 'k'), '--prefix', 'k', '--chroma')
print('chroma:', code, out)
assert code == 0 and len(json.load(open(os.path.join(tmp, 'k', 'k.json')))['items']) == 2
# canto da peça saída deve ser transparente
p = Image.open(os.path.join(tmp, 'k', 'k-01.webp')).convert('RGBA')
assert p.getpixel((0, 0))[3] == 0, p.getpixel((0, 0))
print('TUDO OK')
