/**
 * Carregador de sprites dos jogos arcade.
 * Cada conjunto vem de assets/visual/arcade/sprites/<jogo>/<nome>.json (gerado por
 * tools/fatiar_prancha.py) e de um WebP por peça, com fundo transparente.
 * Se uma imagem ainda não carregou, drawSprite devolve false e o jogo desenha a forma provisória.
 */
const DIR = 'assets/visual/arcade/sprites';
const sets = new Map();

export function loadSprites(game, names, view = globalThis) {
  const key = `${game}:${names.join(',')}`;
  if (sets.has(key)) return sets.get(key);
  const set = new Map();
  sets.set(key, set);
  for (const name of names) {
    view.fetch?.(`${DIR}/${game}/${name}.json`).then(r => r.ok ? r.json() : null).then(data => {
      for (const item of data?.items ?? []) {
        const img = new (view.Image ?? Image)();
        img.src = `${DIR}/${game}/${item.file}`;
        set.set(item.id, { ...item, img });
      }
    }).catch(() => {});
  }
  return set;
}

/** Desenha o sprite com o ponto de apoio em (x, y). `h` é a altura desejada; a largura segue a proporção. */
export function drawSprite(g, set, id, x, y, { h, w, flip = false, alpha = 1, anchor, center = false } = {}) {
  const s = set.get(id);
  if (!s || !s.img.complete || !s.img.naturalWidth) return false;
  const height = h ?? (w ? w * s.h / s.w : s.h), width = w ?? height * s.w / s.h;
  const ax = center ? 0.5 : (anchor?.x ?? s.anchor.x) / s.w, ay = center ? 0.5 : (anchor?.y ?? s.anchor.y) / s.h;
  g.save();
  if (alpha !== 1) g.globalAlpha *= alpha;
  g.translate(x, y);
  if (flip) g.scale(-1, 1);
  g.drawImage(s.img, -width * ax, -height * ay, width, height);
  g.restore();
  return true;
}

/** Imagem de fundo (cenário) carregada uma única vez. */
export function loadImage(file, view = globalThis) {
  if (sets.has(file)) return sets.get(file);
  const img = new (view.Image ?? Image)();
  img.src = file;
  sets.set(file, img);
  return img;
}

export const spriteFile = (game, file) => `${DIR}/${game}/${file}`;
