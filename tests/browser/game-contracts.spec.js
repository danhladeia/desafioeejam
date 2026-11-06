import { test, expect } from '@playwright/test';

// An isolated engine host: no app/ranking internals, and an exact logical clock.
async function harness(page) {
  await page.goto('/games.js');
  await page.setContent('<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/play.css"><style>html{font-size:10px}body{display:flex}article{width:600px;height:760px;padding:12px}</style>');
  await page.evaluate(async () => {
    const { createGame, seededRandom } = await import('/games.js');
    const { MISTAKES, SYLLABLE_WORDS, learningBank } = await import('/learning.js');
    const { ACTIVITIES, WORD_HINTS } = await import('/content.js');
    const hints = { ...WORD_HINTS,
      CURSO: 'Percurso organizado de aprendizagem.', MIDIA: 'Meio usado para comunicar uma mensagem.', ETICA: 'Orienta escolhas responsáveis e honestas.',
      EQUIPE: 'Pessoas que colaboram por um objetivo.', SLOGAN: 'Frase curta que resume uma mensagem.',
    };
    let clock = 0, serial = 0;
    const timers = new Map();
    Object.defineProperty(performance, 'now', { configurable: true, value: () => clock });
    window.setTimeout = (fn, delay = 0) => { const id = ++serial; timers.set(id, { at: clock + delay, fn }); return id; };
    window.clearTimeout = id => timers.delete(id);
    window.advance = ms => {
      const end = clock + ms;
      for (let guard = 0; guard < 10000; guard++) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) { clock = end; return; }
        timers.delete(next[0]); clock = next[1].at; next[1].fn();
      }
      throw Error('non-terminating timers');
    };
    window.engines = []; window.awards = []; window.finishes = [];
    window.spawn = (id, side = 0, difficulty = 1, seed = 42, solo = false) => {
      const el = document.createElement('article'); el.id = `host-${side}`; document.body.append(el);
      awards[side] = []; finishes[side] = 0;
      engines[side] = createGame({ id, side, seed, difficulty, solo, el,
        onScore: (delta, metadata) => awards[side].push({ delta, ...metadata }),
        onFinish: () => finishes[side]++,
      });
    };
    window.tap = el => {
      if (!el) throw Error('missing target');
      const r = el.getBoundingClientRect(), options = { bubbles: true, cancelable: true, pointerId: 7, button: 0, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
      el.dispatchEvent(new PointerEvent('pointerdown', options));
      el.dispatchEvent(new PointerEvent('pointerup', options));
    };
    window.solve = (id, side = 0, good = true) => {
      const host = document.querySelector(`#host-${side}`), prompt = host.querySelector('.prompt').textContent;
      if (id === 'erro') {
        const words = [...host.querySelectorAll('.mistake-word')];
        const row = MISTAKES.find(m => m.tokens.map(t => t.text).join(' ') === words.map(w => w.textContent).join(' '));
        tap(words.find((_, i) => Boolean(row.tokens[i].wrong) === good));
      } else if (id === 'rope') {
        const level = engines[side].getStats().level;
        const q = learningBank(level, seededRandom(`42:rope:bank:${level}`)).find(q => q.question === prompt);
        tap(host.querySelector(`[data-action="quiz"][data-value="${good ? q.answer : (q.answer + 1) % 4}"]`));
      } else if (id === 'rota') {
        const q = ACTIVITIES.find(q => q.text === prompt);
        tap(host.querySelector(`[data-action="rota"][data-value="${good ? q.category : (q.category + 1) % 3}"]`));
      } else if (id === 'silabas') {
        const q = SYLLABLE_WORDS.find(q => q.hint === prompt);
        for (const text of q.syllables) tap([...host.querySelectorAll('.syl-tray .syl-chip')].find(el => el.textContent === text));
      } else if (id === 'balanca') {
        const target = Number(prompt.match(/\d+/)[0]);
        const tiles = [...host.querySelectorAll('.bal-tray .weight')].map(el => ({ id: el.dataset.tile, value: Number(el.textContent) }));
        let solution;
        for (let mask = 1; mask < 1 << tiles.length && !solution; mask++) {
          const subset = tiles.filter((_, i) => mask & 1 << i);
          if (subset.reduce((sum, tile) => sum + tile.value, 0) === target) solution = subset;
        }
        for (const tile of solution) tap(host.querySelector(`.bal-tray [data-tile="${tile.id}"]`));
      } else if (id === 'forca' || id === 'scramble') {
        const hint = id === 'forca' && engines[side].getStats().level === 3 ? host.querySelector('.game > .helper').textContent.replace(/^Dica: /, '') : prompt;
        const word = Object.entries(hints).find(([, text]) => text === hint)?.[0];
        if (!word) throw Error(`unknown clue: ${hint}`);
        if (id === 'forca') for (const letter of new Set(word)) {
          tap(host.querySelector(`[data-action="guess"][data-value="${letter}"]`)); advance(300);
        } else {
          for (const letter of word) {
            tap([...host.querySelectorAll('[data-action="letter"]:not(:disabled)')].find(el => el.textContent === letter)); advance(300);
          }
          tap(host.querySelector('[data-action="check"]'));
        }
      }
    };
    window.findWords = (side = 0) => {
      const host = document.querySelector(`#host-${side}`), board = host.querySelector('.search-grid');
      const size = Number(board.dataset.size), letters = [...board.children].map(el => el.textContent);
      return [...host.querySelectorAll('.word-slots .letter')].map(el => {
        const word = el.textContent;
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) for (const dr of [-1, 0, 1]) for (const dc of [-1, 0, 1]) {
          if (!dr && !dc) continue;
          const cells = [...word].map((_, i) => [r + dr * i, c + dc * i]);
          if (cells.every(([row, col], i) => row >= 0 && row < size && col >= 0 && col < size && letters[row * size + col] === word[i])) return { word, cells: cells.map(([row, col]) => row * size + col), dr, dc };
        }
        throw Error(`missing word ${word}`);
      });
    };
  });
}

