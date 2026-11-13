import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Motor de pistas (3 faixas), câmera elevada (isométrica): Corrida Urbana de Skate e Descida do Rio.
 * Deslizar para os lados troca de pista; para cima pula; para baixo agacha. Toque curto vai para a pista tocada.
 * A pista é gerada por linha, com semente própria: os dois lados enfrentam a mesma sequência.
 * A câmera fica acima: os objetos aparecem de longe e já com bom tamanho, então dá para ler a pista a tempo.
 */
const KINDS = {
  skate: {
    dir: 'skate-iso', heroDir: 'skate-back', sceneDir: 'skate', scene: 'cenario.webp', sky: '#9fdcff', lane: '#8d8a9c', hero: '#ff7a2f', heroH: 270,
    proj: { farY: 330, farScale: .3, off: [-335, 0, 335], heroX: 1.34 },
    help: 'Deslize para os lados, pule os baixos e abaixe sob os arcos. Pegue os itens de segurança.',
    hit: 'Cuidado! Equipamento e atenção evitam acidentes.',
    good: { 'Capacete': 'obj-15', 'Joelheira': 'obj-16', 'Luvas': 'obj-18' }, coin: 'obj-13',
    low: ['obj-09', 'obj-21', 'obj-20', 'obj-05'], block: ['obj-24', 'obj-22', 'obj-12', 'obj-11', 'obj-10'], high: ['obj-08'],
    heights: { low: 125, block: 165, high: 235, good: 105, coin: 78 },
  },
  rio: {
    dir: 'rio', heroDir: 'rio-back', sceneDir: 'rio', scene: 'cenario.webp', sky: '#1f6f9c', lane: '#2c8fc1', hero: '#ffb02f', heroH: 250,
    proj: { farY: 215, farScale: .42, off: [-300, 0, 300], heroX: 1.2 },
    help: 'Deslize para os lados, pule os troncos e abaixe sob as pontes. Pegue os itens do rio.',
    hit: 'Rio exige atenção: colete, capacete e cuidado com o ambiente.',
    good: { 'Colete': 'obj-12', 'Capacete': 'obj-24', 'Água': 'obj-06' }, coin: 'obj-12',
    low: ['obj-04', 'obj-10', 'obj-16'], block: ['obj-01', 'obj-07', 'obj-13', 'obj-02', 'obj-08', 'obj-14'], high: ['obj-20', 'obj-22'],
    heights: { low: 100, block: 135, high: 200, good: 85, coin: 68 },
  },
};
const FALLBACK = [{ question: 'O que ajuda a prevenir acidentes?', options: ['Usar proteção adequada', 'Ignorar os avisos', 'Correr sem olhar'], answer: 0, explanation: 'Proteção e atenção reduzem riscos.' }];
const LANES = [250, 500, 750];
const ROW = 300;
const PLAYER_Y = 590;
// Câmera atrás e um pouco acima do personagem (estilo Subway Surfers): o ponto mais distante (SPAWN) já tem uma escala
// mínima e fica na altura farY da tela; os objetos crescem até o jogador.
const VX = 500, SPAWN = -780;

