import { test, expect } from '@playwright/test';

const TOKEN = 'profdanh';
const NAMES = Array.from({ length: 20 }, (_, i) => `M${i + 1}`).join('\n');
async function freeze(page) {
  await page.clock.install({ time: new Date('2026-11-06T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-06T00:01:00Z'));
}
async function unlock(page) {
  await page.getByRole('button', { name: 'Modo Duelo', exact: true }).click();
  await page.locator('#token').fill(TOKEN); await page.locator('#token-form').evaluate((f) => f.requestSubmit());
  await expect(page.locator('.duel-setup')).toBeVisible();
}
async function addBraga(page, names = NAMES) {
  await page.locator('[data-action="duel-names"]').click();
  await page.locator('#braga-names').fill(names); await page.locator('#braga-save').click();
}
async function singleGame(page, id = 'turbo') {
  const ids = await page.locator('.duel-game-option.on').evaluateAll((buttons) => buttons.map((b) => b.dataset.id));
  for (const other of ids) if (other !== id) await page.locator(`.duel-game-option[data-id="${other}"]`).click();
}
async function harness(page, { reduced = false, saved, braga = NAMES } = {}) {
  await page.addInitScript(({ saved, braga }) => {
    if (saved !== undefined) localStorage.setItem('eejam-duel-v1', typeof saved === 'string' ? saved : JSON.stringify(saved));
    localStorage.setItem('eejam-braga-v1', JSON.stringify(braga.split('\n')));
  }, { saved, braga });
  await page.route('**/duel-test-harness', (route) => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><link rel="stylesheet" href="/menu.css"><link rel="stylesheet" href="/duel.css"><link rel="stylesheet" href="/experience.css"></head><body><div id="app"></div><dialog id="modal"></dialog><div id="toast"></div><script type="module">
    import {createDuelUI} from '/duel-ui.js'; import {GAMES} from '/games.js';
    window.model = await import('/duel.js');
    const $ = s => document.querySelector(s), esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    window.soundCalls = 0; window.disposed = 0;
    window.harnessUI = createDuelUI({$,esc,GAMES,modal:$('#modal'),prefs:{reduced:${reduced}},
      button:(label,action,cls='secondary',extra='')=>'<button class="'+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>',
      art:id=>'/assets/visual/menu/'+id+'.webp',ask:async()=>false,
      toast:message=>$('#toast').textContent=message,sound:()=>window.soundCalls++,burst:()=>{},celebrate:()=>{},dispose:()=>window.disposed++,
      getSession:()=>window.harnessSession,
      show:(name,html,cls)=>{window.screen=name;$('#app').innerHTML='<main class="'+cls+'">'+html+'</main>'},
      startMatch:ctx=>{window.matchContext=ctx;window.harnessSession={ended:true,duel:ctx,scores:[100,0],winner:0};}
    });
    document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b && !b.disabled){if(b.dataset.action==='home'){$('#app').innerHTML='<p>Início</p>';}else window.harnessUI.action(b.dataset.action,b);}});
    window.harnessUI.open(); window.ready=true;
  </script></body></html>` }));
  await page.goto('/duel-test-harness'); await page.waitForFunction(() => window.ready);
  await page.locator('#token').fill(TOKEN); await page.locator('#token-form').evaluate((f) => f.requestSubmit());
  await expect(page.locator('.duel-setup')).toBeVisible();
}
async function finishRound(page, winner = 0) {
  await page.locator('[data-action="duel-play"]').click();
  await page.evaluate((winner) => {
    window.harnessSession.winner = winner;
    window.harnessSession.scores = winner ? [0, 100] : [100, 0];
    window.harnessUI.result(window.harnessSession);
  }, winner);
  await page.locator('[data-action="duel-confirm"]').click();
}
const readDraw = (page) => page.evaluate(() => structuredClone(window.harnessUI.state().current));

test('token protege configuração e jogos são escolhidos antes do primeiro sorteio, com persistência', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Modo Duelo', exact: true }).click();
  await page.locator('#token').fill('incorreto'); await page.locator('#token-form').evaluate((f) => f.requestSubmit());
  await expect(page.locator('#token-error')).toHaveText(/Token incorreto/);
  await page.locator('#token').fill('  PROFDANH '); await page.locator('#token-form').evaluate((f) => f.requestSubmit());
  await expect(page.locator('.class-card')).toHaveCount(3);
  await expect(page.locator('[data-action="duel-start"]')).toBeDisabled();
  await addBraga(page); await singleGame(page, 'rope');
  await page.locator('.duel-game-option.on').click();
  await expect(page.locator('#duel-games-error')).toHaveText(/ao menos um/);
  await expect(page.locator('.duel-game-option.on')).toHaveCount(1);
  await page.reload(); await unlock(page);
  await expect(page.locator('.duel-game-option.on')).toHaveAttribute('data-id', 'rope');
  await page.locator('[data-action="duel-start"]').click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eejam-duel-v1')));
  expect(stored.games).toEqual(['rope']); expect(stored.current.gameId).toBe('rope');
});

test('sorteio gira rápido, desacelera e revela VS exatamente aos 5000ms; não permite começar antes', async ({ page }) => {
  await freeze(page); await harness(page); await singleGame(page);
  await page.locator('[data-action="duel-start"]').click();
  await expect(page.locator('.reel.spin')).toHaveCount(5);
  await expect(page.locator('#dd-vs')).not.toHaveClass(/on/);
  await page.evaluate(() => window.harnessUI.action('duel-play'));
  expect(await page.evaluate(() => window.matchContext)).toBeUndefined();
  const timings = await page.locator('.reel-game .strip').evaluate((s) => {
    const a = s.getAnimations()[0]; return { duration: a.effect.getTiming().duration, frames: a.effect.getKeyframes().map((f) => ({ offset: f.offset, easing: f.easing })) };
  });
  expect(timings.duration).toBe(5000); expect(timings.frames[1].offset).toBe(.44);
  expect(timings.frames[1].easing).toContain('cubic-bezier');
  await page.clock.runFor(4999);
  await expect(page.locator('#dd-vs')).not.toHaveClass(/on/);
  await expect(page.locator('[data-action="duel-student"]').first()).toBeDisabled();
  await page.clock.runFor(1);
  await expect(page.locator('#dd-vs')).toHaveClass(/on/);
  await expect(page.locator('#dd-actions')).toHaveClass(/show/);
  await expect(page.locator('.reel.spin')).toHaveCount(0);
  await page.locator('[data-action="duel-play"]').click();
  expect(await page.evaluate(() => Object.keys(window.matchContext).sort())).toEqual(['gameId','isFinal','labels','names','total','turn']);
});

test('troca por lado preserva outro aluno, jogo e turma; recusas persistem após recarregar', async ({ page }) => {
  await freeze(page); await harness(page); await page.locator('[data-action="duel-start"]').click(); await page.clock.runFor(5000);
  const before = await readDraw(page);
  await page.locator('[data-action="duel-student"][data-side="0"]').click(); await page.clock.runFor(800);
  const after = await readDraw(page);
  expect(after.gameId).toBe(before.gameId); expect(after.sides[1]).toEqual(before.sides[1]);
  expect(after.sides[0].classId).toBe(before.sides[0].classId); expect(after.sides[0].student).not.toBe(before.sides[0].student);
  expect(after.refused[0]).toContain(before.sides[0].student);
  await page.reload(); await page.waitForFunction(() => window.ready);
  await page.locator('#token').fill(TOKEN); await page.locator('#token-form').evaluate((f) => f.requestSubmit());
  await page.locator('[data-action="duel-resume"]').click();
  expect(await readDraw(page)).toEqual(after);
  await page.locator('[data-action="duel-student"][data-side="0"]').click(); await page.clock.runFor(800);
  expect((await readDraw(page)).refused[0]).toContain(before.sides[0].student);
  expect([before.sides[0].student, after.sides[0].student]).not.toContain((await readDraw(page)).sides[0].student);
});

test('cinco rodadas incluem FINAL das duas líderes, ranking de 2s em todas e campeão pela final', async ({ page }) => {
  await freeze(page); await harness(page);
  await page.locator('[data-action="duel-turns"][data-n="5"]').click(); await page.locator('[data-action="duel-start"]').click();
  const used = new Set(); let champion;
  for (let round = 1; round <= 5; round++) {
    await page.clock.runFor(5000);
    const cur = await readDraw(page);
    expect(cur.turn).toBe(round); expect(cur.isFinal).toBe(round === 5);
    for (const s of cur.sides) { const key = s.classId + ':' + s.student; expect(used.has(key)).toBe(false); used.add(key); }
    if (round === 5) {
      const top2 = await page.evaluate(() => window.model.qualifyingStandings(window.harnessUI.state()).slice(0,2).map((t) => t.id).sort());
      expect(cur.sides.map((s) => s.classId).sort()).toEqual(top2);
      await expect(page.locator('.final-tag')).toHaveText(/FINAL/); champion = cur.sides[1].classId;
    }
    await finishRound(page, round === 5 ? 1 : 0);
    expect(await page.evaluate(() => window.matchContext.isFinal)).toBe(round === 5);
    await expect(page.getByRole('heading', { name: 'Placar do duelo' })).toBeVisible();
    await expect(page.locator('[data-action="duel-next"]')).toBeDisabled();
    await expect(page.locator('.st-card.revealed')).toHaveCount(0);
    await page.clock.runFor(1999);
    await expect(page.locator('.st-card.revealed')).toHaveCount(3);
    await expect(page.locator('[data-action="duel-next"]')).toBeDisabled();
    await page.clock.runFor(1);
    await expect(page.locator('[data-action="duel-next"]')).toBeEnabled();
    await page.locator('[data-action="duel-next"]').click();
  }
  await expect(page.getByText('é a turma campeã!')).toBeVisible();
  const d = await page.evaluate(() => window.harnessUI.state());
  expect(d.done).toBe(5); expect(d.history.filter((h) => h.isFinal)).toHaveLength(1); expect(d.championClassId).toBe(champion);
  expect(await page.evaluate(() => window.model.standings(window.harnessUI.state())[0].id)).toBe(champion);
});

test('redução de movimento revela imediatamente e saída limpa temporizadores', async ({ page }) => {
  await freeze(page); await harness(page, { reduced: true });
  await page.locator('[data-action="duel-start"]').click();
  await expect(page.locator('#dd-actions')).toHaveClass(/show/);
  await expect(page.locator('.reel.spin')).toHaveCount(0);
  await finishRound(page); await expect(page.locator('.st-card.revealed')).toHaveCount(3);
  await expect(page.locator('[data-action="duel-next"]')).toBeEnabled();
  const sound = await page.evaluate(() => window.soundCalls);
  await page.locator('[data-action="home"]').click(); await page.clock.runFor(10000);
  expect(await page.evaluate(() => window.soundCalls)).toBe(sound);
});

test('sair durante o sorteio cancela animações e sons pendentes', async ({ page }) => {
  await freeze(page); await harness(page); await page.locator('[data-action="duel-start"]').click();
  await page.evaluate(() => { document.querySelector('#app').innerHTML = '<p>Outra tela</p>'; });
  const sound = await page.evaluate(() => window.soundCalls);
  await page.clock.runFor(10000); expect(await page.evaluate(() => window.soundCalls)).toBe(sound);
  await page.evaluate(() => window.harnessUI.back());
  await finishRound(page);
  await expect(page.locator('.st-card.revealed')).toHaveCount(0);
  const rankingSound = await page.evaluate(() => window.soundCalls);
  await page.locator('[data-action="home"]').click();
  await page.clock.runFor(10000);
  expect(await page.evaluate(() => window.soundCalls)).toBe(rankingSound);
});

test('preferência de movimento do sistema também revela sem animação', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await freeze(page); await harness(page);
  await page.locator('[data-action="duel-start"]').click();
  await expect(page.locator('#dd-actions')).toHaveClass(/show/);
  await expect(page.locator('.reel.spin')).toHaveCount(0);
  await finishRound(page);
  await expect(page.locator('.st-card.revealed')).toHaveCount(3);
  await expect(page.locator('[data-action="duel-next"]')).toBeEnabled();
});

test('salvamento antigo inválido aparece como erro e é preservado', async ({ page }) => {
  const raw = '{"version":1,"turns":5,"done":3}';
  await harness(page, { saved: raw });
  await expect(page.locator('.duel-restore-error')).toHaveText(/foi preservado/);
  expect(await page.evaluate(() => localStorage.getItem('eejam-duel-v1'))).toBe(raw);
  await page.locator('[data-action="duel-start"]').click(); // ask=false no harness: não substitui.
  expect(await page.evaluate(() => localStorage.getItem('eejam-duel-v1'))).toBe(raw);
});

test('esgotamento da troca exibe erro acionável e não altera o outro lado', async ({ page }) => {
  await freeze(page); await harness(page, { braga: 'Único' });
  // Faz o primeiro sorteio incluir a turma M com seu único aluno.
  await page.evaluate(() => { Math.random = () => .99; });
  await page.locator('[data-action="duel-start"]').click(); await page.clock.runFor(5000);
  const before = await readDraw(page), index = before.sides.findIndex((s) => s.classId === 'm');
  expect(index).toBeGreaterThanOrEqual(0);
  await page.locator(`[data-action="duel-student"][data-side="${index}"]`).click();
  await expect(page.locator('#dd-error')).toHaveText(/não há alunos inéditos.*novo duelo/);
  expect(await readDraw(page)).toEqual(before);
});

for (const size of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
  test(`configuração e sorteio cabem em ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size); await page.goto('/'); await unlock(page); await addBraga(page);
    const fits = async () => {
      await page.waitForTimeout(700); // Mede o quadro estabilizado após a entrada dos controles.
      expect(await page.locator('main').evaluate((e) => ({ v: e.scrollHeight - e.clientHeight, h: e.scrollWidth - e.clientWidth }))).toEqual({ v: 0, h: 0 });
    };
    await fits(); await page.locator('[data-action="duel-start"]').click(); await expect(page.locator('#dd-actions')).toHaveClass(/show/, { timeout: 7000 });
    await fits();
  });
}