test('score metadata excludes creation, pause, and wrong-answer blocking; new challenges start after feedback', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    spawn('erro'); advance(45000); engines[0].start(); advance(2000); solve('erro', 0, false);
    advance(400); engines[0].pause(); advance(30000); engines[0].resume(); advance(600);
    advance(1000); solve('erro');
    const first = { ...awards[0].at(-1) };
    advance(1300); advance(1500); solve('erro');
    return { first, wrong: awards[0][0], next: awards[0].at(-1), stats: engines[0].getStats(), text: document.querySelector('.game-score-feedback').textContent };
  });
  expect(result.wrong).toMatchObject({ correct: false, correctDelta: 0, base: 0, bonus: 0, elapsedMs: 2000, delta: 0 });
  expect(result.first).toMatchObject({ correct: true, correctDelta: 1, base: 1000, bonus: 17, elapsedMs: 3000, delta: 1017 });
  expect(result.next.elapsedMs).toBe(1500); expect(result.next.bonus).toBe(19);
  expect(result.stats).toMatchObject({ correct: 2, wrong: 1, score: 2036 });
  expect(result.text).toContain('rapidez');
});

for (const id of ['erro', 'rope', 'rota', 'silabas', 'balanca', 'forca', 'scramble']) {
  test(`${id}: advance every three completed objectives, prepare the new level after feedback, cap at three`, async ({ page }) => {
    await harness(page);
    const result = await page.evaluate(id => {
      spawn(id); engines[0].start(); const levels = [], pending = [], unchanged = [];
      for (let n = 0; n < 10; n++) {
        advance(400); const before = document.querySelector('.prompt').textContent;
        solve(id); levels.push(engines[0].getStats().level); pending.push(engines[0].getStats().nextLevel);
        unchanged.push(document.querySelector('.prompt').textContent === before);
        advance(2000);
      }
      return { levels, pending, unchanged, stats: engines[0].getStats(), awards: awards[0] };
    }, id);
    expect(result.levels).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 3]);
    expect(result.pending).toEqual([1, 1, 2, 2, 2, 3, 3, 3, 3, 3]);
    expect(result.unchanged.every(Boolean)).toBe(true);
    expect(result.stats.correct).toBe(10); expect(result.stats.level).toBe(3);
    expect(result.awards.every(a => a.correctDelta === 1 && a.base === 1000 && a.bonus >= 0 && a.bonus <= 20 && a.delta === a.base + a.bonus)).toBe(true);
  });
}

