#!/usr/bin/env python3
"""Lista arquivos de assets/ que nenhum código referencia (por nome de arquivo ou pasta de sprites).
Uso: python tools/auditar_assets.py   (só lista; não apaga nada)"""
import os, re, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
tracked = subprocess.run(['git', 'ls-files', 'assets'], capture_output=True, text=True, encoding='utf-8').stdout.split('\n')
code = ''
for base, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'assets', 'tests', 'docs', 'art-check-results', 'test-results', 'Fotos do Evento', 'Conteudos EDF')]
    for f in files:
        if f.endswith(('.js', '.css', '.html', '.webmanifest', '.svg')):
            code += open(os.path.join(base, f), encoding='utf-8', errors='replace').read() + '\n'
# manifests de sprites também referenciam arquivos
for base, dirs, files in os.walk('assets'):
    for f in files:
        if f.endswith('.json'):
            code += open(os.path.join(base, f), encoding='utf-8', errors='replace').read() + '\n'
unused, total = [], 0
for p in tracked:
    if not p or p.endswith('.json'): continue
    name = os.path.basename(p)
    stem = os.path.splitext(name)[0]
    # sprites: referenciados pela pasta + prefixo (ex.: 'skate-alto' + 'skater-03')
    ref = name in code or stem in code or (re.match(r'^(.*?)[-_]?\d+$', stem) and re.match(r'^(.*?)[-_]?\d+$', stem).group(1) and ("'" + re.match(r'^(.*?)[-_]?\d+$', stem).group(1) + "'") in code)
    size = os.path.getsize(p) if os.path.exists(p) else 0
    total += size
    if not ref: unused.append((size, p))
unused.sort(reverse=True)
print(f'{len(unused)} sem referência óbvia, {sum(s for s,_ in unused)/1e6:.1f} MB de {total/1e6:.1f} MB versionados')
for s, p in unused[:80]: print(f'{s/1e6:6.2f} MB  {p}')
