import { createArena } from './engine.js';
import { buildSliceRound } from './content.js';

const distanceToSegment = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); };
export function setupSlice(ctx) {
  const w = 1000, h = 700;
  let canvas;
  let round, items = [], trail = [], bursts = [], lives = 3, hits = 0, previous = null, elapsed = 0;
  const images = new Map(), keyed = new Map();
  function image(file) {
    if (!images.has(file)) {
      const value = new (ctx.view.Image ?? Image)();
      value.onload = () => {
        const clean = ctx.doc.createElement('canvas'); clean.width = value.naturalWidth; clean.height = value.naturalHeight;
        const cleanG = clean.getContext('2d', { willReadFrequently: true }); cleanG.drawImage(value, 0, 0);
        const pixels = cleanG.getImageData(0, 0, clean.width, clean.height);
        // The supplied sheets use #00FF00 as chroma key. Keep shaded greens in
        // the illustration, remove only the very bright saturated background.
        for (let i = 0; i < pixels.data.length; i += 4) {
          const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
          if (g > 205 && r < 75 && b < 105 && g > r * 2.4 && g > b * 2.1) pixels.data[i + 3] = 0;
        }
        cleanG.putImageData(pixels, 0, 0); keyed.set(file, clean);
      };
      value.src = file; images.set(file, value);
    }
    return keyed.get(file);
  }
  function newRound() { round = buildSliceRound(ctx.challengeRng, ctx.level, ctx.theme); ctx.prompt.textContent = round.request; ctx.helper.textContent = 'Arraste o dedo sobre os itens certos. Bombas tiram duas vidas.'; }
  function spawn() { const item = round.items[Math.floor(ctx.challengeRng() * round.items.length)]; items.push({ ...item, x: 130 + ctx.layoutRng() * 740, y: 745, vx: -45 + ctx.layoutRng() * 90, vy: -(680 + ctx.level * 95 + ctx.layoutRng() * 150), r: 42, rot: 0, spin: -3 + ctx.layoutRng() * 6, cut: false }); }
  function score(item) { item.cut = true; bursts.push({ x:item.x, y:item.y, age:0, bad:!item.good }); if (item.good) { hits++; ctx.awardSolved(10, canvas); if (hits % 5 === 0) { ctx.nextChallenge(); newRound(); } } else { lives = Math.max(0, lives - (item.bomb ? 2 : 1)); ctx.awardWrong(0, canvas); ctx.helper.textContent = item.bomb ? 'Bomba! Ela é uma armadilha: não corte.' : `Isso não faz bem para a saúde. ${round.explanation}`; if (!lives) ctx.finish(); } }
  const game = {
    update(dt) { elapsed += dt; if (elapsed > Math.max(430, 1120 - ctx.level * 190)) { elapsed = 0; if (items.filter(item => !item.cut).length < 6) spawn(); } for (const item of items) { item.vy += 1200 * dt / 1000; item.x += item.vx * dt / 1000; item.y += item.vy * dt / 1000; item.rot += item.spin * dt / 1000; } items = items.filter(item => !item.cut && item.y < h + 100); bursts.forEach(burst=>burst.age+=dt);bursts=bursts.filter(burst=>burst.age<420); if (trail.length) trail = trail.filter(point => performance.now() - point.at < 170); ctx.progress.textContent = `❤ ${lives} vidas · ${hits} escolhas saudáveis`; },
    draw(g) { g.fillStyle = '#14285a'; g.fillRect(0, 0, w, h); g.fillStyle = '#214a87'; g.fillRect(0, h - 80, w, 80); for (const item of items) { const sprite=image(item.atlas), cols=6, rows=item.atlas.includes('safety')?3:4, cellW=1536/cols, cellH=1024/rows; g.save(); g.translate(item.x,item.y);g.rotate(item.rot); if(sprite)g.drawImage(sprite,item.frame%cols*cellW,Math.floor(item.frame/cols)*cellH,cellW,cellH,-58,-58,116,116);else{g.fillStyle=item.good?'#45bcef':'#e95466';g.beginPath();g.arc(0,0,item.r,0,Math.PI*2);g.fill()} g.restore(); } for(const burst of bursts){const t=burst.age/420,r=20+t*95;g.save();g.globalAlpha=1-t;g.strokeStyle=burst.bad?'#ff553d':'#8dffb4';g.lineWidth=10*(1-t);g.beginPath();g.arc(burst.x,burst.y,r,0,Math.PI*2);g.stroke();if(burst.bad){g.strokeStyle='#ffd23b';for(let i=0;i<10;i++){const a=i*Math.PI/5;g.beginPath();g.moveTo(burst.x+Math.cos(a)*r*.5,burst.y+Math.sin(a)*r*.5);g.lineTo(burst.x+Math.cos(a)*(r+28),burst.y+Math.sin(a)*(r+28));g.stroke()}}g.restore()} g.strokeStyle = '#d9fbff'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); trail.forEach((point, index) => index ? g.lineTo(point.x, point.y) : g.moveTo(point.x, point.y)); g.stroke(); },
    onPointer(event) { if (event.type === 'down') { previous = event; trail = [ { ...event, at: performance.now() } ]; return; } if (event.type === 'move' && previous) { const a = previous, b = event; trail.push({ ...event, at: performance.now() }); for (const item of items) if (!item.cut && distanceToSegment(item.x, item.y, a.x, a.y, b.x, b.y) <= item.r + 13) score(item); previous = event; } if (event.type === 'up' || event.type === 'cancel') previous = null; },
  };
  const activeArena = createArena(ctx, game, { w, h }); canvas = activeArena.canvas; canvas.classList.add('slice-arena');
  newRound(); ctx.nextChallenge();
}
