// Jogos de palavras: Palavra Secreta em disputa, Sílabas Soltas e Caça-Erro.
import { attachDrag } from './drag.js';
import { SYLLABLE_WORDS, MISTAKES } from './learning.js';
import { applySprite, spriteNode, syllableClue } from './new-art.js';
import { appendUiIcon } from './ui-art.js';
import { edfWordArt } from './edf-theme.js';

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const RIGHT_SIDE = /^(1|right|direita|orange|laranja)$/i;
const isRight = (side) => side === 1 || RIGHT_SIDE.test(String(side));

/* ---------------------------------------------------------------- Palavra Secreta */

// Os dois lados jogam as mesmas palavras e disputam cada uma. O estado da disputa é
// compartilhado por semente: quem acerta primeiro leva o ponto, e vence quem chegar a 3 de 5.
export const races = new Map(); // exportado só para os testes
export const RACE_TARGET = 3;

export function raceWords(ctx, count = 9) {
  const { level, seed, wordBank, shuffle, seededRandom } = ctx;
  const bank = wordBank();
  const fits = bank.filter(({ word }) => (level === 1 ? word.length <= 5 : level === 3 ? word.length >= 6 && word.length <= 9 : word.length >= 4 && word.length <= 7));
  return shuffle(ctx.theme ? fits.length ? fits : bank : fits.length >= count ? fits : bank, seededRandom(`${seed}:secret-race:${level}`)).slice(0, count);
}

export function setupSecretRace(ctx) {
  const { node, button, stage, prompt, progress, helper, level, seed, side, solo = false, active, later, awardSolved, awardWrong, finish } = ctx;
  const me = isRight(side) ? 1 : 0;
  const other = 1 - me;
  // Solo instances never share outcomes, even with the same seed and side.
  // Competitive instances retain the shared seed/level key for both players.
  const key = solo ? Symbol(`${seed}:${level}:solo`) : `${seed}:${level}${ctx.theme?':edf:'+ctx.theme.key:''}`;
  let race = races.get(key);
  if (!race) { race = { words: raceWords(ctx), wins: [0, 0], outcomes: [], closeFns: [null, null], refs: 0 }; races.set(key, race); }
  race.refs++;
  const outcome = (k) => (race.outcomes[k] ??= { winner: null, done: [false, false] });
  const wordAt = (k) => race.words[k % race.words.length];

  let round = 0;
  let mistakes = 0;
  let closed = false;
  let waiting = false;
  const guessed = new Set();
  let slots; let fuel; let fuelLabel; let keyboard;

  const record = () => solo ? `${race.wins[me]} de ${RACE_TARGET} palavras`
    : `Você ${race.wins[me]} × ${race.wins[other]} Adversário · vence quem chegar a ${RACE_TARGET}`;
  function paint() {
    const { word } = wordAt(round);
    slots.replaceChildren();
    for (const letter of word) slots.append(node('span', 'letter', guessed.has(letter) || closed ? letter : '＿'));
    fuel.firstChild.style.width = `${(6 - mistakes) / 6 * 100}%`;
    fuelLabel.textContent = `Combustível: ${6 - mistakes}/6`;
    appendUiIcon(fuelLabel, 'rocket');
    progress.textContent = record();
  }

  function render() {
    ctx.unblockChallenge(); ctx.nextChallenge();
    const entry = wordAt(round);
    mistakes = 0; closed = false; waiting = false; guessed.clear();
    prompt.textContent = level === 3 ? `Descubra a palavra · ${entry.word.length} letras` : entry.hint;
    helper.textContent = solo ? `Modo solo: descubra ${RACE_TARGET} palavras. Palavra ${round + 1}.${level === 3 ? ` Dica: ${entry.hint}` : ''}`
      : level === 3 ? `Dica: ${entry.hint}` : `Mesma palavra para os dois: quem acertar primeiro leva o ponto. Palavra ${round + 1}.`;
    stage.replaceChildren();
    fuel = node('div', 'fuel');
    const bar = node('div', 'fuel-fill');
    Object.assign(bar.style, { height: '100%', background: 'linear-gradient(90deg, #ffb058, #74dba3)' });
    fuel.append(bar);
    fuelLabel = node('div', 'helper');
    slots = node('div', 'word-slots');
    keyboard = node('div', 'alphabet');
    for (const letter of ALPHABET) keyboard.append(button(letter, 'guess', letter, 'letter'));
    stage.append(fuelLabel, fuel, slots, keyboard);
    paint();
    const o = outcome(round);
    if (o.winner !== null || (solo ? o.done[me] : o.done[0] && o.done[1])) closeRound(round);
  }

  function closeRound(k) {
    if (closed || k !== round || !active()) return;
    closed = true;
    ctx.blockChallenge();
    keyboard.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const o = outcome(k);
    const { word } = wordAt(k);
    helper.textContent = solo ? o.winner === me ? `Palavra descoberta! A palavra é ${word}.` : `Sem combustível. A palavra era ${word}. Vamos à próxima!`
      : o.winner === me ? `Você levou o ponto! A palavra é ${word}.`
      : o.winner === other ? `O adversário acertou primeiro: ${word}.` : `Ninguém acertou. A palavra era ${word}.`;
    paint();
    if (race.wins[me] >= RACE_TARGET) later(() => finish(), 1300);
    else if (solo || race.wins[other] < RACE_TARGET) later(() => { round++; render(); }, 1700);
  }
  race.closeFns[me] = closeRound;
  ctx.onDestroy(() => {
    if (race.closeFns[me] === closeRound) race.closeFns[me] = null;
    if (--race.refs <= 0) races.delete(key);
  });

  ctx.setAct((action, value, target) => {
    if (action !== 'guess' || closed || waiting || guessed.has(value)) return;
    const { word } = wordAt(round);
    guessed.add(value);
    target.disabled = true;
    target.classList.add('chosen');
    const good = word.includes(value);
    if (!good) { mistakes++; target.classList.add('wrong'); }
    paint();
    const o = outcome(round);
    if ([...word].every((letter) => guessed.has(letter))) {
      o.done[me] = true;
      if (o.winner === null) { o.winner = me; race.wins[me]++; awardSolved(10, target); }
      closeRound(round);
      if (!solo) race.closeFns[other]?.(round);
    } else if (mistakes >= 6) {
      awardWrong(0, target);
      o.done[me] = true;
      if (solo || o.winner !== null || o.done[other]) { closeRound(round); if (!solo) race.closeFns[other]?.(round); }
      else {
        waiting = true;
        ctx.blockChallenge();
        keyboard.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        helper.textContent = 'Sem combustível! Aguarde: o adversário ainda tenta.';
      }
    } else if (!good) { helper.textContent = 'Essa letra não aparece. Observe as letras reveladas.'; awardWrong(0, target); }
    else helper.textContent = 'Essa letra faz parte da palavra!';
  });
  render();
}

