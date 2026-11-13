import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Tiro ao alvo com arco e flecha (primeira pessoa).
 * Toque e segure: a mira aparece acima do dedo e balança. Quanto mais tempo você segura (até certo ponto),
 * mais firme a mira fica. Solte para atirar. O vento empurra a flecha. Acertar o centro vale mais.
 * Sempre há um alvo PERTO (grande, fácil) e um alvo LONGE (pequeno, vale o dobro). O alvo dourado vale bônus.
 * Os alvos ficam menores e mais rápidos aos poucos.
 */
const W = 1000, H = 700, BOW = { x: 500, y: 700 };
const STD = ['target-01', 'target-02', 'target-03', 'target-04', 'target-06', 'target-07', 'target-09', 'target-10'];
const GOLD = 'target-13';
const FACTS = ['Respirar fundo e firmar o corpo melhora a pontaria.', 'Concentração e calma importam mais do que força no tiro ao alvo.', 'O vento muda a trajetória: observe antes de soltar.', 'Esportes de precisão treinam foco e controle do movimento.'];

export function setupArchery(ctx) {
  const art = loadSprites('archery', ['gear', 'target'], ctx.view);
  const bg = loadImage(spriteFile('archery', 'cenario.webp'), ctx.view);
  const rng = ctx.layoutRng;
  let canvas, targets = [], aim = null, hold = 0, wind = 0, windTarget = 0, flights = [], marks = [], hits = 0, shots = 0, streak = 0, clock = 0, facts = 0, banner = null;

  const levelScale = () => Math.max(.5, 1 - (ctx.level - 1) * .12 - hits * .012);
  const discOf = t => { const th = 210 * t.s; return { th, r: th * 0.36, cy: t.y - th * 0.62 }; };
  function spawn(far) {
    const gold = !far && hits > 0 && hits % 6 === 0 && !targets.some(t => t.gold);
    const dir = rng() < .5 ? -1 : 1;
    if (far) {
      // alvo distante: pequeno, na linha do horizonte, anda mais devagar e vale o dobro
      targets.push({ far: true, x: 230 + rng() * 540, y: 372 + rng() * 14, s: (.42 + rng() * .1) * levelScale() * 1.15, vx: dir * (22 + ctx.level * 14 + hits * 4), id: STD[Math.floor(rng() * STD.length)], gold: false, age: 0 });
      return;
    }
    const s = (gold ? .6 : .8 + rng() * .3) * levelScale() * 1.2;
    targets.push({ far: false, x: 250 + rng() * 500, y: 450 + rng() * 40, s, vx: dir * (30 + ctx.level * 25 + hits * 9 + (gold ? 80 : 0)), id: gold ? GOLD : STD[Math.floor(rng() * STD.length)], gold, age: 0 });
  }
  function newWind() { windTarget = (rng() * 2 - 1) * (0.35 + ctx.level * 0.25); }

  function shoot() {
    if (!aim) return;
    const steady = Math.min(1, hold / 900), tired = hold > 2400 ? (hold - 2400) / 1500 : 0;
    const sway = (1 - steady * .85 + tired) * 34;
    const jx = Math.sin(clock / 70) * sway * .5, jy = Math.cos(clock / 90) * sway * .5;
    flights.push({ from: { ...BOW }, to: { x: aim.x + jx + wind * 38, y: aim.y + jy }, t: 0, scored: false }); shots++;
    aim = null; hold = 0;
  }
  function land(f) {
    f.scored = true;
    marks.push({ x: f.to.x, y: f.to.y, age: 0, s: .75 });
    // escolhe o alvo atingido mais perto do centro
    let best = null;
    for (const t of targets) { const d = discOf(t), dist = Math.hypot(f.to.x - t.x, f.to.y - d.cy); if (dist <= d.r && (!best || dist / d.r < best.k)) best = { t, k: dist / d.r }; }
    if (!best) { streak = 0; ctx.awardWrong(0, canvas); banner = { text: 'Errou o alvo', age: 0 }; ctx.helper.textContent = 'Firme a mira antes de soltar e considere o vento.'; return; }
    const t = best.t, ring = Math.max(1, Math.ceil(5 * (1 - best.k)));
    hits++; streak++;
    const base = ring >= 5 ? 15 : ring >= 4 ? 10 : 5, calls = (t.far ? 2 : 1) + (t.gold ? 1 : 0);
    for (let i = 0; i < calls; i++) ctx.awardSolved(base, canvas);
    banner = { text: (t.far ? 'Longe! ' : '') + (ring >= 5 ? 'Na mosca!' : ring >= 4 ? 'Quase no centro!' : 'Acertou!'), age: 0 };
    if (hits % 3 === 0) ctx.helper.textContent = FACTS[(facts++) % FACTS.length];
    newWind(); targets = targets.filter(x => x !== t); spawn(t.far);
  }

  const game = {
    update(dt) {
      clock += dt; if (aim) hold += dt;
      wind += (windTarget - wind) * Math.min(1, dt / 600);
      if (!targets.length) { spawn(false); spawn(true); }
      for (const t of targets) { t.age += dt; t.x += t.vx * dt / 1000; if (t.x < 170) { t.x = 170; t.vx = Math.abs(t.vx); } else if (t.x > 830) { t.x = 830; t.vx = -Math.abs(t.vx); } }
      for (const f of flights) { f.t += dt; if (!f.scored && f.t >= 260) land(f); }
      flights = flights.filter(f => f.t < 460);
      marks.forEach(m => m.age += dt); marks = marks.filter(m => m.age < 1600);
      if (banner) { banner.age += dt; if (banner.age > 900) banner = null; }
      ctx.progress.textContent = `${hits} acertos em ${shots} flechas${streak > 1 ? ` · sequência ${streak}` : ''}`;
    },
    draw(g) {
      if (bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, W, H); else { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fd6ff'); sky.addColorStop(.5, '#dff4ff'); sky.addColorStop(.5, '#6bbd4f'); sky.addColorStop(1, '#3f8f35'); g.fillStyle = sky; g.fillRect(0, 0, W, H); }
      // alvos: os distantes primeiro, para os próximos ficarem na frente
      for (const t of [...targets].sort((a, b) => a.y - b.y)) {
        const th = 210 * t.s;
        if (!drawSprite(g, art, t.id, t.x, t.y, { h: th })) { g.fillStyle = '#e85d70'; g.beginPath(); g.arc(t.x, t.y - th / 2, th * .35, 0, 7); g.fill(); }
        if (t.far) { g.fillStyle = '#ffd23b'; g.strokeStyle = '#17234b'; g.lineWidth = 4; g.font = 'bold 22px Fredoka,sans-serif'; g.textAlign = 'center'; g.strokeText('x2', t.x, t.y - th - 6); g.fillText('x2', t.x, t.y - th - 6); }
      }
      for (const m of marks) { g.globalAlpha = Math.min(1, (1600 - m.age) / 400); drawSprite(g, art, 'gear-09', m.x, m.y + 18, { h: 70 * m.s, rot: -.5, center: true }); g.globalAlpha = 1; }
      for (const f of flights) { const p = Math.min(1, f.t / 260), e = 1 - (1 - p) ** 2, x = f.from.x + (f.to.x - f.from.x) * e, y = f.from.y + (f.to.y - f.from.y) * e - Math.sin(p * Math.PI) * 60, sc = 1 - p * .6; if (f.t < 260) { if (!drawSprite(g, art, 'gear-09', x, y, { h: 110 * sc, rot: Math.atan2(f.to.x - f.from.x, f.from.y - f.to.y) * .6 - .4, center: true })) { g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 50 * sc); g.stroke(); } } }
      // vento
      g.fillStyle = 'rgba(8,16,40,.72)'; g.beginPath(); g.roundRect(390, 14, 220, 66, 14); g.fill();
      g.fillStyle = '#9fdcff'; g.font = 'bold 15px Fredoka,sans-serif'; g.textAlign = 'center'; g.fillText('VENTO', 500, 34);
      g.fillStyle = '#fff'; g.font = 'bold 30px Fredoka,sans-serif';
      g.fillText(Math.abs(wind) < .12 ? 'calmo' : (wind > 0 ? '→' : '←').repeat(Math.max(1, Math.min(3, Math.round(Math.abs(wind) * 3)))), 500, 66);
      // arco: bem transparente, na parte de baixo, só como referência de onde a flecha sai (não atrapalha a mira)
      const lean = aim ? Math.max(-.25, Math.min(.25, (aim.x - 500) / 1200)) : 0, draw = aim ? Math.min(1, hold / 900) : 0;
      g.globalAlpha = .22 + draw * .1; drawSprite(g, art, 'gear-01', BOW.x, BOW.y + 6 + draw * 6, { h: 250, rot: lean }); g.globalAlpha = 1;
      // mira
      if (aim) {
        const steady = Math.min(1, hold / 900), tired = hold > 2400 ? (hold - 2400) / 1500 : 0, sway = (1 - steady * .85 + tired) * 34;
        const mx = aim.x + Math.sin(clock / 70) * sway * .5, my = aim.y + Math.cos(clock / 90) * sway * .5;
        g.strokeStyle = steady >= 1 ? '#8dffb4' : '#ffffff'; g.lineWidth = 5; g.beginPath(); g.arc(mx, my, 34 + (1 - steady) * 22, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(mx - 46, my); g.lineTo(mx + 46, my); g.moveTo(mx, my - 46); g.lineTo(mx, my + 46); g.stroke();
      }
      if (banner) { g.globalAlpha = Math.max(0, 1 - banner.age / 900); g.fillStyle = '#ffd23b'; g.font = 'bold 54px Fredoka,sans-serif'; g.fillText(banner.text, 500, 140 - banner.age / 15); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (e.type === 'down') { if (!flights.some(f => f.t < 200)) { aim = { x: e.x, y: Math.max(60, e.y - 90) }; hold = 0; } return; }
      if (e.type === 'move' && aim) { aim = { x: e.x, y: Math.max(60, e.y - 90) }; return; }
      if (e.type === 'up' && aim) { shoot(); return; }
      if (e.type === 'cancel') { aim = null; hold = 0; }
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('archery-arena'); canvas.state = () => ({ targets, aim, wind, hold, disc: discOf });
  ctx.nextChallenge(); newWind(); spawn(false); spawn(true);
  ctx.prompt.textContent = 'Acerte o centro dos alvos'; ctx.helper.textContent = 'Toque e segure para mirar. Segurar um pouco firma a mira. Solte para atirar. O alvo distante vale o dobro. O vento empurra a flecha.';
}
