import { createArena } from './engine.js';
import { loadSprites, drawSprite } from './sprites.js';

/**
 * Chute a Gol (chute livre): chute para marcar de verdade.
 * Arraste da bola até onde quer chutar e solte. Quanto mais longo o arrasto, mais forte o chute (forte demais perde
 * precisão; fraco demais é fácil de defender). Argolas especiais no gol valem mais pontos. O goleiro tenta defender.
 */
const W = 1000, H = 700, BALL = { x: 412, y: 678 };
const GOAL = { x0: 70, x1: 930, y0: 168, y1: 392 };
const RINGS = [
  { id: 'target-02', mult: 2, label: 'azul' }, { id: 'target-09', mult: 2, label: 'vermelha' },
  { id: 'target-17', mult: 2, label: 'roxa' }, { id: 'target-04', mult: 3, label: 'dourada' },
];
const FACTS = ['Chutar com o peito do pé dá mais força; com a parte de dentro, mais precisão.', 'Olhar para o gol antes de chutar ajuda a escolher o canto.', 'Goleiros treinam a reação e a antecipação do lance.'];

export function setupFreekick(ctx) {
  const art = loadSprites('penalty', ['kicker', 'keeper', 'el'], ctx.view);
  const fx = loadSprites('penalty2', ['target', 'fx'], ctx.view);
  const rng = ctx.layoutRng;
  let canvas, ball = { ...BALL, flying: false }, drag = null, kicker = { id: 'kicker-07', t: 0 }, keeper = { id: 'keeper-01', x: 500, y: 330, t: 0 };
  let shot = null, targets = [], goals = 0, shots = 0, streak = 0, wait = 0, banner = null, puffs = [], clock = 0, facts = 0;

  function placeTargets() {
    const spots = [[160, 210], [840, 210], [160, 335], [840, 335], [500, 205], [330, 275], [670, 275]];
    const pool = [...spots].sort(() => rng() - .5);
    const count = Math.min(3, 1 + Math.floor(goals / 2) + (ctx.level > 1 ? 1 : 0));
    const gold = goals > 0 && goals % 3 === 0;
    targets = pool.slice(0, count).map(([x, y], i) => ({ x, y, ...(gold && i === 0 ? RINGS[3] : RINGS[Math.floor(rng() * 3)]), r: Math.max(34, 54 - goals * 1.2 - ctx.level * 3), vx: goals >= 5 && i === 0 ? (rng() < .5 ? -1 : 1) * (40 + goals * 5) : 0 }));
  }
  const keeperSkill = () => Math.min(.85, .28 + ctx.level * .14 + goals * .015);

  function kick(dx, dy) {
    const len = Math.hypot(dx, dy); if (len < 40 || wait > 0 || ball.flying) return;
    const power = Math.min(1.25, len / 380);
    // erro de pontaria cresce quando o chute é forte demais
    const err = Math.max(0, power - .85) * 140, jx = (rng() * 2 - 1) * err, jy = (rng() * 2 - 1) * err * .6;
    const to = { x: ball.x + dx * 1.12 + jx, y: Math.max(40, ball.y + dy * 1.12 + jy) };
    // goleiro escolhe um lado antes de ver onde a bola vai chegar (às vezes acerta)
    const guess = rng() < keeperSkill() ? to.x + (rng() * 2 - 1) * 60 : 120 + rng() * 760;
    shot = { from: { x: ball.x, y: ball.y }, to, t: 0, dur: Math.max(360, 820 - power * 380), power, guess, resolved: false };
    ball.flying = true; shots++; kicker = { id: 'kicker-04', t: 700 };
    const side = guess < 380 ? 'L' : guess > 620 ? 'R' : 'M', high = to.y < 280;
    keeper = { id: side === 'L' ? (high ? 'keeper-02' : 'keeper-03') : side === 'R' ? (high ? 'keeper-04' : 'keeper-05') : 'keeper-06', x: Math.max(130, Math.min(870, guess)), y: high ? 300 : 345, t: 900 };
    puffs.push({ x: ball.x, y: ball.y, age: 0, id: 'fx-06' });
  }
  function resolve() {
    shot.resolved = true;
    const p = shot.to, inGoal = p.x > GOAL.x0 && p.x < GOAL.x1 && p.y > GOAL.y0 && p.y < GOAL.y1;
    const corner = p.y < 250 && (p.x < 230 || p.x > 770);
    const reach = corner ? 78 : 125, saved = Math.abs(keeper.x - p.x) < reach && !(corner && shot.power > .8) && !(shot.power > 1.05);
    if (!inGoal) { streak = 0; ctx.awardWrong(0, canvas); banner = { text: p.y <= GOAL.y0 ? 'Por cima!' : 'Para fora!', age: 0 }; ctx.helper.textContent = 'Mire dentro do gol. Chute forte demais perde a precisão.'; kicker = { id: 'kicker-06', t: 800 }; return finish(); }
    if (saved) { streak = 0; ctx.awardWrong(0, canvas); banner = { text: 'Defendeu!', age: 0 }; ctx.helper.textContent = 'O goleiro adivinhou o lado. Chute nos cantos ou nas argolas.'; keeper = { ...keeper, id: 'keeper-07', t: 900 }; kicker = { id: 'kicker-06', t: 800 }; puffs.push({ x: p.x, y: p.y, age: 0, id: 'fx-03' }); return finish(); }
    goals++; streak++;
    let bonus = 0; for (const t of targets) if (Math.hypot(p.x - t.x, p.y - t.y) < t.r + 12) { bonus = Math.max(bonus, t.mult); }
    ctx.awardSolved(10, canvas); if (bonus) for (let i = 1; i < bonus; i++) ctx.awardSolved(10, canvas);
    banner = { text: bonus ? `Gol na argola! x${bonus}` : 'Gol!', age: 0 }; kicker = { id: 'kicker-05', t: 900 };
    puffs.push({ x: p.x, y: p.y, age: 0, id: bonus ? 'fx-12' : 'fx-04' });
    ctx.helper.textContent = goals % 3 === 0 ? FACTS[(facts++) % FACTS.length] : bonus ? 'Argola dourada vale mais pontos!' : 'Bela finalização!';
    placeTargets(); finish();
  }
  function finish() { wait = 1100; }

  const game = {
    update(dt) {
      clock += dt; wait = Math.max(0, wait - dt); kicker.t = Math.max(0, kicker.t - dt); keeper.t = Math.max(0, keeper.t - dt);
      puffs.forEach(p => p.age += dt); puffs = puffs.filter(p => p.age < 700);
      if (banner && (banner.age += dt) > 1000) banner = null;
      for (const t of targets) if (t.vx) { t.x += t.vx * dt / 1000; if (t.x < 130) t.vx = Math.abs(t.vx); if (t.x > 870) t.vx = -Math.abs(t.vx); }
      if (shot && !shot.resolved) { shot.t += dt; const p = Math.min(1, shot.t / shot.dur); ball.x = shot.from.x + (shot.to.x - shot.from.x) * p; ball.y = shot.from.y + (shot.to.y - shot.from.y) * p - Math.sin(p * Math.PI) * 50; if (p >= 1) resolve(); }
      if (shot && shot.resolved && wait <= 0) { shot = null; ball = { ...BALL, flying: false }; keeper = { id: 'keeper-01', x: 500, y: 330, t: 0 }; kicker = { id: 'kicker-07', t: 0 }; }
      ctx.progress.textContent = `${goals} gols em ${shots} chutes${streak > 1 ? ` · sequência ${streak}` : ''}`;
    },
    draw(g) {
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fd6ff'); sky.addColorStop(.42, '#dff4ff'); sky.addColorStop(.42, '#5fb84a'); sky.addColorStop(1, '#3f8f35'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
      drawSprite(g, art, 'el-02', 500, 400, { w: 930 });
      const holdBall = !(ball.flying || (shot && !shot.resolved));
      drawSprite(g, art, keeper.t > 0 ? keeper.id : 'keeper-01', keeper.t > 0 ? keeper.x : 500, keeper.t > 0 ? keeper.y + 40 : 385, { h: keeper.t > 0 ? 150 : 175 });
      for (const t of targets) { g.globalAlpha = .92; if (!drawSprite(fxCtx(g), fx, t.id, t.x, t.y, { h: t.r * 2.4, center: true })) { g.strokeStyle = '#ffd23b'; g.lineWidth = 8; g.beginPath(); g.arc(t.x, t.y, t.r, 0, 7); g.stroke(); } g.globalAlpha = 1; }
      drawSprite(g, art, kicker.t > 0 ? kicker.id : 'kicker-07', 330, 725, { h: 330 });
      if (!holdBall || drag) {
        const sc = shot ? 1 - Math.min(1, shot.t / shot.dur) * .5 : 1;
        if (!holdBall) drawBall(g, ball.x, ball.y, 26 * sc);
      }
      if (drag) {
        const dx = drag.x - BALL.x, dy = drag.y - BALL.y, len = Math.hypot(dx, dy), power = Math.min(1.25, len / 380);
        g.strokeStyle = power > 1.05 ? '#ff6a5a' : power < .35 ? '#ffffff88' : '#8dffb4'; g.lineWidth = 7; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(BALL.x, BALL.y); g.lineTo(drag.x, drag.y); g.stroke(); g.setLineDash([]);
        g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(drag.x, drag.y, 14, 0, 7); g.fill();
        g.fillStyle = 'rgba(8,16,40,.6)'; g.fillRect(830, 600, 28, 90); g.fillStyle = power > 1.05 ? '#ff6a5a' : '#8dffb4'; g.fillRect(830, 690 - Math.min(1, power / 1.25) * 90, 28, Math.min(1, power / 1.25) * 90);
      }
      for (const p of puffs) { g.globalAlpha = 1 - p.age / 700; drawSprite(fxCtx(g), fx, p.id, p.x, p.y, { h: 110 + p.age / 6, center: true }); g.globalAlpha = 1; }
      if (banner) { g.globalAlpha = Math.max(0, 1 - banner.age / 1000); g.fillStyle = '#ffd23b'; g.strokeStyle = '#17234b'; g.lineWidth = 8; g.font = 'bold 58px Fredoka,sans-serif'; g.textAlign = 'center'; g.strokeText(banner.text, 500, 120 - banner.age / 14); g.fillText(banner.text, 500, 120 - banner.age / 14); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (wait > 0 || shot) return;
      if (e.type === 'down' && Math.hypot(e.x - BALL.x, e.y - BALL.y) < 110) { drag = e; return; }
      if (e.type === 'move' && drag) { drag = e; return; }
      if (e.type === 'cancel') { drag = null; return; }
      if (e.type === 'up' && drag) { const dx = e.x - BALL.x, dy = e.y - BALL.y; drag = null; kick(dx, dy); }
    },
  };
  const fxCtx = g => g;
  function drawBall(g, x, y, r) {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#222'; g.beginPath(); g.arc(x, y, r * .34, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { const an = i * 1.2566 + clock / 160; g.beginPath(); g.arc(x + Math.cos(an) * r * .78, y + Math.sin(an) * r * .78, r * .17, 0, 7); g.fill(); }
  }
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('freekick-arena');
  ctx.nextChallenge(); placeTargets();
  ctx.prompt.textContent = 'Marque gols!'; ctx.helper.textContent = 'Arraste da bola até onde quer chutar e solte. As argolas valem mais pontos. O goleiro tenta defender.';
}