test('equivalent seeded challenges stay paired when one player answers wrong first', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    spawn('erro', 0); spawn('erro', 1); engines.forEach(e => e.start());
    const matched = [];
    for (let n = 0; n < 7; n++) {
      matched.push(document.querySelector('#host-0 .mistake-line').textContent === document.querySelector('#host-1 .mistake-line').textContent);
      advance(400); solve('erro', 0, false); advance(1000); solve('erro', 0); solve('erro', 1); advance(2000);
    }
    return { matched, stats: engines.map(e => e.getStats()), totals: awards.map(a => a.reduce((sum, x) => sum + x.correctDelta, 0)) };
  });
  expect(result.matched.every(Boolean)).toBe(true); expect(result.totals).toEqual([7, 7]);
  expect(result.stats.map(s => s.level)).toEqual([3, 3]);
});

for (const [id, delay] of [['balanca', 1100], ['silabas', 1000]]) {
  test(`${id}: a paused success animation never charges the next solve time`, async ({ page }) => {
    await harness(page);
    const result = await page.evaluate(({ id, delay }) => {
      spawn(id); engines[0].start(); advance(2000); solve(id);
      advance(250); engines[0].pause(); advance(30000); engines[0].resume();
      advance(delay - 250); advance(1700); solve(id);
      return awards[0];
    }, { id, delay });
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ elapsedMs: 2000, bonus: 18, correctDelta: 1 });
    expect(result[1]).toMatchObject({ elapsedMs: 1700, bonus: 19, correctDelta: 1 });
  });
}

test('search: diagonal, reverse endpoints, fast captured drag, pause cancellation and finite completion', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    spawn('search', 0, 3); spawn('search', 1, 3); engines.forEach(e => e.start());
    const words = findWords(), equivalent = JSON.stringify(words) === JSON.stringify(findWords(1));
    const cells = [...document.querySelectorAll('#host-0 .search-cell')];
    const first = cells[words[0].cells[0]], last = cells[words[0].cells.at(-1)];
    const event = (target, type, at = target) => { const r = at.getBoundingClientRect(); target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 8, button: 0, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 })); };
    event(first, 'pointerdown'); engines[0].pause(); advance(10000); engines[0].resume(); event(first, 'pointerup', last);
    const cancelled = awards[0].length === 0;
    words.forEach((word, index) => {
      advance(500);
      // Synthetic captured fast release: no pointermove, target stays at origin.
      if (index % 2 === 0) { const from = cells[word.cells.at(-1)], to = cells[word.cells[0]]; event(from, 'pointerdown'); event(from, 'pointerup', to); }
      else { tap(cells[word.cells.at(-1)]); tap(cells[word.cells[0]]); }
    });
    const count = awards[0].length; tap(first); tap(last); advance(5000);
    return { equivalent, cancelled, words, count, awards: awards[0], stats: engines[0].getStats(), finishes: finishes[0], state: document.querySelector('#host-0 .game').dataset.state, size: cells.length };
  });
  expect(result.size).toBe(64); expect(result.equivalent).toBe(true); expect(result.cancelled).toBe(true);
  expect(result.words.some(w => w.dr && w.dc)).toBe(true);
  expect(result.count).toBe(result.words.length); expect(result.awards).toHaveLength(result.count);
  expect(result.awards.every(a => a.correctDelta === 1)).toBe(true);
  expect(result.finishes).toBe(1); expect(result.state).toBe('finished');
});

test('memory uses raster fronts and backs, counts pairs once, and finishes without replay awards', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    spawn('memory'); engines[0].start();
    const cards = [...document.querySelectorAll('.memory-card')], names = [];
    const back = getComputedStyle(cards[0].firstChild).backgroundImage;
    let front;
    for (let i = 0; i < cards.length; i += 2) {
      advance(400); tap(cards[i]); names[i] = cards[i].getAttribute('aria-label').split(': ')[1];
      front = getComputedStyle(cards[i].firstChild).backgroundImage;
      advance(400); tap(cards[i + 1]); names[i + 1] = cards[i + 1].getAttribute('aria-label').split(': ')[1]; advance(2000);
    }
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].disabled) continue;
      const partner = names.findIndex((name, j) => j !== i && !cards[j].disabled && name === names[i]);
      advance(400); tap(cards[i]); advance(400); tap(cards[partner]); advance(2000);
    }
    const before = awards[0].length; tap(cards[0]); engines[0].pause(); engines[0].resume(); advance(10000);
    const stats = engines[0].getStats(); engines[0].destroy(); engines[0].destroy();
    return { stats, count: cards.length, awards: awards[0], before, finishes: finishes[0], front, back, remaining: document.querySelectorAll('.game').length };
  });
  expect(result.front).toContain('memory-school-items-atlas-v1.png'); expect(result.back).toContain('memory-card-back-v1.png');
  expect(result.stats.correct).toBe(result.count / 2);
  expect(result.awards.reduce((sum, a) => sum + a.correctDelta, 0)).toBe(result.count / 2);
  expect(result.awards).toHaveLength(result.before); expect(result.finishes).toBe(1); expect(result.remaining).toBe(0);
});

