// Quebra-cabeça de verdade: peças com encaixe, espalhadas, que se arrastam até o quadro.
// A figura e o recorte são iguais para os dois lados; só a posição inicial das peças muda.

const NS = 'http://www.w3.org/2000/svg';
export const AREA = { w: 1000, h: 700 }; // área de trabalho, em unidades lógicas
export const BOARD = { x: 26, y: 26, w: 540 }; // quadro onde a figura é montada
export const PICTURES = [
  { src: 'assets/visual/puzzle/futuro-campus-v1.png', w: 1448, h: 1086 },
  { src: 'assets/visual/puzzle/futuro-tech-v1.png', w: 1448, h: 1086 },
];
export const GRID = { 1: [3, 2], 2: [4, 2], 3: [4, 3] }; // colunas, linhas por nível

// Contorno do encaixe em (u, v): u ao longo da aresta e v para fora, em fração do comprimento da aresta.
const KNOB = [
  [[0.42, 0.0], [0.44, 0.05], [0.42, 0.10]],
  [[0.40, 0.15], [0.33, 0.17], [0.33, 0.24]],
  [[0.33, 0.31], [0.42, 0.34], [0.50, 0.34]],
  [[0.58, 0.34], [0.67, 0.31], [0.67, 0.24]],
  [[0.67, 0.17], [0.60, 0.15], [0.58, 0.10]],
  [[0.56, 0.05], [0.58, 0.0], [0.64, 0.0]],
];
const NECK = 0.36;
const DEPTH = 0.74;
// Keep viewBox, image and target coordinates on the same scale (including fractions).
const f = (n) => Math.round(n * 1e6) / 1e6;
let serial = 0;

export function geometry(cols, rows, picture) {
  if (![cols, rows].every(n => Number.isInteger(n) && n > 0) ||
      ![picture?.w, picture?.h].every(n => Number.isFinite(n) && n > 0)) {
    throw new RangeError('O quadro precisa de linhas, colunas e dimensões de imagem positivas.');
  }
  const bh = BOARD.w * (picture.h / picture.w);
  const cw = BOARD.w / cols;
  const ch = bh / rows;
  const pad = 0.27 * Math.max(cw, ch);
  return { cols, rows, cw, ch, pad, bw: BOARD.w, bh, pw: cw + 2 * pad, ph: ch + 2 * pad };
}

/** Sentido (+1 ou -1) e deslocamento de cada encaixe, iguais para quem usa a mesma semente. */
export function buildEdges(cols, rows, rng) {
  const edge = () => ({ sign: rng() < 0.5 ? -1 : 1, shift: (rng() - 0.5) * 0.08 });
  return {
    h: Array.from({ length: Math.max(0, rows - 1) }, () => Array.from({ length: cols }, edge)),
    v: Array.from({ length: rows }, () => Array.from({ length: Math.max(0, cols - 1) }, edge)),
  };
}

export function edgePath(x0, y0, x1, y1, sign, shift = 0) {
  if (!sign) return `L${f(x1)} ${f(y1)}`;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = uy * sign;
  const ny = -ux * sign;
  const at = (u, v) => `${f(x0 + ux * (u + shift) * len + nx * v * DEPTH * len)} ${f(y0 + uy * (u + shift) * len + ny * v * DEPTH * len)}`;
  let d = `L${at(NECK, 0)}`;
  for (const [a, b, c] of KNOB) d += ` C${at(...a)} ${at(...b)} ${at(...c)}`;
  return `${d} L${f(x1)} ${f(y1)}`;
}

/** Sentido e deslocamento de cada lado da peça, percorrendo o contorno no sentido horário. */
export function pieceEdges(r, c, geo, edges) {
  const flat = { sign: 0, shift: 0 };
  return {
    top: r > 0 ? { sign: -edges.h[r - 1][c].sign, shift: edges.h[r - 1][c].shift } : flat,
    right: c < geo.cols - 1 ? { sign: edges.v[r][c].sign, shift: edges.v[r][c].shift } : flat,
    bottom: r < geo.rows - 1 ? { sign: edges.h[r][c].sign, shift: -edges.h[r][c].shift } : flat,
    left: c > 0 ? { sign: -edges.v[r][c - 1].sign, shift: -edges.v[r][c - 1].shift } : flat,
  };
}

