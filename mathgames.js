// Balança dos Números: arraste os pesos até o prato para igualar o número da balança.
import { attachDrag } from './drag.js';
import { applySprite } from './new-art.js';

/** Número da balança e os pesos da bandeja: sempre existe uma combinação exata. */
export function balanceRound(level, rng, shuffle) {
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const parts = level === 1 ? 2 : 3;
  const [lo, hi] = level === 1 ? [8, 22] : level === 2 ? [18, 45] : [40, 90];
  const target = int(lo, hi);
  const weights = [];
  let rest = target;
  for (let i = 0; i < parts - 1; i++) {
    const left = parts - 1 - i;
    const max = rest - 2 * left;
    const part = int(2, Math.max(2, Math.min(max, Math.ceil(target / parts) + 8)));
    weights.push(part);
    rest -= part;
  }
  weights.push(rest);
  const decoys = [];
  let attempts = 0;
  while (decoys.length < 2 && attempts++ < 24) {
    const d = int(2, Math.max(4, Math.min(target - 2, Math.max(...weights) + 3)));
    if (d !== target && !decoys.includes(d)) decoys.push(d);
  }
  // Constant/adversarial RNGs still terminate with two distinct decoys.
  for (let d = 2; decoys.length < 2 && d < target; d++) if (!decoys.includes(d)) decoys.push(d);
  const tiles = shuffle([...weights, ...decoys], rng).map((value, id) => ({ id, value }));
  return { target, tiles };
}

export function setupBalance(ctx) {
  const { node, stage, prompt, progress, helper, challengeRng, shuffle, active, awardSolved, awardWrong, feedback } = ctx;
  let round; let inPan = []; let solved = 0; let busy = false;
  let beam; let pan; let tray; let sumEl;

  function render() {
    ctx.nextChallenge();
    round = balanceRound(ctx.level, challengeRng, shuffle);
    inPan = []; busy = false;
    prompt.textContent = ctx.theme ? `Planeje o circuito: complete ${round.target} minutos` : `Equilibre a balança: some ${round.target}`;
    helper.textContent = ctx.theme ? 'Cada bloco representa minutos de uma estação do circuito. Combine os tempos até chegar ao total planejado.' : 'Arraste os pesos para o prato da direita. Quando a soma for igual, a balança fica reta.';
    stage.replaceChildren();
    const scale = node('div', 'balance');
    beam = node('div', 'bal-beam');
    const left = node('div', 'bal-pan bal-left');
    left.append(applySprite(node('div', 'weight fixed', round.target),'weight-purple'));
    pan = node('div', 'bal-pan bal-right pan-drop');
    beam.append(left, pan);
    scale.append(applySprite(node('div', 'bal-post'),'balance-post'), beam);
    applySprite(left,'balance-pan');applySprite(pan,'balance-pan');
    const beamArt=applySprite(node('span','bal-beam-art'),'balance-beam');beamArt.setAttribute('aria-hidden','true');beam.prepend(beamArt);
    sumEl = node('div', 'bal-sum');
    tray = applySprite(node('div', 'bal-tray'),'balance-tray');
    stage.append(scale, sumEl, tray);
    paint();
  }

  function paint() {
    const sum = inPan.reduce((n, id) => n + round.tiles.find((t) => t.id === id).value, 0);
    pan.replaceChildren(); tray.replaceChildren();
    for (const tile of round.tiles) {
      const chip = node('div', 'weight', tile.value);
      applySprite(chip,['weight-blue','weight-orange','weight-purple','weight-green'][tile.id%4]);
      chip.dataset.tile = String(tile.id);
      if(ctx.theme){chip.setAttribute('aria-label',`${tile.value} minutos de uma estação`);chip.append(node('small','edf-minute-label','min'))}
      (inPan.includes(tile.id) ? pan : tray).append(chip);
    }
    const diff = sum - round.target;
    const angle = sum === 0 ? -14 : Math.max(-14, Math.min(14, (diff / round.target) * 30));
    beam.style.setProperty('--a', `${angle}deg`);
    sumEl.textContent = ctx.theme ? `Tempo planejado: ${sum} de ${round.target} minutos` : `Prato da direita: ${sum}`;
    progress.textContent = `${solved} balanças equilibradas`;
    return sum;
  }

  function change(mutate) {
    if (busy || !active()) return;
    mutate();
    const sum = paint();
    if (sum === round.target) {
      busy = true; solved++;
      awardSolved(15, pan);
      beam.classList.add('level');
      progress.textContent = `${solved} balanças equilibradas`;
      if (active()) feedback(true, `Equilibrou! ${round.tiles.filter((t) => inPan.includes(t.id)).map((t) => t.value).join(' + ')} = ${round.target}.`, render, 1100);
    } else if (sum > round.target) {
      awardWrong(0, pan);
      helper.textContent = 'Passou do número! Tire um peso do prato.';
    }
    else if (sum > 0) helper.textContent = 'Ainda falta peso.';
  }

  attachDrag(ctx, {
    items: '.weight:not(.fixed)',
    targets: '.pan-drop, .bal-tray',
    onTap: (chip) => change(() => {
      const id = Number(chip.dataset.tile);
      inPan = inPan.includes(id) ? inPan.filter((x) => x !== id) : [...inPan, id];
    }),
    onDrop: (chip, target) => change(() => {
      const id = Number(chip.dataset.tile);
      if (!target) return;
      const toPan = target.classList.contains('pan-drop');
      if (toPan && !inPan.includes(id)) inPan = [...inPan, id];
      else if (!toPan) inPan = inPan.filter((x) => x !== id);
    }),
  });
  render();
}