export function setupRunner(ctx, kind = 'skate') {
  const w = 1000, h = 700, K = KINDS[kind] ?? KINDS.skate;
  let canvas, lane = 1, targetX = LANES[1], x = LANES[1], vertical = 0, vtime = 0, lives = 3, hits = 0, distance = 0, speed = 420, clock = 0, nextRow = 0, invuln = 0;
  let objects = [], picked = 0, coinCount = 0, combo = 0, down = null, flash = 0, fallen = false;
  const P = K.proj, LANE_OFFSET = P.off, FAR_Y = P.farY, FAR_SCALE = P.farScale;
  const proj = g => { const t = Math.max(0, (g - SPAWN) / (PLAYER_Y - SPAWN)); const sc = FAR_SCALE + (1 - FAR_SCALE) * Math.min(t, 1.25); return { sc, y: FAR_Y + (PLAYER_Y - FAR_Y) * t }; };
  const art = loadSprites(K.heroDir, [kind === 'rio' ? 'boat' : 'skater'], ctx.view);
  const artObj = loadSprites(K.dir, ['obj'], ctx.view);
  const scene = loadImage(spriteFile(K.sceneDir ?? K.dir, K.scene), ctx.view);

  const rowRng = index => ctx.seededRandom(`${ctx.seed}:runner:${kind}:${index}`);
  const fact = () => { const bank = ctx.theme?.questions?.(ctx.level) ?? FALLBACK; const q = bank[Math.floor(rowRng(picked)() * bank.length)] ?? FALLBACK[0]; ctx.helper.textContent = q.explanation; };
  const goodLabels = Object.keys(K.good);

  function spawnRow(index) {
    const r = rowRng(index);
    // dificuldade gradual: no começo sobram pistas livres; depois a pista fica mais cheia
    const density = Math.min(.9, .3 + ctx.level * .06 + index * .011);
    if (index % 4 === 3) { const l = Math.floor(r() * 3); for (let k = 0; k < 5; k++) objects.push({ type: 'coin', lane: l, y: SPAWN - k * 62, art: K.coin, done: false }); return; }
    const free = Math.floor(r() * 3);
    for (let i = 0; i < 3; i++) {
      if (i === free && r() > 0.35) { const label = goodLabels[Math.floor(r() * goodLabels.length)]; objects.push({ type: 'good', lane: i, y: SPAWN, label, art: K.good[label], done: false }); continue; }
      if (i === free) continue;
      if (r() > density) continue;
      const roll = r();
      const type = roll < 0.36 ? 'low' : roll < 0.62 ? 'high' : 'block';
      const list = K[type]; objects.push({ type, lane: i, y: SPAWN, art: list[Math.floor(r() * list.length)], done: false });
    }
  }
  function hurt(text) {
    if (invuln > 0) return;
    lives = Math.max(0, lives - 1); invuln = 1100; flash = 260;
    ctx.awardWrong(0, canvas); ctx.helper.textContent = text;
    if (!lives) { fallen = true; ctx.finish(); }
  }
  function setLane(i) { lane = Math.max(0, Math.min(2, i)); targetX = LANES[lane]; }

  const game = {
    update(dt) {
      clock += dt; invuln = Math.max(0, invuln - dt); flash = Math.max(0, flash - dt);
      speed = Math.min(820, 400 + ctx.level * 70 + clock / 1000 * 6);
      const step = speed * dt / 1000; distance += step;
      while (distance >= nextRow * ROW) { spawnRow(nextRow); nextRow++; }
      x += (targetX - x) * Math.min(1, dt / 90);
      if (vertical !== 0) { vtime -= dt; if (vtime <= 0) vertical = 0; }
      for (const o of objects) {
        o.y += step;
        if (o.done || o.y < PLAYER_Y - 36 || o.y > PLAYER_Y + 36) continue;
        if (o.lane !== lane) continue;
        o.done = true;
        if (o.type === 'coin') { hits++; combo++; if (++coinCount % 5 === 0) ctx.awardSolved(10, canvas); }
        else if (o.type === 'good') { ctx.awardSolved(5, canvas); hits++; combo++; if (++picked % 3 === 0) fact(); else ctx.helper.textContent = `${o.label}!`; }
        else if (o.type === 'low' && vertical === 1) { /* pulou */ }
        else if (o.type === 'high' && vertical === -1) { /* abaixou */ }
        else { combo = 0; hurt(K.hit); }
      }
      objects = objects.filter(o => o.y < h + 160);
      ctx.progress.textContent = `❤ ${lives} · combo ${combo} · ${hits} pontos de corrida`;
    },
    draw(g) {
      const bg = scene.complete && scene.naturalWidth ? scene : null;
      if (bg) g.drawImage(bg, 0, 0, w, h); else { g.fillStyle = K.sky; g.fillRect(0, 0, w, h); g.fillStyle = K.lane; g.beginPath(); g.moveTo(VX - 150, FAR_Y); g.lineTo(VX + 150, FAR_Y); g.lineTo(w, h); g.lineTo(0, h); g.fill(); }
      // faixas translúcidas das pistas, na mesma projeção dos objetos
      g.fillStyle = 'rgba(255,255,255,.10)';
      for (let l = 0; l < 3; l++) { const a = proj(SPAWN), b = proj(PLAYER_Y + 300); const w1 = 110 * a.sc, w2 = 110 * b.sc; g.beginPath(); g.moveTo(VX + LANE_OFFSET[l] * a.sc - w1, a.y); g.lineTo(VX + LANE_OFFSET[l] * a.sc + w1, a.y); g.lineTo(VX + LANE_OFFSET[l] * b.sc + w2, b.y); g.lineTo(VX + LANE_OFFSET[l] * b.sc - w2, b.y); g.fill(); }
      for (let i = 0; i < 16; i++) {
        const t0 = ((i + (distance / 170) % 1) / 16), a = SPAWN + t0 * t0 * (PLAYER_Y + 340 - SPAWN), pa = proj(a), pb = proj(a + 26 + 30 * t0), wd = 520 * pa.sc * 1.05;
        g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(VX - wd * (1 + .0), pa.y); g.lineTo(VX + wd, pa.y); g.lineTo(VX + wd * 1.12, pb.y); g.lineTo(VX - wd * 1.12, pb.y); g.fill();
      }
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const gy = SPAWN + ((i + (distance / 130) % 1) / 12) * (PLAYER_Y + 330 - SPAWN), gy2 = gy + 55, p1 = proj(gy), p2 = proj(gy2);
        for (const lx of [-150, 150]) { g.lineWidth = 1.5 + 3 * p1.sc; g.beginPath(); g.moveTo(VX + lx * p1.sc, p1.y); g.lineTo(VX + lx * p2.sc, p2.y); g.stroke(); }
      }
      g.textAlign = 'center'; g.font = 'bold 22px Fredoka,sans-serif';
      for (const o of objects) {
        const p = proj(o.y); if (o.y < SPAWN - 1) continue;
        const cx = VX + LANE_OFFSET[o.lane] * p.sc, cy = p.y, hh = K.heights[o.type] * p.sc * 1.25;
        g.globalAlpha = o.done ? .25 : 1;
        // sombra sob o objeto: ajuda a ler em que pista ele está
        g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(cx, cy + 4, 60 * p.sc, 12 * p.sc, 0, 0, 7); g.fill();
        if (!drawSprite(g, artObj, o.art, cx, cy, { h: hh })) {
          const r = Math.max(6, 40 * p.sc); g.fillStyle = o.type === 'coin' ? '#ffd23b' : o.type === 'good' ? '#45bcef' : '#8a5a3c';
          g.beginPath(); g.arc(cx, cy - r, r, 0, 7); g.fill();
        }
        g.globalAlpha = 1;
      }
      const hx = VX + (x - VX) * P.heroX, hy = PLAYER_Y + 36, lift = vertical === 1 ? 80 : 0, blink = invuln > 0 && Math.floor(clock / 90) % 2;
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(hx, hy, 62, 14, 0, 0, 7); g.fill();
      g.globalAlpha = blink ? .5 : 1;
      const pre = kind === 'rio' ? 'boat' : 'skater', rot = 0, squash = 1;
      let frame = `${pre}-${String(1 + Math.floor(clock / (kind === 'rio' ? 150 : 130)) % 4).padStart(2, '0')}`;
      if (fallen) frame = kind === 'rio' ? `${pre}-10` : `${pre}-11`; else if (invuln > 700) frame = `${pre}-10`; else if (vertical === 1) frame = `${pre}-08`;
      else if (vertical === -1) frame = `${pre}-07`; else if (Math.abs(targetX - x) > 30) frame = targetX < x ? `${pre}-05` : `${pre}-06`;
      g.save(); g.translate(hx, hy - lift); g.scale(1, squash);
      if (!drawSprite(g, art, frame, 0, 0, { h: K.heroH, rot })) { g.fillStyle = K.hero; g.fillRect(-28, -130, 56, 100); g.fillStyle = '#ffe0bd'; g.beginPath(); g.arc(0, -150, 24, 0, 7); g.fill(); }
      g.restore(); g.globalAlpha = 1;
      if (flash > 0) { g.fillStyle = `rgba(233,84,102,${flash / 600})`; g.fillRect(0, 0, w, h); }
    },
    onPointer(e) {
      if (e.type === 'down') { down = e; return; }
      if (e.type === 'cancel') { down = null; return; }
      if (e.type !== 'up' || !down) return;
      const dx = e.x - down.x, dy = e.y - down.y; down = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) { setLane(e.x < 375 ? 0 : e.x < 625 ? 1 : 2); return; }
      if (Math.abs(dx) > Math.abs(dy)) setLane(lane + (dx > 0 ? 1 : -1));
      else if (dy < 0) { vertical = 1; vtime = 650; } else { vertical = -1; vtime = 650; }
    },
  };
  const arena = createArena(ctx, game, { w, h }); canvas = arena.canvas; canvas.classList.add('runner-arena');
  ctx.nextChallenge(); ctx.prompt.textContent = kind === 'rio' ? 'Desça o rio com segurança' : 'Corra pelo parque com segurança'; ctx.helper.textContent = K.help;
}