/* ---------------------------------------------------------------- Sílabas Soltas */

export function syllablePool(level) {
  const by = (w) => w.syllables.length;
  const pool = SYLLABLE_WORDS.filter((w) => (level === 1 ? by(w) === 2 : level === 3 ? by(w) >= 4 : by(w) === 3));
  return pool.length ? pool : SYLLABLE_WORDS;
}

export function setupSyllables(ctx) {
  const { node, stage, prompt, progress, helper, challengeRng, shuffle, active, awardSolved, awardWrong, feedback } = ctx;
  const deckOf = () => shuffle(ctx.theme ? ctx.theme.syllables.filter(w=>ctx.level===1?w.syllables.length===2:ctx.level===2?w.syllables.length===3:w.syllables.length>=4) : syllablePool(ctx.level), challengeRng);
  let deck = [], deckLevel;
  let cursor = 0;
  let current; let tiles; let slotsOf; let solved = 0; let busy = false;
  let slotsEl; let trayEl;

  function render() {
    ctx.nextChallenge();
    if (deckLevel !== ctx.level || cursor >= deck.length) { deck = deckOf(); deckLevel = ctx.level; cursor = 0; }
    current = deck[cursor++];
    const syllables = current.syllables.map((text, id) => ({ id, text }));
    if (ctx.level === 3) {
      // Uma sílaba a mais, de outra palavra, para exigir atenção.
      const stray = shuffle((ctx.theme?ctx.theme.syllables:SYLLABLE_WORDS).filter((w) => w.word !== current.word).flatMap((w) => w.syllables), challengeRng).find((s) => !current.syllables.includes(s));
      if (stray) syllables.push({ id: syllables.length, text: stray });
    }
    let mixed = shuffle(syllables, challengeRng);
    if (mixed.map((s) => s.text).join('') === current.word && mixed.length > 1) mixed = [...mixed.slice(1), mixed[0]];
    tiles = mixed;
    slotsOf = Array(current.syllables.length).fill(null);
    busy = false;
    prompt.textContent = current.hint;
    if(ctx.theme){const image=node('span','edf-syllable-clue'),art=edfWordArt(current);image.setAttribute('role','img');image.setAttribute('aria-label','Ilustração do conteúdo de Educação Física');Object.assign(image.style,{display:'inline-block',backgroundImage:`url("${art.image}")`,backgroundSize:art.size,backgroundPosition:art.position,backgroundRepeat:'no-repeat'});prompt.prepend(image)}else prompt.prepend(spriteNode(prompt.ownerDocument,syllableClue(current.word)));
    helper.textContent = 'Arraste as sílabas para os espaços, na ordem certa. Ou toque para encaixar.';
    stage.replaceChildren();
    slotsEl = node('div', 'syl-slots');
    trayEl = node('div', 'syl-tray');
    stage.append(slotsEl, trayEl);
    paint();
  }

  function paint() {
    slotsEl.replaceChildren(); trayEl.replaceChildren();
    slotsOf.forEach((tileId, i) => {
      const slot = applySprite(node('div', 'syl-slot'),'syllable-slot');
      slot.dataset.slot = String(i);
      if (tileId !== null) {
        const tile = tiles.find((t) => t.id === tileId);
        const chip = node('div', 'syl-chip placed', tile.text);
        applySprite(chip,'syllable-green');
        chip.dataset.tile = String(tile.id);
        slot.append(chip);
      }
      slotsEl.append(slot);
    });
    for (const tile of tiles) {
      if (slotsOf.includes(tile.id)) continue;
      const chip = node('div', 'syl-chip', tile.text);
      applySprite(chip,['syllable-blue','syllable-orange','syllable-purple'][tile.id%3]);
      chip.dataset.tile = String(tile.id);
      trayEl.append(chip);
    }
    progress.textContent = `${solved} palavras montadas`;
  }

  function check() {
    if (slotsOf.some((id) => id === null)) return;
    const built = slotsOf.map((id) => tiles.find((t) => t.id === id).text).join('');
    busy = true;
    if (built === current.syllables.join('')) {
      solved++;
      slotsEl.classList.add('ok');
      awardSolved(20, slotsEl);
      if (active()) feedback(true, `Isso! ${current.word}.`, render, 1000);
    } else {
      slotsEl.classList.add('bad');
      awardWrong(0, slotsEl);
      if (active()) feedback(false, 'Ainda não forma a palavra. Vamos tentar de novo.', () => { slotsOf.fill(null); slotsEl.classList.remove('bad'); busy = false; paint(); }, 1000);
    }
  }

  function put(tileId, slotIndex) {
    if (busy) return;
    const from = slotsOf.indexOf(tileId);
    if (from >= 0) slotsOf[from] = null;
    slotsOf[slotIndex] = tileId; // quem estava no espaço volta para a bandeja
    paint(); check();
  }

  attachDrag(ctx, {
    items: '.syl-chip',
    targets: '.syl-slot, .syl-tray',
    onTap: (chip) => {
      if (busy) return;
      const id = Number(chip.dataset.tile);
      const inSlot = slotsOf.indexOf(id);
      if (inSlot >= 0) { slotsOf[inSlot] = null; paint(); return; }
      const free = slotsOf.indexOf(null);
      if (free >= 0) put(id, free);
    },
    onDrop: (chip, target) => {
      if (busy || !active()) return;
      const id = Number(chip.dataset.tile);
      if (!target) return;
      if (target.classList.contains('syl-tray')) { const at = slotsOf.indexOf(id); if (at >= 0) { slotsOf[at] = null; paint(); } return; }
      put(id, Number(target.dataset.slot));
    },
  });
  render();
}

