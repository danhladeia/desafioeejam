import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Motor de pistas (3 faixas): Corrida Urbana de Skate e Descida do Rio.
 * Deslizar para os lados troca de pista; para cima pula; para baixo agacha.
 * Toque curto vai para a pista tocada. A pista é gerada por linha, com
 * semente própria: os dois lados enfrentam a mesma sequência mesmo com FPS diferente.
 */
const KINDS = {
  skate: {
    bg: '#33557f', lane: '#5b6f86', edge: '#ffd23b', hero: '#ff7a2f',
    low: 'Obstáculo baixo', high: 'Barreira alta', block: 'Obstáculo', good: ['Capacete', 'Água', 'Joelheira'],
    lowColor: '#d9a441', highColor: '#e95466', blockColor: '#8a5a3c', goodColor: '#45bcef',
    help: 'Deslize para os lados, pule os baixos e abaixe sob os altos. Pegue os itens de segurança.',
    hit: 'Cuidado! Equipamento e atenção evitam acidentes.',
  },
  rio: {
    bg: '#1f6f9c', lane: '#2c8fc1', edge: '#bfefff', hero: '#ffb02f',
    low: 'Tronco', high: 'Galho baixo', block: 'Pedra', good: ['Colete', 'Capacete', 'Água'],
    lowColor: '#8a5a3c', highColor: '#4b7a43', blockColor: '#6f7b85', goodColor: '#ffd23b',
    help: 'Deslize para os lados, pule os troncos e abaixe sob os galhos. Pegue os itens de segurança.',
    hit: 'Rio exige atenção: colete, capacete e cuidado com o ambiente.',
  },
};
const FALLBACK = [{ question: 'O que ajuda a prevenir acidentes?', options: ['Usar proteção adequada', 'Ignorar os avisos', 'Correr sem olhar'], answer: 0, explanation: 'Proteção e atenção reduzem riscos.' }];
const LANES = [250, 500, 750];
const ROW = 300; // distância entre linhas
const PLAYER_Y = 590;
// Perspectiva: ponto de fuga em (VX, HY); o chão do jogador está em PLAYER_Y.
const VX = 500, HY = 330, SPAWN = -760, LANE_OFFSET = [-335, 0, 335];
const scaleAt = g => 1 / Math.max(0.72, 1 + (PLAYER_Y - g) / 150);
const screenY = sc => HY + (PLAYER_Y - HY) * sc;
const ART = {
  low: ['obj-01', 'obj-02', 'obj-03', 'obj-04', 'obj-05'],
  block: ['obj-07', 'obj-08', 'obj-09', 'obj-10', 'obj-11', 'obj-12'],
  high: ['obj-19', 'obj-20', 'obj-21'],
  good: { Capacete: 'obj-13', 'Água': 'obj-14', Joelheira: 'obj-15' },
  coin: 'obj-17',
};
const HEIGHT = { low: 105, block: 140, high: 270, good: 95, coin: 64 };

