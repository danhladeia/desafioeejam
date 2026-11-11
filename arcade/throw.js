import { createArena } from './engine.js';
import { loadSprites, drawSprite } from './sprites.js';

const fallback = [{ question: 'Qual atitude ajuda a praticar esporte com segurança?', options: ['Usar proteção adequada', 'Ignorar regras', 'Correr em local proibido'], answer: 0, explanation: 'Equipamentos e regras ajudam a prevenir riscos.' }];
const COLORS = ['#2f7eea', '#ffbe32', '#e85d70', '#8c62db'];
const BOARD = ['el-09', 'el-10', 'el-11', 'el-09'];        // tabelas colorida: azul, amarela, vermelha
const KEEPER = { first: 'keeper-02', last: 'keeper-04', middle: 'keeper-06' };

/**
 * Cesta do Saber (basquete) e Chute a Gol: puxe a bola e solte, como um estilingue.
 * A colisão é testada a cada quadro durante o voo.
 */
export function setupThrow(ctx, kind = 'hoops') {
  const w = 1000, h = 700, hoops = kind === 'hoops';
  const start = hoops ? { x: 100, y: 580 } : { x: 412, y: 678 };
  const art = loadSprites(hoops ? 'hoops' : 'penalty', hoops ? ['player', 'el'] : ['kicker', 'keeper', 'el'], ctx.view);
  let canvas, question, answers = [], ball = { ...start, vx: 0, vy: 0, flying: false }, drag = null, turn = 0, shots = 5;
  let pose = { id: null, t: 0 }, keeper = { id: 'keeper-01', col: -1, t: 0 }, net = 0, resolving = false;

  const read = () => { const bank = ctx.theme?.questions?.(ctx.level) ?? fallback; return bank[Math.floor(ctx.challengeRng() * bank.length)] ?? fallback[0]; };
  function round() {
    ctx.nextChallenge(); question = read(); resolving = false;
    const n = question.options.length;
    answers = question.options.map((text, index) => hoops
      ? { text, index, x: 330 + index * (n > 3 ? 190 : 230), y: 250, w: 120, h: 90 }
      : { text, index, x: 500 + (index - (n - 1) / 2) * (n > 3 ? 225 : 290), y: 185, w: n > 3 ? 215 : 280, h: 200 });
    ctx.prompt.textContent = question.question; shots = 5; ball = { ...start, vx: 0, vy: 0, flying: false };
    // O goleiro mergulha sempre para um canto errado: acertar a resposta garante o gol.
    const wrong = answers.filter(a => a.index !== question.answer); keeper = { id: 'keeper-01', col: wrong.length ? wrong[Math.floor(ctx.challengeRng() * wrong.length)].index : -1, t: 0 };
    ctx.helper.textContent = 'Arraste da bola até a resposta correta e solte.';
  }
  function finishShot(target) {
    resolving = true; ball.flying = false; shots--;
    if (target && target.index === question.answer) { turn++; ctx.awardSolved(10, canvas); ctx.helper.textContent = 'Acertou a resposta e marcou ponto!'; net = 700; pose = { id: hoops ? 'player-06' : 'kicker-05', t: 900 }; ctx.later(round, 800); return; }
    if (target) { ctx.awardWrong(0, canvas); ctx.helper.textContent = question.explanation; pose = { id: hoops ? 'player-07' : 'kicker-06', t: 700 }; }
    if (!shots) ctx.later(round, 600); else ctx.later(() => { ball = { ...start, vx: 0, vy: 0, flying: false }; resolving = false; }, target ? 500 : 150);
  }

  const game = {
    update(dt) {
      pose.t = Math.max(0, pose.t - dt); net = Math.max(0, net - dt);
      if (ball.flying) {
        ball.vy += 820 * dt / 1000; ball.x += ball.vx * dt / 1000; ball.y += ball.vy * dt / 1000;
        for (const t of answers) {
          const hit = hoops ? Math.abs(ball.x - t.x) < 48 && Math.abs(ball.y - (t.y + 40)) < 34
            : Math.abs(ball.x - t.x) < t.w / 2 && ball.y > t.y && ball.y < t.y + t.h;
          if (hit) { finishShot(t); break; }
        }
        if (ball.flying && (ball.x > 1060 || ball.x < -60 || ball.y > 780 || ball.y < -60)) finishShot(null);
      }
      ctx.progress.textContent = `${shots} lançamentos · ${turn} acertos`;
    },
    draw(g) {
      const sky = g.createLinearGradient(0, 0, 0, h);
      if (hoops) { sky.addColorStop(0, '#bfe9ff'); sky.addColorStop(.68, '#eaf7ff'); sky.addColorStop(.68, '#d9a35a'); sky.addColorStop(1, '#b8793a'); }
      else { sky.addColorStop(0, '#8fd6ff'); sky.addColorStop(.42, '#dff4ff'); sky.addColorStop(.42, '#5fb84a'); sky.addColorStop(1, '#3f8f35'); }
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.textAlign = 'center'; g.font = 'bold 24px Fredoka,sans-serif';
      if (!hoops) drawSprite(g, art, 'el-02', 500, 400, { w: 930 });
      for (const t of answers) {
        const color = COLORS[t.index % 4];
        if (hoops) {
          if (!drawSprite(g, art, BOARD[t.index % 4], t.x, t.y + 70, { h: 160 })) { g.fillStyle = color; g.fillRect(t.x - 65, t.y - 80, 130, 90); g.strokeStyle = '#e85536'; g.lineWidth = 14; g.beginPath(); g.ellipse(t.x, t.y + 18, 48, 15, 0, 0, 7); g.stroke(); }
          drawSprite(g, art, 'el-02', t.x, t.y + 128, { w: 110, alpha: net > 0 ? 1 : .95 });
          g.fillStyle = '#17234b'; g.fillText(t.text.slice(0, 14), t.x, t.y - 44);
        } else {
          g.fillStyle = `${color}33`; g.fillRect(t.x - t.w / 2, t.y, t.w, t.h); g.strokeStyle = color; g.lineWidth = 6; g.strokeRect(t.x - t.w / 2, t.y, t.w, t.h);
          g.fillStyle = '#17234b'; g.fillText(t.text.slice(0, 14), t.x, t.y + 28);
        }
      }
      if (hoops) drawSprite(g, art, drag ? 'player-02' : pose.t > 0 ? pose.id : 'player-01', 110, 705, { h: 340 });
      else {
        const dived = ball.flying || pose.t > 0;
        const target = answers.find(a => a.index === keeper.col);
        const keeperId = dived && target ? (target === answers[0] ? KEEPER.first : target === answers[answers.length - 1] ? KEEPER.last : KEEPER.middle) : 'keeper-01';
        const kx = dived && target ? target.x : 500;
        drawSprite(g, art, keeperId, kx, dived ? 330 : 385, { h: dived ? 150 : 175 });
        const kick = ball.flying ? 'kicker-04' : drag ? 'kicker-02' : pose.t > 0 ? pose.id : 'kicker-07';
        drawSprite(g, art, kick, 330, 725, { h: 330 });
      }
      if (ball.flying) {
        if (hoops && drawSprite(g, art, 'el-05', ball.x, ball.y, { h: 56, center: true })) { /* bola de basquete */ }
        else {
          g.fillStyle = hoops ? '#ef8d2b' : '#fff'; g.beginPath(); g.arc(ball.x, ball.y, 26, 0, 7); g.fill();
          g.strokeStyle = '#222'; g.lineWidth = 3; g.stroke();
          if (!hoops) { g.fillStyle = '#222'; g.beginPath(); g.arc(ball.x, ball.y, 9, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { const an = i * 1.2566 + ball.x / 40; g.beginPath(); g.arc(ball.x + Math.cos(an) * 20, ball.y + Math.sin(an) * 20, 4.5, 0, 7); g.fill(); } }
        }
      }
      if (drag) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.setLineDash([12, 10]); g.lineWidth = 5; g.beginPath(); g.moveTo(ball.x, ball.y); g.lineTo(drag.x, drag.y); g.stroke(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(drag.x, drag.y, 12, 0, 7); g.fill(); g.setLineDash([]); }
    },
    onPointer(e) {
      if (resolving || ball.flying) return;
      if (e.type === 'down' && Math.hypot(e.x - ball.x, e.y - ball.y) < 90) { drag = e; return; }
      if (e.type === 'move' && drag) { drag = e; return; }
      if (e.type === 'cancel') { drag = null; return; }
      if (e.type === 'up' && drag) {
        const dx = e.x - ball.x, dy = e.y - ball.y; drag = null;
        if (Math.hypot(dx, dy) < 30) return;   // arrasto curto demais: não lança
        ball.vx = dx * 3.1; ball.vy = dy * 3.1; ball.flying = true; pose = { id: hoops ? 'player-04' : 'kicker-03', t: 500 };
      }
    },
  };
  const arena = createArena(ctx, game, { w, h }); canvas = arena.canvas; canvas.classList.add('throw-arena'); round();
}