test('pause before start and repeated lifecycle calls never award points or advance clocks', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    spawn('erro'); engines[0].pause(); advance(8000); solve('erro');
    const ready = engines[0].getStats(); engines[0].start(); engines[0].start(); advance(1000);
    engines[0].pause(); engines[0].pause(); advance(7000); solve('erro');
    const paused = engines[0].getStats(); engines[0].resume(); engines[0].resume(); advance(1000); solve('erro');
    engines[0].destroy(); advance(20000); const destroyed = engines[0].getStats();
    return { ready, paused, destroyed, awards: awards[0] };
  });
  expect(result.ready.elapsedMs).toBe(0); expect(result.ready.correct).toBe(0);
  expect(result.paused.elapsedMs).toBe(1000); expect(result.paused.correct).toBe(0);
  expect(result.awards).toHaveLength(1); expect(result.awards[0].elapsedMs).toBe(2000);
  expect(result.destroyed.elapsedMs).toBe(2000);
});

test('solo secret: six misses advance after 1700 active ms, three solved words finish once, destroy releases race', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(async () => {
    const { races } = await import('/wordgames.js');
    spawn('secret', 0, 1, 42, true);
    const race = [...races.values()][0], host = document.querySelector('#host-0');
    const type = letters => { for (const letter of letters) { advance(300); tap(host.querySelector(`[data-action="guess"][data-value="${letter}"]`)); } };
    const wrong = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(letter => !race.words[0].word.includes(letter)).slice(0, 6);
    advance(5000); engines[0].start();
    const initial = host.querySelector('.game-progress').textContent;
    type(wrong);
    const exhausted = { helper: host.querySelector('.game > .helper').textContent, enabled: host.querySelectorAll('.alphabet button:not(:disabled)').length, awards: awards[0].map(a => ({ ...a })) };
    advance(600); engines[0].pause(); advance(30000); engines[0].resume(); advance(1099);
    const beforeAdvance = host.querySelectorAll('.alphabet button:not(:disabled)').length;
    advance(1);
    const next = { enabled: host.querySelectorAll('.alphabet button:not(:disabled)').length, hint: host.querySelector('.prompt').textContent };
    const records = [], expectedSolveTimes = [];
    for (let round = 1; round <= 3; round++) {
      const letters = new Set(race.words[round].word); expectedSolveTimes.push(letters.size * 300);
      type(letters); records.push(host.querySelector('.game-progress').textContent);
      if (round < 3) advance(1700);
    }
    advance(1299); const beforeFinish = finishes[0]; advance(1);
    const afterFinish = { count: finishes[0], state: host.querySelector('.game').dataset.state, stats: engines[0].getStats() };
    type(new Set(race.words[3].word)); advance(5000);
    const noOpponent = !/adversário|para os dois|aguarde:/i.test(host.textContent);
    const finalAwards = awards[0].map(a => ({ ...a }));
    engines[0].destroy(); engines[0].destroy(); advance(10000);
    return { initial, exhausted, beforeAdvance, next, expectedHint: race.words[1].hint, records, expectedSolveTimes, beforeFinish, afterFinish, noOpponent, finalAwards, finishes: finishes[0], racesLeft: races.size };
  });
  expect(result.initial).toBe('0 de 3 palavras'); expect(result.noOpponent).toBe(true);
  expect(result.exhausted.helper).toContain('Sem combustível'); expect(result.exhausted.helper).not.toMatch(/aguarde|adversário/i);
  expect(result.exhausted.enabled).toBe(0); expect(result.beforeAdvance).toBe(0);
  expect(result.exhausted.awards).toHaveLength(6);
  expect(result.exhausted.awards.every(a => !a.correct && a.correctDelta === 0 && a.base === 0 && a.delta === 0)).toBe(true);
  expect(result.next).toEqual({ enabled: 26, hint: result.expectedHint });
  expect(result.records).toEqual(['1 de 3 palavras', '2 de 3 palavras', '3 de 3 palavras']);
  expect(result.finalAwards.filter(a => a.correct).map(a => a.elapsedMs)).toEqual(result.expectedSolveTimes);
  expect(result.finalAwards.filter(a => a.correct).every(a => a.correctDelta === 1 && a.base === 1000 && a.delta === 1000 && a.bonus === 0)).toBe(true);
  expect(result.finalAwards).toHaveLength(9); expect(result.beforeFinish).toBe(0);
  expect(result.afterFinish).toMatchObject({ count: 1, state: 'finished', stats: { correct: 3, wrong: 6, score: 3000 } });
  expect(result.finishes).toBe(1); expect(result.racesLeft).toBe(0);
});

