import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Vôlei por deslize (sem jogadores na tela). O adversário devolve a bola por cima da rede;
 * o aluno corta a bola com o dedo, como no Fruit Ninja, e o tipo de deslize define o golpe:
 *   rápido e reto = cortada (veloz, difícil de defender, mas arriscada)
 *   curto para cima = levantada (alta e lenta, segura)
 *   curvo = efeito (a bola faz curva e engana o adversário)
 * A direção do deslize escolhe o lado da quadra e o comprimento, a profundidade.
 * Zonas coloridas valem mais pontos. Bola na rede ou fora da quadra dá o ponto ao adversário.
 */
const W = 1000, H = 700, NET_Y = 335, COURT = { x0: 150, x1: 850, y0: 228 };
const ZONES = [
  { id: 'bola-10', x: 500, y: 256, r: 44, calls: 3 },
  { id: 'bola-09', x: 245, y: 266, r: 58, calls: 2 }, { id: 'bola-09', x: 755, y: 266, r: 58, calls: 2 },
  { id: 'bola-08', x: 335, y: 306, r: 56, calls: 2 }, { id: 'bola-08', x: 665, y: 306, r: 56, calls: 2 },
  { id: 'bola-07', x: 500, y: 306, r: 62, calls: 1 },
];
const FACTS = ['No vôlei, o saque, a manchete, o levantamento e a cortada têm funções diferentes.', 'Trocar o tempo do golpe engana a defesa: velocidade e direção importam.', 'Esporte de rede: o respeito às regras e ao adversário vale tanto quanto o ponto.'];
const KIND = { cortada: { dur: 520, arc: 30, text: 'Cortada!', fx: 'golpe-07' }, toque: { dur: 850, arc: 110, text: 'Toque!', fx: 'golpe-13' }, levantada: { dur: 1250, arc: 230, text: 'Levantada!', fx: 'golpe-09' }, efeito: { dur: 950, arc: 120, text: 'Efeito!', fx: 'golpe-11' } };