export function setupRunner(ctx, kind = 'skate') {
  const w = 1000, h = 700, K = KINDS[kind] ?? KINDS.skate;
  let canvas, lane = 1, targetX = LANES[1], x = LANES[1], vertical = 0, vtime = 0, lives = 3, hits = 0, distance = 0, speed = 420, clock = 0, nextRow = 0, invuln = 0;
  let objects = [], picked = 0, combo = 0, down = null, flash = 0, fallen = false;
  const art = kind === 'skate' ? loadSprites('skate', ['skater', 'obj'], ctx.view) : null;
  const scene = kind === 'skate' ? loadImage(spriteFile('skate', 'cenario.webp'), ctx.view) : null;

  const rowRng = index => ctx.seededRandom(`${ctx.seed}:runner:${kind}:${index}`);
  const fact = () => { const bank = ctx.theme?.questions?.(ctx.level) ?? FALLBACK; const q = bank[Math.floor(rowRng(picked)() * bank.length)] ?? FALLBACK[0]; ctx.helper.textContent = q.explanation; };

  function spawnRow(index) {
    const r = rowRng(index);
    if (index % 4 === 3) { const l = Math.floor(r() * 3); for (let k = 0; k < 5; k++) objects.push({ type: 'coin', lane: l, y: SPAWN - k * 62, art: ART.coin, done: false }); return; }
    const free = Math.floor(r() * 3);
    for (let i = 0; i < 3; i++) {
      if (i === free && r() > 0.35) { { const label = K.good[Math.floor(r() * K.good.length)]; objects.push({ type: 'good', lane: i, y: SPAWN, label, art: ART.good[label], done: false }); } continue; }
      if (i === free) continue;
      const roll = r();
      const type = roll < 0.34 ? 'low' : roll < 0.68 ? 'high' : 'block';
      if (ctx.level === 1 && r() < 0.35) continue;
      const list = ART[type]; objects.push({ type, lane: i, y: SPAWN, art: list[Math.floor(r() * list.length)], done: false });
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
      speed = Math.min(820, 420 + ctx.level * 70 + clock / 1000 * 6);
      const step = speed * dt / 1000; distance += step;
      while (distance >= nextRow * ROW) { spawnRow(nextRow); nextRow++; }
      x += (targetX - x) * Math.min(1, dt / 90);
      if (vertical !== 0) { vtime -= dt; if (vtime <= 0) vertical = 0; }
      for (const o of objects) {
        o.y += step;
        if (o.done || o.y < PLAYER_Y - 36 || o.y > PLAYER_Y + 36) continue;
        if (o.lane !== lane) continue;
        o.done = true;
        if (o.type === 'coin') { ctx.awardSolved(2, canvas); hits++; combo++; }
        else if (o.type === 'good') { ctx.awardSolved(5, canvas); hits++; combo++; if (++picked % 3 === 0) fact(); else ctx.helper.textContent = `${o.label}!`; }
        else if (o.type === 'low' && vertical === 1) { /* pulou */ }
        else if (o.type === 'high' && vertical === -1) { /* abaixou */ }
        else { combo = 0; hurt(K.hit); }
      }
      objects = objects.filter(o => o.y < h + 100);
      ctx.progress.textContent = `❤ ${lives} · combo ${combo} · ${hits} pontos de corrida`;
    },
    draw(g) {
      const bgImg = scene?.complete && scene.naturalWidth ? scene : null;
      if (bgImg) g.drawImage(bgImg, 0, 0, w, h);
      else {
        g.fillStyle = K.bg; g.fillRect(0, 0, w, h);
        g.fillStyle = K.lane; g.beginPath(); g.moveTo(VX - 25, HY); g.lineTo(VX + 25, HY); g.lineTo(w, h); g.lineTo(0, h); g.fill();
      }
      // faixas em movimento sobre a pista: dão a sensação de velocidade
      g.strokeStyle = bgImg ? 'rgba(255,255,255,.55)' : K.edge; g.lineWidth = 4;
      for (let i = 0; i < 9; i++) {
        const t = ((i + (distance / 150) % 1) / 9) ** 1.8, t2 = (((i + 0.45 + (distance / 150) % 1)) / 9) ** 1.8;
        for (const lx of [-167, 167]) { g.lineWidth = 2 + 6 * t; g.beginPath(); g.moveTo(VX + lx * t * 1.32, screenY(t * 1.05)); g.lineTo(VX + lx * t2 * 1.32, screenY(t2 * 1.05)); g.stroke(); }
      }
      g.textAlign = 'center'; g.font = 'bold 22px Fredoka,sans-serif';
      for (const o of objects) {
        const sc = scaleAt(o.y); if (sc < 0.06) continue;
        const cx = VX + LANE_OFFSET[o.lane] * sc, cy = screenY(sc), hh = HEIGHT[o.type] * sc * 1.35;
        g.globalAlpha = o.done ? .25 : 1;
        if (!(art && drawSprite(g, art, o.art, cx, cy, { h: hh }))) {
          const r = Math.max(6, 40 * sc);
          if (o.type === 'coin') { g.fillStyle = '#ffd23b'; g.beginPath(); g.arc(cx, cy - r, r * .6, 0, 7); g.fill(); }
          else if (o.type === 'good') { g.fillStyle = K.goodColor; g.beginPath(); g.arc(cx, cy - r, r, 0, 7); g.fill(); }
          else if (o.type === 'low') { g.fillStyle = K.lowColor; g.fillRect(cx - 80 * sc, cy - 36 * sc, 160 * sc, 36 * sc); }
          else if (o.type === 'high') { g.fillStyle = K.highColor; g.fillRect(cx - 90 * sc, cy - 260 * sc, 180 * sc, 40 * sc); g.fillRect(cx - 90 * sc, cy - 260 * sc, 20 * sc, 260 * sc); g.fillRect(cx + 70 * sc, cy - 260 * sc, 20 * sc, 260 * sc); }
          else { g.fillStyle = K.blockColor; g.beginPath(); g.arc(cx, cy - r * 1.1, r * 1.1, 0, 7); g.fill(); }
        }
        g.globalAlpha = 1;
      }
      const hx = VX + (x - VX) * 1.34, hy = PLAYER_Y + 38;
      const lift = vertical === 1 ? 70 : 0, blink = invuln > 0 && Math.floor(clock / 90) % 2;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(hx, hy, 60, 14, 0, 0, 7); g.fill();
      g.globalAlpha = blink ? .5 : 1;
      let frame = `skater-${String(1 + Math.floor(clock / 130) % 4).padStart(2, '0')}`;
      if (fallen) frame = 'skater-11'; else if (invuln > 700) frame = 'skater-10'; else if (vertical === 1) frame = 'skater-08';
      else if (vertical === -1) frame = 'skater-07'; else if (Math.abs(targetX - x) > 30) frame = targetX < x ? 'skater-05' : 'skater-06';
      if (!(art && drawSprite(g, art, frame, hx, hy - lift, { h: 230 }))) {
        const squash = vertical === -1 ? 0.55 : 1;
        g.fillStyle = K.hero; g.fillRect(hx - 28, hy - 130 * squash - lift, 56, 100 * squash);
        g.fillStyle = '#ffe0bd'; g.beginPath(); g.arc(hx, hy - 150 * squash - lift, 24, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
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
  ctx.nextChallenge(); ctx.prompt.textContent = kind === 'rio' ? 'Desça o rio com segurança' : 'Corra pela cidade com segurança'; ctx.helper.textContent = K.help;
}
