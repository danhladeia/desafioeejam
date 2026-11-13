import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Futebol de disco (estilo disco bol), arena compartilhada vista de cima.
 * Cada aluno arrasta o seu disco na própria metade do campo (azul à esquerda, laranja à direita) e empurra a bola
 * para o gol do adversário. A bola quica nas paredes e desliza sem parar sozinha. Primeiro a 5 gols vence.
 */
const W = 1200, H = 800, MID = 600, X0 = 52, X1 = 1148, Y0 = 56, Y1 = 744, GOAL_Y0 = 300, GOAL_Y1 = 500, BR = 32, SR = 58, TARGET = 5;

export function setupDisco(ctx) {
  const art = loadSprites('disco', ['peca'], ctx.view);
  const field = loadImage(spriteFile('disco', 'campo.webp'), ctx.view);
  const rng = ctx.layoutRng;
  let canvas, ball = { x: MID, y: H / 2, vx: 0, vy: 0, spin: 0 }, st = [{ x: 200, y: H / 2, tx: 200, ty: H / 2, vx: 0, vy: 0 }, { x: 1000, y: H / 2, tx: 1000, ty: H / 2, vx: 0, vy: 0 }];
  let ptrs = new Map(), score = [0, 0], freeze = 900, clock = 0, banner = null, fxs = [], over = false, serveTo = rng() < .5 ? 0 : 1, lastTouch = -1;

  const clampStriker = (side, x, y) => ({ x: Math.max(side === 0 ? X0 + SR : MID + SR + 6, Math.min(side === 0 ? MID - SR - 6 : X1 - SR, x)), y: Math.max(Y0 + SR, Math.min(Y1 - SR, y)) });
  function kickoff() { ball = { x: MID, y: H / 2, vx: (serveTo === 0 ? -1 : 1) * 160, vy: (rng() * 2 - 1) * 90, spin: 0 }; lastTouch = -1; }
  function goal(side) {
    if (over) return;
    score[side]++; ctx.awardSide(side, true, canvas); banner = { text: 'GOL!', age: 0 };
    ctx.helper.textContent = `Placar: ${score[0]} × ${score[1]}`;
    fxs.push({ id: 'peca-20', x: side === 0 ? 1120 : 80, y: H / 2, age: 0 }, { id: 'peca-19', x: side === 0 ? 1090 : 110, y: H / 2 - 60, age: 0 });
    ball = { x: MID, y: H / 2, vx: 0, vy: 0, spin: 0 }; freeze = 1400; serveTo = 1 - side;
    if (score[side] >= TARGET) { over = true; ctx.finish(side); }
  }
  function collide(s, side) {
    const dx = ball.x - s.x, dy = ball.y - s.y, d = Math.hypot(dx, dy), min = BR + SR;
    if (d >= min || d === 0) return;
    const nx = dx / d, ny = dy / d;
    ball.x = s.x + nx * min; ball.y = s.y + ny * min;
    const rvx = ball.vx - s.vx, rvy = ball.vy - s.vy, dot = rvx * nx + rvy * ny;
    if (dot < 0) { ball.vx = (rvx - 2 * dot * nx) + s.vx; ball.vy = (rvy - 2 * dot * ny) + s.vy; }
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp < 520) { ball.vx = nx * 520; ball.vy = ny * 520; }          // toda batida dá movimento à bola
    if (sp > 1700) { ball.vx *= 1700 / sp; ball.vy *= 1700 / sp; }
    lastTouch = side; fxs.push({ id: 'peca-16', x: ball.x, y: ball.y, age: 0 });
  }

  const game = {
    update(dt) {
      clock += dt; const s = dt / 1000;
      fxs.forEach(f => f.age += dt); fxs = fxs.filter(f => f.age < 600); if (banner && (banner.age += dt) > 1100) banner = null;
      // discos seguem o dedo com velocidade limitada (não teletransportam)
      st.forEach((p, side) => {
        const t = clampStriker(side, p.tx, p.ty), dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy), step = Math.min(d, 2300 * s), nx = d ? dx / d : 0, ny = d ? dy / d : 0;
        const ox = p.x, oy = p.y; p.x += nx * step; p.y += ny * step; p.vx = (p.x - ox) / Math.max(s, .001); p.vy = (p.y - oy) / Math.max(s, .001);
      });
      if (freeze > 0) { freeze -= dt; if (freeze <= 0 && !over) kickoff(); return; }
      const k = Math.pow(.9935, dt / 16.7);
      ball.vx *= k; ball.vy *= k; ball.x += ball.vx * s; ball.y += ball.vy * s; ball.spin += Math.hypot(ball.vx, ball.vy) * s / 140;
      for (const side of [0, 1]) collide(st[side], side);
      // paredes e gols
      if (ball.y < Y0 + BR) { ball.y = Y0 + BR; ball.vy = Math.abs(ball.vy) * .94; fxs.push({ id: 'peca-17', x: ball.x, y: Y0, age: 0 }); }
      if (ball.y > Y1 - BR) { ball.y = Y1 - BR; ball.vy = -Math.abs(ball.vy) * .94; fxs.push({ id: 'peca-17', x: ball.x, y: Y1, age: 0 }); }
      const inMouth = ball.y > GOAL_Y0 + BR * .4 && ball.y < GOAL_Y1 - BR * .4;
      if (ball.x < X0 + BR && !inMouth) { ball.x = X0 + BR; ball.vx = Math.abs(ball.vx) * .94; }
      if (ball.x > X1 - BR && !inMouth) { ball.x = X1 - BR; ball.vx = -Math.abs(ball.vx) * .94; }
      if (ball.x < X0 - 6) return goal(1);
      if (ball.x > X1 + 6) return goal(0);
      ctx.progress.textContent = `${score[0]} × ${score[1]} · primeiro a ${TARGET} gols`;
    },
    draw(g) {
      if (field.complete && field.naturalWidth) g.drawImage(field, 0, 0, W, H); else { g.fillStyle = '#3f9b3a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.moveTo(MID, Y0); g.lineTo(MID, Y1); g.stroke(); }
      for (const side of [0, 1]) { const p = st[side], held = [...ptrs.values()].some(x => x.side === side); if (!drawSprite(g, art, side === 0 ? (held ? 'peca-03' : 'peca-01') : (held ? 'peca-04' : 'peca-02'), p.x, p.y, { h: SR * 2.1, center: true })) { g.fillStyle = side === 0 ? '#2f7eea' : '#e85d70'; g.beginPath(); g.arc(p.x, p.y, SR, 0, 7); g.fill(); } }
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(ball.x + 4, ball.y + 8, BR, BR * .8, 0, 0, 7); g.fill();
      if (!drawSprite(g, art, 'peca-07', ball.x, ball.y, { h: BR * 2.2, center: true, rot: ball.spin })) { g.fillStyle = '#fff'; g.beginPath(); g.arc(ball.x, ball.y, BR, 0, 7); g.fill(); }
      for (const f of fxs) { g.globalAlpha = Math.max(0, 1 - f.age / 600); drawSprite(g, art, f.id, f.x, f.y - f.age / 14, { h: 90 + f.age / 8, center: true }); g.globalAlpha = 1; }
      g.fillStyle = 'rgba(8,16,40,.6)'; g.beginPath(); g.roundRect(500, 8, 200, 44, 12); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 30px Fredoka,sans-serif'; g.textAlign = 'center'; g.fillText(`${score[0]}  ×  ${score[1]}`, 600, 40);
      if (banner) { g.globalAlpha = Math.max(0, 1 - banner.age / 1100); g.fillStyle = '#ffd23b'; g.strokeStyle = '#17234b'; g.lineWidth = 9; g.font = 'bold 96px Fredoka,sans-serif'; g.strokeText(banner.text, 600, 400); g.fillText(banner.text, 600, 400); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (over) return;
      if (e.type === 'down') { const side = e.x < MID ? 0 : 1; if ([...ptrs.values()].some(p => p.side === side)) return; ptrs.set(e.id, { side }); st[side].tx = e.x; st[side].ty = e.y; return; }
      const p = ptrs.get(e.id); if (!p) return;
      if (e.type === 'up' || e.type === 'cancel') { ptrs.delete(e.id); return; }
      st[p.side].tx = e.x; st[p.side].ty = e.y;
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('disco-arena');
  canvas.style.aspectRatio = `${W}/${H}`; canvas.style.width = 'auto'; canvas.style.height = '100%'; canvas.style.maxWidth = '100%';
  canvas.state = () => ({ ball, st, score, freeze });
  ctx.nextChallenge();
  ctx.prompt.textContent = 'Futebol de disco: um contra o outro'; ctx.helper.textContent = 'Arraste o seu disco na sua metade e empurre a bola para o gol do adversário. Primeiro a 5 gols vence.';
}