test('secret: solo races stay isolated while two-player exhaustion, shared rounds and first-to-three remain unchanged', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(async () => {
    const { races } = await import('/wordgames.js');
    spawn('secret', 0, 1, 42, true); const soloRace = [...races.values()][0];
    spawn('secret', 1); spawn('secret', 2); const duelRace = [...races.values()].find(race => race !== soloRace);
    spawn('secret', 3, 1, 42, true);
    const isolated = races.size === 3 && duelRace.refs === 2;
    const sameWords = JSON.stringify(soloRace.words) === JSON.stringify(duelRace.words);
    engines.forEach(engine => engine.start());
    const host = side => document.querySelector(`#host-${side}`);
    const type = (side, letters) => { for (const letter of letters) { advance(300); tap(host(side).querySelector(`[data-action="guess"][data-value="${letter}"]`)); } };
    type(0, new Set(soloRace.words[0].word));
    const noCrossWin = duelRace.wins.every(wins => wins === 0) && awards[1].length === 0 && awards[2].length === 0;
    const wrong = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(letter => !duelRace.words[0].word.includes(letter)).slice(0, 6);
    type(2, wrong);
    const waiting = host(2).querySelector('.game > .helper').textContent;
    advance(2000);
    const stillWaiting = host(2).querySelectorAll('.alphabet button:not(:disabled)').length === 0 && host(1).querySelector('.prompt').textContent === duelRace.words[0].hint;
    type(1, wrong);
    const bothFailed = [1, 2].every(side => host(side).querySelector('.game > .helper').textContent.includes('Ninguém acertou'));
    advance(1700);
    const nextShared = [1, 2].every(side => host(side).querySelector('.prompt').textContent === duelRace.words[1].hint);
    const records = []; let otherLost;
    for (let round = 1; round <= 3; round++) {
      type(1, new Set(duelRace.words[round].word));
      records.push(host(1).querySelector('.game-progress').textContent);
      if (round === 1) otherLost = host(2).querySelector('.game > .helper').textContent;
      if (round < 3) advance(1700);
    }
    advance(1300);
    const counts = awards.map(list => list.reduce((sum, a) => sum + a.correctDelta, 0));
    const finishCounts = [...finishes]; const soloUnaffected = soloRace.wins[0] === 1 && soloRace.wins[1] === 0;
    engines[1].destroy(); const sharedRetained = [...races.values()].includes(duelRace) && duelRace.refs === 1;
    engines.forEach(engine => engine.destroy()); advance(10000);
    return { isolated, sameWords, noCrossWin, waiting, stillWaiting, bothFailed, nextShared, records, otherLost, counts, finishCounts, soloUnaffected, sharedRetained, racesLeft: races.size };
  });
  expect(result.isolated).toBe(true); expect(result.sameWords).toBe(true); expect(result.noCrossWin).toBe(true);
  expect(result.waiting).toContain('Aguarde'); expect(result.stillWaiting).toBe(true);
  expect(result.bothFailed).toBe(true); expect(result.nextShared).toBe(true);
  expect(result.records).toEqual([1, 2, 3].map(n => `Você ${n} × 0 Adversário · vence quem chegar a 3`));
  expect(result.otherLost).toContain('adversário acertou primeiro');
  expect(result.counts).toEqual([1, 3, 0, 0]); expect(result.finishCounts).toEqual([0, 1, 0, 0]);
  expect(result.soloUnaffected).toBe(true); expect(result.sharedRetained).toBe(true); expect(result.racesLeft).toBe(0);
});