/** Contorno da peça (linha r, coluna c) nas coordenadas do quadro. Peças vizinhas se encaixam sem folga. */
export function piecePath(r, c, geo, edges) {
  const x0 = c * geo.cw;
  const y0 = r * geo.ch;
  const x1 = x0 + geo.cw;
  const y1 = y0 + geo.ch;
  const { top, right, bottom, left } = pieceEdges(r, c, geo, edges);
  return `M${f(x0)} ${f(y0)}${edgePath(x0, y0, x1, y0, top.sign, top.shift)}${edgePath(x1, y0, x1, y1, right.sign, right.shift)}${edgePath(x1, y1, x0, y1, bottom.sign, bottom.shift)}${edgePath(x0, y1, x0, y0, left.sign, left.shift)}Z`;
}

/** Posições iniciais espalhadas fora do quadro, afastadas entre si. */
export function scatter(count, geo, rng) {
  const spots = [];
  const right = { x: BOARD.x + geo.bw + 24, y: 0, w: AREA.w - (BOARD.x + geo.bw + 24) - geo.pw, h: AREA.h - geo.ph };
  // Keep the lower tray left of the right tray, so their pieces cannot bury
  // one another. A jittered lattice leaves an exposed grip on every piece;
  // random max-distance sampling could still completely hide a lower piece.
  const below = { x: 0, y: BOARD.y + geo.bh + 18,
    w: Math.min(AREA.w - geo.pw, right.x - geo.pw - 18),
    h: AREA.h - (BOARD.y + geo.bh + 18) - geo.ph };
  const useBelow = below.h > 8 && below.w > 0;
  const rightCount = useBelow ? Math.ceil(count * .65) : count;
  function tray(region, n, columns) {
    const rows = Math.ceil(n / columns);
    for (let i = 0; i < n; i++) {
      const col = i % columns, row = Math.floor(i / columns);
      const u = columns === 1 ? .5 : col / (columns - 1);
      const v = rows === 1 ? .5 : row / (rows - 1);
      const jitter = (t, value) => .02 * value + .98 * t;
      spots.push({ x: region.x + jitter(u, rng()) * region.w,
        y: region.y + jitter(v, rng()) * region.h });
    }
  }
  tray(right, rightCount, Math.min(2, rightCount));
  if (useBelow) tray(below, count - rightCount, count - rightCount);
  return spots;
}

