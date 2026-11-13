import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Corrida de Mountain Bike (2D, vista lateral).
 * Direita da tela: segure para acelerar. Esquerda da tela: toque para saltar.
 * Rampas lançam a bicicleta (quanto mais rápido, mais alto); pedras, troncos e buracos pedem salto;
 * lama atrapalha; moedas, água e capacete dão pontos; o raio dá um turbo.
 * A pista é gerada por trecho com semente: os dois lados correm no mesmo percurso.
 */
const W = 1000, H = 700, GROUND = 585, RIDER_X = 190, SEG = 580;
const TYPES = {
  ramp: { ids: ['obj-01', 'obj-02', 'obj-03'], h: 120, w: 170 },
  rock: { ids: ['obj-05'], h: 80, w: 130 },
  log: { ids: ['obj-06'], h: 62, w: 170 },
  cone: { ids: ['obj-10'], h: 80, w: 60 },
  barrier: { ids: ['obj-11', 'obj-12'], h: 82, w: 150 },
  roots: { ids: ['obj-07'], h: 24, w: 150, dh: 46 },
  mud: { ids: ['obj-08'], h: 12, w: 190, dh: 50 },
  hole: { ids: ['obj-09'], h: 6, w: 170, dh: 52 },
  coin: { ids: ['obj-19'], h: 62, w: 46 },
  bottle: { ids: ['obj-17'], h: 82, w: 50 },
  helmet: { ids: ['obj-18'], h: 78, w: 70 },
  bolt: { ids: ['obj-22'], h: 84, w: 54 },
};
const FACTS = ['Beber água ajuda o corpo a render melhor na prática.', 'Capacete e proteção evitam lesões nas aventuras urbanas.', 'Ritmo constante poupa energia: acelerar sempre cansa mais.', 'Respeitar a sinalização torna o percurso seguro para todos.'];