/* ---------------------------------------------------------------- Caça-Erro */

export function setupMistake(ctx) {
  const { node, button, stage, prompt, progress, helper, challengeRng, shuffle, awardSolved, awardWrong, feedback, active } = ctx;
  let deck = []; let deckLevel; let cursor = 0; let current; let found = 0; let tried = 0;
  const next = () => {
    if (deckLevel !== ctx.level || cursor >= deck.length) {
      deck = shuffle((ctx.theme?ctx.theme.mistakes:MISTAKES).filter(m => m.level === ctx.level), challengeRng); deckLevel = ctx.level; cursor = 0;
    }
    return deck[cursor++];
  };

  function render() {
    ctx.nextChallenge();
    current = next();
    prompt.textContent = 'Toque na palavra escrita errada';
    prompt.prepend(spriteNode(prompt.ownerDocument,'mistake-loupe'));
    progress.textContent = `${found} erros encontrados · ${tried} frases`;
    helper.textContent = 'Só uma palavra da frase está errada. Leia com calma.';
    stage.replaceChildren();
    const line = node('div', 'mistake-line');
    current.tokens.forEach((token, index) => line.append(applySprite(button(token.text, 'pick', index, 'mistake-word'),'word-normal')));
    stage.append(line);
  }

  ctx.setAct((action, value, target) => {
    if (action !== 'pick') return;
    const token = current.tokens[Number(value)];
    if (token.wrong) {
      found++; tried++;
      target.classList.add('correct');
      applySprite(target,'word-correct');
      awardSolved(10, target);
      if (active()) feedback(true, `Isso! O certo é “${current.right}”.`, render, 1300);
    } else {
      target.classList.add('wrong');
      applySprite(target,'word-wrong');
      target.disabled = true;
      awardWrong(0, target);
      if (active()) feedback(false, 'Essa palavra está certa. Procure outra.', null, 1000);
    }
  });
  render();
}
