import { createArena } from './engine.js';
import { loadSprites, drawSprite, loadImage, spriteFile } from './sprites.js';

/**
 * Motor de ritmo: Roda de Capoeira, Pose por Pose e Rally na Rede.
 * Marcas descem em colunas e o aluno toca na coluna quando a marca chega à linha.
 * A cada 8 acertos uma curiosidade do tema aparece sem parar o jogo.
 */
const KINDS = {
  capoeira: {
    prompt: 'Toque no ritmo da roda', help: 'Toque na coluna quando a marca chegar à linha. A roda ganha vida com o combo.',
    pads: [['Berimbau', '#2f7eea'], ['Atabaque', '#ff8c2f'], ['Pandeiro', '#ffd23b'], ['Agogô', '#8c62db']], bpm: 104, bg: '#5b2e1f',
  },
  pose: {
    prompt: 'Repita as poses no compasso', help: 'Cada coluna é uma pose. Toque na pose quando ela chegar à linha.',
    pads: [['Em pé', '#2f7eea'], ['Alongar', '#e85d70'], ['Braços', '#ffd23b'], ['Estrela', '#45b87a']], bpm: 96, bg: '#2a3566',
  },
  rally: {
    prompt: 'Escolha o gesto no tempo certo', help: 'Cada coluna é um gesto. Toque no gesto da bola quando ela chegar à linha.',
    pads: [['Manchete', '#2f7eea'], ['Toque', '#ffd23b'], ['Cortada', '#e85d70']], bpm: 90, bg: '#1f6f9c',
  },
};
const FALLBACK = [{ question: 'Qual atitude ajuda no jogo limpo?', options: ['Respeitar as regras', 'Ignorar o árbitro', 'Provocar o colega'], answer: 0, explanation: 'Respeito e regras mantêm o jogo justo.' }];
const TRAVEL = 1500, LINE = 560, WINDOW = [260, 210, 170];

