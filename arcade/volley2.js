import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Vôlei de dois jogadores (arena compartilhada, quadra lateral na horizontal).
 * A mesma bola vai e volta por cima da rede. O aluno do lado esquerdo (azul) e o do lado direito (laranja)
 * cortam a bola com o dedo, como no Fruit Ninja, quando ela está na sua metade.
 * A bola começa lenta e acelera a cada rebatida da troca. A direção e a força do deslize definem o golpe.
 * Quem deixa a bola cair na sua metade, bate na rede ou manda para fora dá o ponto ao adversário.
 * Vence quem chegar primeiro a 7 pontos (ou quem tiver mais quando o tempo acabar).
 */
const W = 1500, H = 1000, NET_X = 750, NET_TOP = 520, FLOOR = 870, R = 34, TARGET = 7, WALL = 40, CEIL = 40;   // quadra alta: a bola pode subir bastante e continua visível

export function setupVolley2(ctx) {
  const art = loadSprites('volei2', ['jogadora', 'rede'], ctx.view);
  const ball_art = loadSprites('volei', ['bola', 'golpe'], ctx.view);
  const scene = loadImage(spriteFile('volei2', 'cenario.webp'), ctx.view);
  const rng = ctx.layoutRng;
  let canvas, ball = null, trail = [], swipes = new Map(), canHit = [false, false], lastHitter = -1, rally = 0, score = [0, 0], phase = 'wait', wait = 900, clock = 0, banner = null, fxs = [], pose = [{ id: 'jogadora-01', t: 0 }, { id: 'jogadora-01', t: 0 }], serveTo = rng() < .5 ? 0 : 1, over = false;

  const mult = () => Math.min(2.6, 1 + rally * .09);
  const gravity = () => 560 * (1 + (mult() - 1) * .25);
  function say(text) { banner = { text, age: 0 }; }
  function serve() {
    const dir = serveTo === 0 ? -1 : 1;     // a bola sai do centro, lenta, para quem vai receber
    ball = { x: NET_X, y: 380, vx: dir * 250, vy: -150, spin: 0 };
    canHit = [false, false]; lastHitter = -1; rally = 0; phase = 'play';
    canHit[serveTo] = true;
  }
  function point(side, text) {
    if (over) return;
    score[side]++; ctx.awardSide(side, true, canvas);
    ctx.helper.textContent = `Placar: ${score[0]} × ${score[1]}`;
    say(text); fxs.push({ id: 'bola-20', x: side === 0 ? 375 : 1125, y: 520, age: 0 });
    ball = null; phase = 'wait'; wait = 1300; serveTo = 1 - side;
    if (score[side] >= TARGET) { over = true; ctx.finish(side); }
  }
  function classify(pts) {
    const a = pts[Math.max(0, pts.length - 6)], b = pts[pts.length - 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.max(1, Math.hypot(dx, dy));
    const dur = Math.max(30, b.t - a.t);
    return { dx, dy, len, speed: len / dur };
  }
  function hit(side, info) {
    const dirX = side === 0 ? 1 : -1, nx = Math.max(.15, Math.min(1, info.dx * dirX / info.len)), up = Math.max(.1, Math.min(1, -info.dy / info.len));
    const power = Math.max(.6, Math.min(1.45, info.len / 200 + info.speed * .12)), base = 520 * mult();
    ball.vx = dirX * base * (.55 + .45 * nx) * power;
    ball.vy = -Math.min(base * (.6 + .5 * up) * (.9 + .3 * power), Math.sqrt(2 * gravity() * (FLOOR - CEIL)) * 1.3);   // a bola pode subir até o teto e quicar
    const kind = power > 1.2 ? 'Cortada!' : up > .75 && power < .95 ? 'Levantada!' : 'Toque!';
    say(kind); rally++; lastHitter = side; canHit[side] = false; canHit[1 - side] = false;
    pose[side] = { id: power > 1.2 ? 'jogadora-06' : up > .75 ? 'jogadora-04' : 'jogadora-03', t: 380 };
    fxs.push({ id: power > 1.2 ? 'golpe-07' : up > .75 ? 'golpe-09' : 'golpe-13', x: ball.x, y: ball.y, age: 0 });
    if (rally % 5 === 0) ctx.helper.textContent = `Troca de ${rally} bolas! A bola está ${Math.round(mult() * 100)}% mais rápida.`;
  }

  const game = {
    update(dt) {
      clock += dt; const s = dt / 1000;
      fxs.forEach(f => f.age += dt); fxs = fxs.filter(f => f.age < 650); trail = trail.filter(p => clock - p.at < 180);
      pose.forEach(p => { p.t = Math.max(0, p.t - dt); });
      if (banner && (banner.age += dt) > 900) banner = null;
      if (phase === 'wait') { wait -= dt; if (wait <= 0 && !over) serve(); return; }
      if (!ball) return;
      ball.vy += gravity() * s; ball.x += ball.vx * s; ball.y += ball.vy * s; ball.spin += ball.vx * s / 90;
      // paredes e teto quicam a bola (sem falta)
      if (ball.y < CEIL + R) { ball.y = CEIL + R; ball.vy = Math.abs(ball.vy) * .9; fxs.push({ id: 'bola-22', x: ball.x, y: CEIL, age: 0 }); }
      if (ball.x < WALL + R) { ball.x = WALL + R; ball.vx = Math.abs(ball.vx) * .9; fxs.push({ id: 'bola-22', x: WALL, y: ball.y, age: 0 }); }
      if (ball.x > W - WALL - R) { ball.x = W - WALL - R; ball.vx = -Math.abs(ball.vx) * .9; fxs.push({ id: 'bola-22', x: W - WALL, y: ball.y, age: 0 }); }
      // a bola entrou na metade de um jogador: ele pode rebater (uma vez por travessia)
      const half = ball.x < NET_X ? 0 : 1;
      if (lastHitter !== half && !canHit[half]) canHit[half] = true;
      // rede
      if (Math.abs(ball.x - NET_X) < R * .7 && ball.y > NET_TOP - 4 && ball.y < FLOOR) { say('Na rede!'); return point(1 - (lastHitter < 0 ? serveTo : lastHitter), 'Na rede!'); }
      if (ball.y >= FLOOR - R) { fxs.push({ id: 'bola-22', x: ball.x, y: FLOOR, age: 0 }); return point(ball.x < NET_X ? 1 : 0, 'Ponto!'); }
      
    },
    draw(g) {
      if (scene.complete && scene.naturalWidth) g.drawImage(scene, 0, 0, W, H);
      else { g.fillStyle = '#e8c98a'; g.fillRect(0, 0, W, H); g.fillStyle = '#c98e4a'; g.fillRect(0, FLOOR, W, H - FLOOR); g.fillStyle = '#fff'; g.fillRect(NET_X - 4, NET_TOP, 8, FLOOR - NET_TOP); }
      // jogadoras (decoração que reage ao golpe); a do lado direito é espelhada
      g.globalAlpha = .35; for (const side of [0, 1]) drawSprite(g, art, pose[side].t > 0 ? pose[side].id : 'jogadora-01', side === 0 ? 375 : 1125, FLOOR + 30, { h: 380, flip: side === 1 }); g.globalAlpha = 1;   // só demonstração: translúcidas
      // sombra e bola
      if (ball) {
        g.fillStyle = 'rgba(0,0,0,.25)'; const sh = Math.max(.25, 1 - Math.max(0, FLOOR - ball.y) / 520); g.beginPath(); g.ellipse(ball.x, FLOOR + 10, 38 * sh, 9 * sh, 0, 0, 7); g.fill();
        const fast = Math.hypot(ball.vx, ball.vy) > 900;
        if (!drawSprite(g, ball_art, fast ? 'bola-02' : `bola-0${3 + Math.floor(clock / 90) % 3}`, ball.x, ball.y, { h: R * 2.6, center: true, rot: ball.spin })) { g.fillStyle = '#fff'; g.beginPath(); g.arc(ball.x, ball.y, R, 0, 7); g.fill(); }
        // aviso de qual lado pode rebater
        const half = ball.x < NET_X ? 0 : 1;
        if (canHit[half]) { g.strokeStyle = half === 0 ? 'rgba(80,160,255,.8)' : 'rgba(255,150,60,.8)'; g.lineWidth = 5; g.beginPath(); g.arc(ball.x, ball.y, R + 18 + Math.sin(clock / 90) * 3, 0, 7); g.stroke(); }
      }
      for (const f of fxs) { g.globalAlpha = Math.max(0, 1 - f.age / 650); drawSprite(g, ball_art, f.id, f.x, f.y - f.age / 12, { h: 120, center: true }); g.globalAlpha = 1; }
      if (trail.length > 1) { g.lineCap = 'round'; for (const [w, c] of [[16, 'rgba(120,200,255,.35)'], [7, 'rgba(255,255,255,.95)']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); trail.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke(); } }
      // placar e velocidade
      g.fillStyle = 'rgba(8,16,40,.65)'; g.beginPath(); g.roundRect(NET_X - 190, 52, 380, 54, 14); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 34px Fredoka,sans-serif'; g.textAlign = 'center'; g.fillText(`${score[0]}  ×  ${score[1]}`, NET_X - 105, 91); g.font = 'bold 22px Fredoka,sans-serif'; g.fillText(`Troca ${rally} · x${mult().toFixed(1)}`, NET_X + 100, 88);
      if (banner) { g.globalAlpha = Math.max(0, 1 - banner.age / 900); g.fillStyle = '#ffd23b'; g.strokeStyle = '#17234b'; g.lineWidth = 8; g.font = 'bold 54px Fredoka,sans-serif'; g.strokeText(banner.text, NET_X, 190 - banner.age / 16); g.fillText(banner.text, NET_X, 190 - banner.age / 16); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (over) return;
      if (e.type === 'down') { swipes.set(e.id, { side: e.x < NET_X ? 0 : 1, pts: [{ x: e.x, y: e.y, t: e.time ?? clock }] }); trail.push({ x: e.x, y: e.y, at: clock }); return; }
      const sw = swipes.get(e.id); if (!sw) return;
      if (e.type === 'cancel' || e.type === 'up') { swipes.delete(e.id); return; }
      const prev = sw.pts[sw.pts.length - 1], pt = { x: e.x, y: e.y, t: e.time ?? clock }; sw.pts.push(pt); trail.push({ x: e.x, y: e.y, at: clock });
      if (!ball || phase !== 'play' || !canHit[sw.side]) return;
      const half = ball.x < NET_X ? 0 : 1; if (half !== sw.side) return;
      const dx = pt.x - prev.x, dy = pt.y - prev.y, l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((ball.x - prev.x) * dx + (ball.y - prev.y) * dy) / l2)) : 0;
      if (Math.hypot(ball.x - (prev.x + t * dx), ball.y - (prev.y + t * dy)) <= R + 26) hit(sw.side, classify(sw.pts));
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('volley2-arena');
  canvas.style.aspectRatio = `${W}/${H}`; canvas.style.width = 'auto'; canvas.style.height = '100%'; canvas.style.maxWidth = '100%';
  canvas.state = () => ({ ball, score, rally, phase, canHit });
  ctx.nextChallenge();
  ctx.prompt.textContent = 'Vôlei: um contra o outro'; ctx.helper.textContent = 'Corte a bola com o dedo quando ela estiver do seu lado. A bola acelera a cada rebatida. Primeiro a 7 pontos vence.';
}