export function setupBike(ctx) {
  const art = loadSprites('mtb', ['rider', 'obj', 'fx'], ctx.view);
  const sky = loadImage(spriteFile('mtb', 'camada1.webp'), ctx.view);
  const far = loadImage(spriteFile('mtb', 'camada2.webp'), ctx.view);
  const mid = loadImage(spriteFile('mtb', 'camada3.webp'), ctx.view);
  const ground = loadImage(spriteFile('mtb', 'camada4.webp'), ctx.view);
  const bush = loadImage(spriteFile('mtb', 'camada5.webp'), ctx.view);
  const trackLength = 21000 + ctx.level * 3500;
  let canvas, dist = 0, v = 260, h = 0, vy = 0, air = 0, accel = false, jumpBuffer = 0, crash = 0, boost = 0, invuln = 0, lives = 4, clock = 0, mudFx = 0;
  let items = [], built = 0, coins = 0, picks = 0, down = new Map(), puffs = [], done = false, lastJumpAir = 0;
  const rng = i => ctx.seededRandom(`${ctx.seed}:bike:${i}`);
  const spriteOf = t => TYPES[t].ids[0];

  function build(upto) {
    while (built * SEG < upto) {
      const i = built++, r = rng(i), px = i * SEG + 700, progress = Math.min(1, px / trackLength);
      // dificuldade gradual: mais obstáculos e menos respiro conforme avança
      const hazard = 0.16 + progress * 0.5 + ctx.level * 0.05;
      if (i < 3) continue;
      const roll = r();
      if (roll < hazard) {
        const pool = progress < .2 ? ['ramp', 'ramp', 'rock', 'mud', 'cone'] : progress < .35 ? ['ramp', 'rock', 'log', 'mud', 'cone'] : progress < .6 ? ['ramp', 'rock', 'log', 'mud', 'hole', 'barrier', 'cone', 'roots'] : ['ramp', 'rock', 'hole', 'barrier', 'log', 'mud', 'roots'];
        const type = pool[Math.floor(r() * pool.length)], def = TYPES[type];
        items.push({ type, x: px + r() * 120, art: def.ids[Math.floor(r() * def.ids.length)], done: false });
        if (type === 'ramp' && r() < .7) for (let k = 0; k < 4; k++) items.push({ type: 'coin', x: px + 220 + k * 85, lift: 160 + Math.sin(k / 3 * Math.PI) * 90, art: 'obj-19', done: false });
      } else {
        const kind = r() < .2 ? 'bottle' : r() < .12 ? 'helmet' : r() < .08 ? 'bolt' : 'coin';
        const n = kind === 'coin' ? 3 + Math.floor(r() * 3) : 1;
        for (let k = 0; k < n; k++) items.push({ type: kind, x: px + k * 85, lift: 6, art: TYPES[kind].ids[0], done: false });
      }
    }
  }
  const puff = (x, y, img) => { puffs.push({ x, y, age: 0, img }); };
  function hurt(text) {
    if (invuln > 0 || crash > 0) return;
    lives = Math.max(0, lives - 1); crash = 650; invuln = 1700; v = Math.min(v, 150); ctx.awardWrong(0, canvas); ctx.helper.textContent = text;
    puff(RIDER_X + 60, GROUND - 10, 'fx-01');
    if (!lives) { done = true; ctx.finish(); }
  }

  const game = {
    update(dt) {
      if (done) return;
      const s = dt / 1000; clock += dt; crash = Math.max(0, crash - dt); invuln = Math.max(0, invuln - dt); boost = Math.max(0, boost - dt); jumpBuffer = Math.max(0, jumpBuffer - dt);
      const vmax = (470 + ctx.level * 60) + (boost > 0 ? 220 : 0) + Math.min(160, dist / 160);   // mais tempo para reagir
      if (crash > 0) v = Math.max(80, v - 900 * s);
      else if (accel) v = Math.min(vmax, v + (h > 4 ? 120 : 520) * s);
      else v = Math.max(170, v - 260 * s);
      dist += v * s; build(dist + 1600);
      // física vertical
      if (h > 0 || vy > 0) { vy -= 2300 * s; h += vy * s; air += dt; if (h <= 0) { if (air > 450 && lastJumpAir) { ctx.awardSolved(3, canvas); } h = 0; vy = 0; air = 0; lastJumpAir = 0; puff(RIDER_X + 40, GROUND - 6, 'fx-01'); } }
      if (h === 0 && jumpBuffer > 0 && crash <= 0) { vy = 820 + v * 0.18; h = 0.01; jumpBuffer = 0; lastJumpAir = 1; air = 0; }
      // objetos
      const rx0 = dist + RIDER_X - 40, rx1 = dist + RIDER_X + 26;
      for (const o of items) {
        if (o.done) continue;
        const def = TYPES[o.type], dh = def.dh ?? def.h * 1.25, spr = art.get(o.art), drawW = spr ? dh * spr.w / spr.h : def.w;
        const half = drawW * (o.type === 'ramp' ? .3 : .4), ox0 = o.x - half, ox1 = o.x + half;
        if (ox1 < rx0 - 40) { o.done = true; continue; }
        if (ox0 > rx1 || ox1 < rx0) continue;
        const lift = o.lift ?? 0;
        if (o.type === 'coin') { if (Math.abs(h - lift) < 120) { o.done = true; coins++; if (coins % 5 === 0) { ctx.awardSolved(10, canvas); ctx.helper.textContent = `${coins} moedas! Continue assim.`; } } }
        else if (['bottle', 'helmet'].includes(o.type)) { if (Math.abs(h - lift) < 120) { o.done = true; ctx.awardSolved(5, canvas); ctx.helper.textContent = FACTS[(picks++) % FACTS.length]; } }
        else if (o.type === 'bolt') { if (Math.abs(h - lift) < 120) { o.done = true; boost = 2600; ctx.helper.textContent = 'Turbo! Segure o acelerador.'; puff(RIDER_X, GROUND - 60, 'fx-04'); } }
        else if (o.type === 'ramp') { if (h < 8 && crash <= 0) { o.done = true; vy = 560 + v * 0.62; h = 0.01; air = 0; lastJumpAir = 1; puff(RIDER_X, GROUND - 20, 'fx-01'); ctx.helper.textContent = 'Rampa! Quanto mais rápido, mais alto você voa.'; } }
        else if (o.type === 'mud') { if (h < 10) { o.done = true; v *= 0.62; puff(RIDER_X + 50, GROUND - 20, 'fx-07'); ctx.helper.textContent = 'Lama! Salte para não perder velocidade.'; } }
        else if (o.type === 'hole') { if (h < 14) { o.done = true; hurt('Buraco! Salte antes de chegar nele.'); } }
        else if (h < def.h * 0.72 - 6) { o.done = true; hurt('Obstáculo! Salte no tempo certo.'); }
      }
      items = items.filter(o => !o.done || o.x > dist - 400);
      puffs.forEach(p => p.age += dt); puffs = puffs.filter(p => p.age < 520);
      if (dist >= trackLength && !done) { done = true; ctx.awardSolved(15, canvas); ctx.helper.textContent = 'Chegada! Percurso completo.'; ctx.finish(); }
      ctx.progress.textContent = `${Math.min(100, Math.round(dist / trackLength * 100))}% do percurso · ❤ ${lives} · ${coins} moedas`;
    },
    draw(g) {
      const tile = (img, factor, y, hh, alpha = 1) => {
        if (!img.complete || !img.naturalWidth) return false;
        const w = hh * img.naturalWidth / img.naturalHeight, off = -((dist * factor) % w);
        g.globalAlpha = alpha; for (let x = off; x < W; x += w) g.drawImage(img, Math.round(x), y, Math.ceil(w) + 1, hh); g.globalAlpha = 1; return true;
      };
      if (sky.complete && sky.naturalWidth) g.drawImage(sky, 0, 0, W, 560); else { g.fillStyle = '#9fdcff'; g.fillRect(0, 0, W, H); }
      g.fillStyle = '#7a4b2a'; g.fillRect(0, GROUND, W, H - GROUND); tile(far, 0.06, 150, 400); tile(mid, 0.22, 180, 420);
      if (!tile(ground, 1, GROUND - 52, 190)) { g.fillStyle = '#9b6a3c'; g.fillRect(0, GROUND, W, H - GROUND); }
      // chegada
      const fx = RIDER_X + (trackLength - dist); if (fx < W + 200) drawSprite(g, art, 'obj-14', fx, GROUND + 6, { h: 280 });
      for (const o of items) {
        const sx = RIDER_X + (o.x - dist); if (sx < -200 || sx > W + 200) continue;
        const def = TYPES[o.type], y = GROUND + 8 - (o.lift ?? 0);
        g.globalAlpha = o.done ? .25 : 1;
        if (!drawSprite(g, art, o.art, sx, y, { h: def.dh ?? def.h * 1.25 })) { g.fillStyle = o.type === 'coin' ? '#ffd23b' : '#7a4a2a'; g.fillRect(sx - def.w / 2, y - def.h, def.w, def.h); }
        g.globalAlpha = 1;
      }
      // ciclista
      const fr = crash > 0 ? 'rider-12' : `rider-0${1 + Math.floor(clock * (0.004 + v / 90000)) % 4}`;
      const tilt = Math.max(-.5, Math.min(.5, -vy / 1900));
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(RIDER_X, GROUND + 10, 70 - Math.min(30, h / 8), 11, 0, 0, 7); g.fill();
      if (invuln > 0 && Math.floor(clock / 100) % 2) g.globalAlpha = .55;
      if (!drawSprite(g, art, fr, RIDER_X, GROUND + 8 - h, { h: 200, rot: tilt })) { g.fillStyle = '#e85d70'; g.fillRect(RIDER_X - 40, GROUND - h - 100, 80, 110); }
      g.globalAlpha = 1;
      for (const p of puffs) { g.globalAlpha = 1 - p.age / 520; drawSprite(g, art, p.img, p.x - p.age / 8, p.y, { h: 70 + p.age / 6 }); g.globalAlpha = 1; }
      if (boost > 0) drawSprite(g, art, 'fx-04', RIDER_X - 90, GROUND - 60 - h, { h: 90, center: true });
      tile(bush, 1.7, 628, 96, .95);
      // botões de toque
      g.globalAlpha = .55; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(110, 610, 70, 0, 7); g.fill(); g.beginPath(); g.arc(890, 610, 80, 0, 7); g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#17234b'; g.font = 'bold 64px Fredoka,sans-serif'; g.textAlign = 'center'; g.fillText('↑', 110, 632); g.fillText('»', 890, 634);
      // barra de progresso
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(250, 22, 500, 14); g.fillStyle = '#ffd23b'; g.fillRect(250, 22, 500 * Math.min(1, dist / trackLength), 14);
    },
    onPointer(e) {
      if (done) return;
      if (e.type === 'down') { if (e.x < 430) jumpBuffer = 260; else { down.set(e.id, true); accel = true; } return; }
      if (e.type === 'up' || e.type === 'cancel') { down.delete(e.id); accel = down.size > 0; }
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('bike-arena'); canvas.state = () => ({ dist, v, h, lives, items, trackLength });
  ctx.nextChallenge(); build(2400);
  ctx.prompt.textContent = 'Acelere e salte para completar o percurso';
  ctx.helper.textContent = 'Segure o lado direito para acelerar. Toque no lado esquerdo para saltar. Rampas lançam mais alto quando você está rápido.';
}