export function setupVolley(ctx) {
  const art = loadSprites('volei', ['rede', 'bola', 'golpe'], ctx.view);
  const scene = loadImage(spriteFile('volei', 'cenario.webp'), ctx.view);
  const rng = ctx.layoutRng;
  let canvas, phase = 'wait', wait = 700, ball = null, trail = [], swipe = null, hitPending = null, flight = null, hits = 0, points = 0, rally = 0, clock = 0, banner = null, netFlash = 0, fxs = [], facts = 0, misses = 0;

  const level = () => Math.max(1, Math.min(3, ctx.level));
  const travel = () => Math.max(760, 1750 - level() * 110 - rally * 45 - points * 22);

  function serve() {
    const spread = 160 + level() * 70;
    const x1 = Math.max(190, Math.min(810, 500 + (rng() * 2 - 1) * spread));
    ball = { kind: 'in', x0: 260 + rng() * 480, y0: 300, x1, y1: 590, t: 0, dur: travel(), x: 0, y: 0, s: .4 }; phase = 'in';
  }
  function say(text) { banner = { text, age: 0 }; }
  function lose(text, hint) { rally = 0; misses++; ctx.awardWrong(0, canvas); say(text); ctx.helper.textContent = hint; phase = 'wait'; wait = 1100; ball = null; flight = null; }

  function classify(pts) {
    const a = pts[0], b = pts[pts.length - 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.max(1, Math.hypot(dx, dy)), dur = Math.max(40, b.t - a.t), speed = len / dur;
    let dev = 0, sign = 0; for (const p of pts) { const d = ((p.x - a.x) * dy - (p.y - a.y) * dx) / len; if (Math.abs(d) > Math.abs(dev)) { dev = d; sign = Math.sign(d); } }
    const curv = Math.abs(dev) / len;
    let kind = 'toque';
    if (curv > .16 && len > 90) kind = 'efeito'; else if (speed > 1.35 && len > 150) kind = 'cortada'; else if (len < 190 && Math.abs(dx) < .65 * Math.abs(dy)) kind = 'levantada';
    return { kind, dx, dy, len, speed, sign };
  }
  function hit(info) {
    const { kind, dx, dy, len, speed, sign } = info;
    if (dy > -12) { netFlash = 600; return lose('Na rede!', 'Deslize para cima, por cima da bola, para passar a rede.'); }
    const depth = Math.max(.15, Math.min(1.25, len / 430 + (kind === 'cortada' ? .12 : kind === 'levantada' ? .22 : 0) + Math.max(0, speed - 1.4) * .08));
    let lx = Math.max(110, Math.min(890, ball.x + dx * 1.15)); if (kind === 'efeito') lx = Math.max(110, Math.min(890, lx + sign * 95));
    const ly = NET_Y - 12 - depth * 98;
    const cfg = KIND[kind];
    fxs.push({ id: cfg.fx, x: ball.x, y: ball.y, age: 0, s: 1 });
    flight = { kind, from: { x: ball.x, y: ball.y, s: ball.s }, to: { x: lx, y: ly }, t: 0, dur: cfg.dur, arc: cfg.arc, curve: kind === 'efeito' ? -sign * 90 : 0 };
    phase = 'out'; ball = null; say(cfg.text); hits++;
  }
  function land() {
    const p = flight.to, kind = flight.kind;
    const out = p.y < COURT.y0 || p.x < COURT.x0 - 20 || p.x > COURT.x1 + 20;
    if (out) { fxs.push({ id: 'golpe-16', x: Math.max(60, Math.min(940, p.x)), y: Math.max(200, p.y), age: 0, s: 1.4 }); return lose('Fora!', 'Chegou longe demais. Deslize um pouco mais curto.'); }
    let zone = null; for (const z of ZONES) if (Math.hypot(p.x - z.x, (p.y - z.y) * 1.6) < z.r) zone = z;
    const calls = zone ? zone.calls : 1;
    let pDef = [.78, .62, .46][level() - 1];
    pDef += kind === 'cortada' ? -.22 : kind === 'levantada' ? .08 : kind === 'efeito' ? -.12 : 0;
    pDef += zone ? (zone.calls === 3 ? -.2 : zone.calls === 2 ? -.12 : -.02) : .02; pDef -= rally * .012;
    pDef = Math.max(.08, Math.min(.9, pDef));
    if (rng() < pDef) { rally++; say('Defendeu!'); ctx.helper.textContent = 'O adversário defendeu. Tente outro tipo de golpe ou outra zona.'; fxs.push({ id: 'bola-16', x: p.x, y: p.y, age: 0, s: .8 }); phase = 'wait'; wait = 550; flight = null; return; }
    for (let i = 0; i < calls; i++) ctx.awardSolved(10, canvas);
    points++; rally++; say(calls >= 3 ? 'Ponto de ouro!' : 'Ponto!');
    fxs.push({ id: calls >= 2 ? 'bola-20' : 'bola-14', x: p.x, y: p.y - 30, age: 0, s: 1.4 });
    if (points % 3 === 0) ctx.helper.textContent = FACTS[(facts++) % FACTS.length]; else ctx.helper.textContent = zone ? 'Na zona de bônus!' : 'Bola no chão do adversário!';
    rally = 0; phase = 'wait'; wait = 1100; flight = null;
  }

  const game = {
    update(dt) {
      clock += dt; netFlash = Math.max(0, netFlash - dt); fxs.forEach(f => f.age += dt); fxs = fxs.filter(f => f.age < 700);
      if (banner && (banner.age += dt) > 900) banner = null;
      trail = trail.filter(p => clock - p.at < 180);
      if (phase === 'wait') { wait -= dt; if (wait <= 0) serve(); }
      if (phase === 'in' && ball) {
        ball.t += dt; const p = Math.min(1.2, ball.t / ball.dur);
        ball.x = ball.x0 + (ball.x1 - ball.x0) * p; ball.y = ball.y0 + (ball.y1 - ball.y0) * p - Math.sin(Math.min(1, p) * Math.PI) * 70; ball.s = .4 + .8 * Math.min(1, p) ** 1.2; ball.p = p;
        if (hitPending && clock - hitPending.at > 110) { const info = classify(hitPending.pts); hitPending = null; hit(info); }
        else if (p >= 1.08) { fxs.push({ id: 'bola-23', x: ball.x, y: 640, age: 0, s: 1.1 }); lose('Passou!', 'Deslize sobre a bola quando ela chegar perto de você.'); }
      }
      if (phase === 'out' && flight) { flight.t += dt; if (flight.t >= flight.dur) land(); }
      ctx.progress.textContent = `${points} pontos · ${hits} golpes${rally > 1 ? ` · troca ${rally}` : ''}`;
    },
    draw(g) {
      if (scene.complete && scene.naturalWidth) g.drawImage(scene, 0, 0, W, H); else { g.fillStyle = '#e9b86e'; g.fillRect(0, 0, W, H); }
      // zonas de pontos no chão da quadra adversária
      for (const z of ZONES) drawSprite(g, art, z.id, z.x, z.y, { w: z.r * 2.3, center: true, alpha: .9 });
      if (netFlash > 0) drawSprite(g, art, 'rede-03', 500, 330, { w: 880, center: true });
      // bola em voo
      const drawBall = (x, y, s, fast) => {
        const gy = (flight ? flight.from.y + (flight.to.y - flight.from.y) * Math.min(1, flight.t / flight.dur) : y) + 6;
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, flight ? gy : Math.max(y, 300) + 70 * s, 34 * s, 9 * s, 0, 0, 7); g.fill();
        const id = fast ? 'bola-02' : `bola-0${3 + Math.floor(clock / 90) % 3}`;
        if (!drawSprite(g, art, id, x, y, { h: 92 * s, center: true, rot: clock / 260 })) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 38 * s, 0, 7); g.fill(); }
      };
      if (ball) {
        // marca de acerto: anel que mostra o momento de cortar
        if (ball.p > .5 && ball.p < 1.02) { g.strokeStyle = `rgba(141,255,180,${.35 + .3 * Math.sin(clock / 90)})`; g.lineWidth = 5; g.beginPath(); g.arc(ball.x, ball.y, 70 * ball.s, 0, 7); g.stroke(); }
        drawBall(ball.x, ball.y, ball.s, false);
      }
      if (flight) {
        const p = Math.min(1, flight.t / flight.dur), e = flight.kind === 'cortada' ? p ** 1.4 : p;
        const x = flight.from.x + (flight.to.x - flight.from.x) * e + Math.sin(p * Math.PI) * flight.curve;
        const y = flight.from.y + (flight.to.y - flight.from.y) * e - Math.sin(p * Math.PI) * flight.arc;
        const sc = flight.from.s + (.42 - flight.from.s) * e;
        drawBall(x, y, sc, flight.kind === 'cortada');
        if (flight.kind === 'cortada') drawSprite(g, art, 'golpe-08', x, y + 10, { h: 130 * sc, center: true, alpha: .9 });
      }
      for (const f of fxs) { g.globalAlpha = Math.max(0, 1 - f.age / 700); drawSprite(g, art, f.id, f.x, f.y - f.age / 14, { h: 110 * f.s * (1 + f.age / 900), center: true }); g.globalAlpha = 1; }
      // rastro do dedo
      if (trail.length > 1) { g.lineCap = 'round'; for (const [w, c] of [[16, 'rgba(120,200,255,.35)'], [7, 'rgba(255,255,255,.95)']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); trail.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke(); } }
      if (banner) { g.globalAlpha = Math.max(0, 1 - banner.age / 900); g.fillStyle = '#ffd23b'; g.strokeStyle = '#17234b'; g.lineWidth = 8; g.font = 'bold 56px Fredoka,sans-serif'; g.textAlign = 'center'; g.strokeText(banner.text, 500, 130 - banner.age / 16); g.fillText(banner.text, 500, 130 - banner.age / 16); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (e.type === 'down') { swipe = [{ x: e.x, y: e.y, t: e.time ?? clock }]; trail = [{ x: e.x, y: e.y, at: clock }]; return; }
      if (!swipe) return;
      if (e.type === 'cancel') { swipe = null; return; }
      const pt = { x: e.x, y: e.y, t: e.time ?? clock }, prev = swipe[swipe.length - 1];
      swipe.push(pt); trail.push({ x: e.x, y: e.y, at: clock });
      if (phase === 'in' && ball && !hitPending && ball.p > .5 && ball.p < 1.05) {
        // o deslize atravessa a bola? (segmento contra círculo)
        const r = 62 * ball.s, dx = pt.x - prev.x, dy = pt.y - prev.y, l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((ball.x - prev.x) * dx + (ball.y - prev.y) * dy) / l2)) : 0;
        if (Math.hypot(ball.x - (prev.x + t * dx), ball.y - (prev.y + t * dy)) <= r) hitPending = { at: clock, pts: swipe };
      }
      if (e.type === 'up') { if (hitPending && phase === 'in' && ball) { const info = classify(hitPending.pts.length > 1 ? hitPending.pts : swipe); hitPending = null; hit(info); } swipe = null; }
    },
  };
  const arena = createArena(ctx, game, { w: W, h: H }); canvas = arena.canvas; canvas.classList.add('volley-arena'); canvas.volleyState = () => ({ ball, phase, flight, wait, clock, hitPending, banner });
  ctx.nextChallenge();
  ctx.prompt.textContent = 'Corte a bola com o dedo e marque pontos'; ctx.helper.textContent = 'Deslize sobre a bola quando ela chegar perto. Rápido e reto = cortada. Curto para cima = levantada. Curvo = efeito. Mire nas zonas coloridas.';
}