export function setupRhythm(ctx, kind = 'capoeira') {
  const w = 1000, h = 700, K = KINDS[kind] ?? KINDS.capoeira, cols = K.pads.length, colW = 800 / cols;
  let canvas, song = 0, beat = 0, notes = [], combo = 0, hits = 0, state = 'play', question = null, qCount = 0, glow = new Array(cols).fill(0), mark = [];
  const interval = 60000 / K.bpm;
  const ART = { rally: ['rally', ['player', 'el']], capoeira: ['capoeira', ['inst', 'dancer']], pose: ['pose', ['pose']] };
  const art = ART[kind] ? loadSprites(ART[kind][0], ART[kind][1], ctx.view) : null;
  const scene = kind === 'capoeira' || kind === 'pose' ? loadImage(spriteFile(kind, 'cenario.webp'), ctx.view) : null;
  let pose = { id: 'player-01', t: 0 };
  const POSE = ['player-02', 'player-03', 'player-05'];
  const TARGET = kind === 'rally' ? ['el-07', 'el-10', 'el-11'] : kind === 'capoeira' ? ['inst-08', 'inst-04', 'inst-05', 'inst-06'] : ['pose-01', 'pose-03', 'pose-05', 'pose-07'];
  const win = () => WINDOW[Math.min(2, ctx.level - 1)];
  const colX = i => 100 + colW * (i + 0.5);
  const rowRng = i => ctx.seededRandom(`${ctx.seed}:rhythm:${kind}:${i}`);

  let toast = null;
  function fact() {
    const bank = ctx.theme?.questions?.(ctx.level) ?? FALLBACK;
    const q = bank[Math.floor(rowRng(1000 + qCount)() * bank.length)] ?? FALLBACK[0]; qCount++;
    toast = { text: q.explanation, age: 0 }; ctx.helper.textContent = q.explanation;
  }

  const game = {
    update(dt) {
      for (let i = 0; i < cols; i++) glow[i] = Math.max(0, glow[i] - dt);
      mark = mark.filter(m => (m.age += dt) < 420); pose.t = Math.max(0, pose.t - dt);
      if (toast && (toast.age += dt) > 3200) toast = null;
      if (state !== 'play') return;
      song += dt;
      while (beat * interval <= song + 200) { const r = rowRng(beat); if (beat > 1 && (ctx.level > 1 || beat % 2 === 0) && r() < 0.88) notes.push({ col: Math.floor(r() * cols), t: beat * interval + TRAVEL, done: false }); beat++; }
      for (const n of notes) if (!n.done && song - n.t > win()) { n.done = true; combo = 0; }
      notes = notes.filter(n => song - n.t < 600);
      ctx.progress.textContent = `Combo ${combo} · ${hits} acertos`;
    },
    draw(g) {
      g.fillStyle = K.bg; g.fillRect(0, 0, w, h);
      if (scene && scene.complete && scene.naturalWidth) g.drawImage(scene, 0, 0, w, h);
      if (kind === 'capoeira' && art) { const b = Math.floor(song / interval); for (const [dx, k] of [[110, 0], [890, 4]]) drawSprite(g, art, `dancer-${String(1 + (b + k) % 12).padStart(2, '0')}`, dx, 705 - Math.abs(Math.sin(song / interval * Math.PI)) * (6 + Math.min(combo, 20)), { h: 270 + Math.min(combo, 20) * 2, flip: dx > 500 }); }
      if (kind === 'pose' && art) drawSprite(g, art, pose.t > 0 ? pose.id : 'pose-01', 500, 706, { h: 340 });
      if (kind === 'rally' && art) {
        const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#7fd3ff'); sky.addColorStop(.6, '#d9f4ff'); sky.addColorStop(.6, '#f0c87a'); sky.addColorStop(1, '#d9a652');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        drawSprite(g, art, 'el-04', 500, 300, { w: 560 });
        const idle = combo >= 10 ? 'player-09' : 'player-01', bob = Math.abs(Math.sin(song / interval * Math.PI)) * 10;
        drawSprite(g, art, pose.t > 0 ? pose.id : idle, 70, 705 - bob, { h: 300 });
      }
      g.textAlign = 'center'; g.font = 'bold 24px Fredoka,sans-serif';
      K.pads.forEach(([label, color], i) => {
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(100 + colW * i + 6, 0, colW - 12, h);
        if (!(art && drawSprite(g, art, TARGET[i], colX(i), LINE, { h: 150 + glow[i] / 8, center: true }))) {
          g.fillStyle = color; g.globalAlpha = 0.45 + glow[i] / 400; g.beginPath(); g.arc(colX(i), LINE, 62 + glow[i] / 20, 0, 7); g.fill(); g.globalAlpha = 1;
          g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(colX(i), LINE, 62, 0, 7); g.stroke();
        }
        g.fillStyle = '#fff'; g.fillText(label, colX(i), LINE + 105);
      });
      for (const n of notes) { const p = 1 - (n.t - song) / TRAVEL; if (n.done && p < 1.1) { g.globalAlpha = .25; } const y = LINE - (1 - p) * (LINE + 40); if (!(art && drawSprite(g, art, kind === 'rally' ? 'el-01' : kind === 'pose' ? TARGET[n.col] : null, colX(n.col), y, { h: kind === 'pose' ? 120 : 96, center: true }))) { g.fillStyle = K.pads[n.col][1]; g.beginPath(); g.arc(colX(n.col), y, 40, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke(); } g.globalAlpha = 1; }
      for (const m of mark) { g.globalAlpha = 1 - m.age / 420; g.fillStyle = m.good ? '#8dffb4' : '#ff6a5a'; g.fillText(m.good ? 'Boa!' : 'Fora', m.x, LINE - 90 - m.age / 8); g.globalAlpha = 1; }
      const bounce = Math.abs(Math.sin(song / interval * Math.PI)) * (14 + Math.min(combo, 20));
      if (!art) for (let i = 0; i < 4; i++) { const dx = i < 2 ? 50 + i * 30 : 950 - (i - 2) * 30; g.fillStyle = ['#ffd23b', '#ff7a2f', '#45bcef', '#e85d70'][i]; g.beginPath(); g.arc(dx, 560 - bounce * (i % 2 ? .8 : 1), 22, 0, 7); g.fill(); g.fillRect(dx - 14, 580 - bounce * (i % 2 ? .8 : 1), 28, 54); }
      if (combo >= 10) { g.fillStyle = '#ffd23b'; g.font = 'bold 34px Fredoka,sans-serif'; g.fillText(`COMBO ${combo}!`, 500, 48); }
      if (toast) { g.globalAlpha = Math.min(1, (3200 - toast.age) / 400); g.fillStyle = 'rgba(8,16,40,.82)'; g.fillRect(120, 70, 760, 56); g.fillStyle = '#fff'; g.font = 'bold 22px Fredoka,sans-serif'; g.fillText(toast.text.slice(0, 70), 500, 106); g.globalAlpha = 1; }
    },
    onPointer(e) {
      if (e.type !== 'down') return;
      const col = Math.floor((e.x - 100) / colW); if (col < 0 || col >= cols) return;
      glow[col] = 220; if (art) pose = { id: kind === 'rally' ? (POSE[col] ?? 'player-02') : TARGET[col], t: 380 };
      const near = notes.filter(n => !n.done && n.col === col && Math.abs(song - n.t) <= win()).sort((a, b) => Math.abs(song - a.t) - Math.abs(song - b.t))[0];
      if (!near) { combo = 0; mark.push({ x: colX(col), age: 0, good: false }); return; }
      near.done = true; combo++; hits++; mark.push({ x: colX(col), age: 0, good: true }); ctx.awardSolved(5, canvas);
      if (hits % 8 === 0) fact();
    },
  };
  const arena = createArena(ctx, game, { w, h }); canvas = arena.canvas; canvas.classList.add('rhythm-arena');
  ctx.nextChallenge(); ctx.prompt.textContent = K.prompt; ctx.helper.textContent = K.help;
}