export function setupJigsaw(ctx) {
  const { node, doc, root, stage, prompt, progress, helper, level, challengeRng, layoutRng, active, score, finish, listen } = ctx;
  const [cols, rows] = GRID[level] ?? GRID[2];
  const pictures = ctx.theme ? ctx.theme.pictures : PICTURES;
  const picture = pictures[Math.floor(challengeRng() * pictures.length)];
  const geo = geometry(cols, rows, picture);
  const edges = buildEdges(cols, rows, challengeRng);
  const total = cols * rows;
  const uid = `jig${++serial}`;
  const tolerance = 0.45 * Math.min(geo.cw, geo.ch);

  prompt.textContent = `Quebra-cabeça · ${total} peças`;
  helper.textContent = 'Arraste cada peça até o quadro. Ela encaixa sozinha no lugar certo.';

  const area = node('div', 'jigsaw-area');
  area.style.aspectRatio = `${AREA.w} / ${AREA.h}`;
  const ghost = node('div', 'jigsaw-ghost');
  Object.assign(ghost.style, { left: `${BOARD.x / AREA.w * 100}%`, top: `${BOARD.y / AREA.h * 100}%`, width: `${geo.bw / AREA.w * 100}%`, height: `${geo.bh / AREA.h * 100}%` });
  const ghostImage = doc.createElement('img');
  ghostImage.src = picture.src;
  ghostImage.alt = '';
  ghostImage.draggable = false;
  ghostImage.style.opacity = level === 3 ? '0.12' : '0.24';
  ghost.append(ghostImage);
  if(picture.background)ghost.style.background=picture.background;
  area.append(ghost);

  const spots = scatter(total, geo, layoutRng);
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(layoutRng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }

  const pieces = [];
  let z = 10;
  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const path = piecePath(r, c, geo, edges);
    const clip = `${uid}-clip-${i}`;
    const svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `${f(c * geo.cw - geo.pad)} ${f(r * geo.ch - geo.pad)} ${f(geo.pw)} ${f(geo.ph)}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'jigsaw-piece');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Peça ${i + 1} de ${total}`);
    svg.dataset.i = String(i);
    svg.innerHTML = `<defs><clipPath id="${clip}"><path d="${path}"/></clipPath></defs>`
      + (picture.background?`<rect x="0" y="0" width="${f(geo.bw)}" height="${f(geo.bh)}" fill="${picture.background}" clip-path="url(#${clip})" pointer-events="none"/>`:'')
      + `<image href="${picture.src}" x="0" y="0" width="${f(geo.bw)}" height="${f(geo.bh)}" preserveAspectRatio="none" clip-path="url(#${clip})" pointer-events="none"/>`
      + `<path class="jigsaw-outline" d="${path}" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.4" stroke-linejoin="round" pointer-events="none"/>`
      + `<path class="jigsaw-hit" d="${path}" fill="transparent" stroke="none" pointer-events="fill"/>`;
    svg.style.pointerEvents = 'none';
    svg.style.width = `${geo.pw / AREA.w * 100}%`;
    svg.style.height = `${geo.ph / AREA.h * 100}%`;
    svg.style.aspectRatio = `${f(geo.pw)} / ${f(geo.ph)}`;
    const spot = spots[order[i]];
    const piece = { i, r, c, el: svg, x: spot.x, y: spot.y, tx: BOARD.x + c * geo.cw - geo.pad, ty: BOARD.y + r * geo.ch - geo.pad, placed: false };
    svg.dataset.tx = String(f(piece.tx));
    svg.dataset.ty = String(f(piece.ty));
    place(piece, piece.x, piece.y);
    svg.style.zIndex = String(++z % 90 + 10);
    pieces.push(piece);
    area.append(svg);
  }
  stage.append(area);

  function place(piece, x, y) {
    // Flat outside edges have transparent SVG padding. Constrain the visible
    // piece, not that padding: top/left target origins can legitimately be < 0.
    const minX = piece.c === 0 ? -geo.pad : 0;
    const minY = piece.r === 0 ? -geo.pad : 0;
    const maxX = AREA.w - geo.pw + (piece.c === cols - 1 ? geo.pad : 0);
    const maxY = AREA.h - geo.ph + (piece.r === rows - 1 ? geo.pad : 0);
    piece.x = Math.min(Math.max(x, minX), maxX);
    piece.y = Math.min(Math.max(y, minY), maxY);
    piece.el.style.left = `${piece.x / AREA.w * 100}%`;
    piece.el.style.top = `${piece.y / AREA.h * 100}%`;
  }
  const updateProgress = () => { progress.textContent = `${pieces.filter((p) => p.placed).length} / ${total} peças no lugar`; };
  updateProgress();

  const drags = new Map();
  const toArea = (event) => {
    const rect = area.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * AREA.w / (rect.width || AREA.w),
      y: (event.clientY - rect.top) * AREA.h / (rect.height || AREA.h) };
  };
  const inside = event => {
    const rect = area.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
  };

  listen('pointerdown', (event) => {
    if (!active() || (event.button !== undefined && event.button !== 0)) return;
    const el = event.target?.closest?.('.jigsaw-piece');
    if (!el || !area.contains(el) || drags.has(event.pointerId)) return;
    const piece = pieces[Number(el.dataset.i)];
    if (!piece || piece.el !== el || piece.placed || [...drags.values()].some((d) => d.piece === piece)) return;
    event.preventDefault();
    const at = toArea(event);
    // Retain the exact grab offset: the piece never jumps under a finger.
    drags.set(event.pointerId, { piece, dx: at.x - piece.x, dy: at.y - piece.y, x0: piece.x, y0: piece.y });
    piece.el.style.zIndex = '95';
    piece.el.classList.add('lifted');
    try { el.setPointerCapture?.(event.pointerId); } catch { /* Eventos sintéticos não têm ponteiro ativo. */ }
  });
  function move(event) {
    const d = drags.get(event.pointerId);
    if (!d) return;
    if (!active()) { drop(event, true); return; }
    event.preventDefault();
    const at = toArea(event);
    place(d.piece, at.x - d.dx, at.y - d.dy);
  }
  listen('pointermove', move);

  function drop(event, cancelled) {
    const d = drags.get(event.pointerId);
    if (!d) return;
    drags.delete(event.pointerId);
    const { piece } = d;
    piece.el.classList.remove('lifted');
    piece.el.style.zIndex = String(10 + piece.i);
    try { piece.el.releasePointerCapture?.(event.pointerId); } catch { /* Já liberado. */ }
    if (cancelled || !active()) { place(piece, d.x0, d.y0); return; }
    // Use the release coordinates too: a quick fling may have no final move.
    if (!inside(event)) { place(piece, d.x0, d.y0); return; }
    const at = toArea(event);
    place(piece, at.x - d.dx, at.y - d.dy);
    if (Math.hypot(piece.x - piece.tx, piece.y - piece.ty) > tolerance) return;
    piece.placed = true;
    place(piece, piece.tx, piece.ty);
    piece.el.classList.add('placed');
    piece.el.querySelector('.jigsaw-hit').setAttribute('pointer-events', 'none');
    piece.el.style.zIndex = '2';
    piece.el.dataset.placed = 'true';
    updateProgress();
    score(10, true, piece.el);
    if (!active()) return;
    if (pieces.every((p) => p.placed)) {
      area.dataset.complete = 'true';
      ghostImage.style.opacity = '1';
      // Every fitted piece already awarded one objective. Finishing must not
      // emit an extra score event that the host could count as another answer.
      finish();
    }
    else helper.textContent = 'Encaixou! Continue montando a figura.';
  }
  listen('pointerup', (event) => drop(event, false));
  listen('pointercancel', (event) => drop(event, true));
  listen('lostpointercapture', (event) => drop(event, true));
  const cancel = () => {
    for (const pointerId of [...drags.keys()]) drop({ pointerId }, true);
  };
  ctx.setCancel(cancel);

  // Capture normally routes to root. Window fallback also handles release
  // outside the arena when capture is unavailable (e.g. interrupted touches).
  const view = doc.defaultView;
  const fallbacks = ['pointermove', 'pointerup', 'pointercancel'].map(type => {
    const handler = event => {
      if (root.contains(event.target)) return;
      if (type === 'pointermove') move(event);
      else drop(event, type === 'pointercancel');
    };
    view?.addEventListener(type, handler, { passive: false });
    return [type, handler];
  });
  view?.addEventListener('blur', cancel);

  // Fit both dimensions explicitly. Flex sizing otherwise stretches the arena
  // at tablet sizes or when the host switches between solo and duel layouts.
  function fit() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const w = Math.min(width, height * AREA.w / AREA.h);
    if (Math.abs(area.getBoundingClientRect().width - w) > .5) cancel();
    Object.assign(area.style, { flex: 'none', margin: '0', width: `${w}px`, height: `${w * AREA.h / AREA.w}px` });
  }
  const observer = view?.ResizeObserver ? new view.ResizeObserver(fit) : null;
  observer?.observe(stage);
  fit();
  ctx.onDestroy?.(() => {
    cancel(); observer?.disconnect();
    view?.removeEventListener('blur', cancel);
    for (const [type, handler] of fallbacks) view?.removeEventListener(type, handler);
  });
}
