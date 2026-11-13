import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Cesta: só fazer cestas.
 * Arraste da bola até onde quer lançar e solte. A cesta troca de lugar a cada acerto; depois de alguns
 * acertos ela passa a deslizar de um lado para o outro, e a velocidade e o tamanho do aro pioram aos poucos.
 */
const W = 1000, H = 700, START = { x: 500, y: 600 }, G = 900;
const FACTS = ['Treino de arremesso melhora a coordenação entre olhos e mãos.', 'Flexionar os joelhos dá força ao arremesso e poupa os braços.', 'Repetição com calma constrói a precisão no esporte.'];

export function setupHoops(ctx) {
  const art = loadSprites('hoops2', ['el', 'fx'], ctx.view);
  const spinArt = loadSprites('bolas', ['giro'], ctx.view);
  const bg = loadImage(spriteFile('hoops2', 'cenario.webp'), ctx.view);
  const rng = ctx.layoutRng;
  let canvas, hoop, ball = { ...START, vx: 0, vy: 0, flying: false, r: 30, spin: 0 }, drag = null, hits = 0, shots = 0, streak = 0, burst = [], rimFlash = 0, wait = 0, facts = 0, clock = 0;

  const rimWidth = () => Math.max(.62, 1 - (ctx.level - 1) * .1 - hits * .012);
  function place() {
    const slides = hits >= 4;
    hoop = { x: 200 + rng() * 600, y: 190 + rng() * 120, s: rimWidth(), vx: slides ? (rng() < .5 ? -1 : 1) * (40 + ctx.level * 22 + Math.min(150, (hits - 4) * 12)) : 0 };
  }
  const rim = () => ({ x: hoop.x, y: hoop.y + 36 * hoop.s, half: 52 * hoop.s });

  function launch(dx, dy) {
    const len = Math.hypot(dx, dy); if (len < 30) return;
    const k = 3.0, cap = 1900, sc = Math.min(1, cap / (len * k));
    ball.vx = dx * k * sc; ball.vy = dy * k * sc; ball.flying = true; shots++;
  }
  function reset(delay = 350) { ball = { ...START, vx: 0, vy: 0, flying: false, r: 30, spin: 0 }; wait = delay; }

  const game = {
    update(dt) {
      clock += dt; rimFlash = Math.max(0, rimFlash - dt); wait = Math.max(0, wait - dt);
      if (hoop.vx) { hoop.x += hoop.vx * dt / 1000; if (hoop.x < 160) { hoop.x = 160; hoop.vx = Math.abs(hoop.vx); } else if (hoop.x > 840) { hoop.x = 840; hoop.vx = -Math.abs(hoop.vx); } }
      burst.forEach(b => b.age += dt); burst = burst.filter(b => b.age < 700);
      if (ball.flying) {
        const py = ball.y; ball.vy += G * dt / 1000; ball.x += ball.vx * dt / 1000; ball.y += ball.vy * dt / 1000; ball.spin += (ball.vx >= 0 ? 1 : -1) * (7 + Math.abs(ball.vx) / 110) * dt / 1000;
        const r = rim();
        // acerto: a bola desce atravessando a linha do aro, dentro da boca do aro
        if (ball.vy > 0 && py < r.y && ball.y >= r.y && Math.abs(ball.x - r.x) < r.half) {
          hits++; streak++; rimFlash = 600;
          ctx.awardSolved(10 + Math.min(10, streak), canvas);
          for (let i = 0; i < 6; i++) burst.push({ x: r.x + (i - 2.5) * 22, y: r.y, age: 0, id: i % 2 ? 'fx-07' : 'fx-08' });
          if (hits % 4 === 0) ctx.helper.textContent = FACTS[(facts++) % FACTS.length]; else ctx.helper.textContent = streak > 2 ? `Sequência de ${streak}!` : 'Cesta!';
          ball.flying = false; place(); reset(500);
        } else if (ball.vy > 0 && py < r.y && ball.y >= r.y && Math.abs(ball.x - r.x) < r.half + 26) {
          ball.vy *= -.45; ball.vx *= -.4; // bateu no aro
        } else if (ball.y > H + 80 || ball.x < -80 || ball.x > W + 80) { streak = 0; ctx.awardWrong(0, canvas); ctx.helper.textContent = 'Quase! Arraste da bola até um pouco acima do aro.'; reset(300); }
      }
      ctx.progress.textContent = `${hits} cestas em ${shots} lançamentos${streak > 1 ? ` · sequência ${streak}` : ''}`;
    },
    draw(g) {
      if (bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, W, H); else { g.fillStyle = '#bfe9ff'; g.fillRect(0, 0, W, H); g.fillStyle = '#c98e4a'; g.fillRect(0, 500, W, 200); }
      const r = rim();
      if (!drawSprite(g, art, 'el-03', r.x, r.y - 4, { w: 134 * hoop.s * 1.15, top: true })) { g.fillStyle = '#e85536'; g.fillRect(r.x - r.half, r.y - 4, r.half * 2, 8); }
      if (rimFlash > 0) { g.globalAlpha = rimFlash / 600; drawSprite(g, art, 'fx-10', r.x, r.y + 20, { h: 190 * hoop.s, center: true }); g.globalAlpha = 1; }
      for (const b of burst) { g.globalAlpha = 1 - b.age / 700; drawSprite(g, art, b.id, b.x, b.y - b.age / 5, { h: 70, center: true }); g.globalAlpha = 1; }
      const flaming = streak >= 3;
      if (drag) {
        const dx = drag.x - ball.x, dy = drag.y - ball.y, k = 3.0;
        g.fillStyle = 'rgba(255,255,255,.8)';
        for (let t = .08; t < .95; t += .09) { const px = ball.x + dx * k * t, py = ball.y + dy * k * t + .5 * G * t * t; if (py > H) break; g.beginPath(); g.arc(px, py, 5 - t * 3, 0, 7); g.fill(); }
      }
      const frame = `basq-0${1 + (((Math.floor(ball.spin / (Math.PI / 4)) % 8) + 8) % 8)}`;
      if (!(!flaming && drawSprite(g, spinArt, frame, ball.x, ball.y, { h: 72, center: true })) && !drawSprite(g, art, flaming ? 'el-06' : 'el-05', ball.x, ball.y, { h: 72, center: true, rot: ball.spin })) { g.fillStyle = '#ef8d2b'; g.beginPath(); g.arc(ball.x, ball.y, 30, 0, 7); g.fill(); }
    },
    onPointer(e) {
      if (ball.flying || wait > 0) return;
      if (e.type === 'down' && Math.hypot(e.x - ball.x, e.y - ball.y) < 120) { drag = e; return; }
      if (e.type === 'move' && drag) { drag = e; return; }
      if (e.type === 'cancel') { drag = null; return; }
      if (e.type === 'up' && drag) { const dx = e.x - ball.x, dy = e.y - ball.y; drag = null; launch(dx, dy); }
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('hoops-arena'); canvas.state = () => ({ hoop, ball, rim: rim() });
  ctx.nextChallenge(); place();
  ctx.prompt.textContent = 'Faça cestas!'; ctx.helper.textContent = 'Arraste da bola até onde quer lançar e solte. A cesta muda de lugar a cada acerto e depois passa a se mover.';
}
