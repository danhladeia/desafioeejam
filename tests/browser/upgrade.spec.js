import {test,expect} from '@playwright/test';
const shots='art-check-results/upgrade';
async function ready(page){await page.clock.install();await page.goto('/');await page.clock.runFor(2300)}
const capture={animations:'disabled',style:'#wipe{visibility:hidden!important}.intro .hero-m{animation:none!important;transform:none!important;opacity:1!important}'};

test('championship registers team names and rosters and restores them',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await page.getByRole('button',{name:'Começar campeonato',exact:true}).click();
 await page.locator('.team-row').nth(0).locator('.team-name').fill('Equipe Horizonte');await page.locator('.team-row').nth(0).locator('.team-members').fill('Ana\nBeatriz');
 await page.locator('.team-row').nth(1).locator('.team-name').fill('Equipe Futuro');await page.locator('.team-row').nth(1).locator('.team-members').fill('Carlos\nDiego');
 await page.screenshot({path:`${shots}/cadastro-equipes.png`,...capture});await page.getByRole('button',{name:'Sortear confrontos'}).click();
 await expect(page.locator('.bracket')).toBeVisible();await expect(page.locator('.team-rosters summary')).toHaveCount(2);await page.locator('.team-rosters summary').first().click();await expect(page.locator('.team-rosters')).toContainText('Ana, Beatriz');
 await page.reload();await page.clock.runFor(2300);await page.getByRole('button',{name:'Retomar campeonato',exact:true}).click();await expect(page.locator('.team-rosters')).toContainText('Equipe Horizonte');expect(errors).toEqual([]);
});

test('individual championship remains available',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Começar campeonato',exact:true}).click();await page.locator('input[value="individual"]').check();await page.locator('#names').fill('Jogador A\nJogador B');await page.getByRole('button',{name:'Sortear confrontos'}).click();await expect(page.locator('.bracket')).toBeVisible();await expect(page.locator('.team-rosters')).toHaveCount(0);
});

test('solo has one arena, active-time scoring, feedback and saved result',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await page.getByRole('button',{name:'Jogar solo'}).click();await page.locator('#solo-name').fill('Visitante');await page.locator('#solo-form').evaluate(form=>form.requestSubmit());
 await page.locator('[data-id="erro"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);await expect(page.locator('.arena')).toHaveCount(1);
 const wrong=await page.evaluate(async()=>{const{MISTAKES}=await import('/learning.js');const words=[...document.querySelectorAll('.mistake-word')].map(el=>el.textContent);const current=MISTAKES.find(item=>item.tokens.map(t=>t.text).join(' ')===words.join(' '));return current.tokens.findIndex(t=>t.wrong)});
 await page.locator('.mistake-word').nth(wrong).dispatchEvent('pointerdown',{pointerId:1,button:0});await expect(page.locator('#score-0')).toHaveText(/^10[0-2]\d$/);await expect(page.locator('.arena')).toHaveClass(/feedback-good/);await expect(page.locator('#accuracy-0')).toContainText('1 acertos');
 await page.keyboard.press('Escape');await expect(page.getByText('Duelo em pausa')).toBeVisible();const before=await page.locator('#clock').textContent();await page.clock.runFor(5000);await expect(page.locator('#clock')).toHaveText(before);await page.locator('#resume').click();await page.clock.runFor(52000);
 await expect(page.getByText('desafio concluído!')).toBeVisible();await expect(page.locator('.solo-rank li')).toHaveCount(1);await page.screenshot({path:`${shots}/resultado-solo.png`,...capture});expect(errors).toEqual([]);
});

test('raster icons flag and new puzzle sources cache offline',async({page,context})=>{
 await ready(page);await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await page.clock.runFor(2300);
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="rope"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);await expect(page.locator('#rope-marker [data-ui-icon="flag"]')).toBeVisible();
 await expect(page.locator('#rope-marker [data-ui-icon="flag"]')).toHaveCSS('background-image',/interface-36-icons-v1\.png/);
 const paths=['/assets/visual/ui/interface-36-icons-v1.png','/assets/visual/puzzle/futuro-campus-v1.png','/assets/visual/puzzle/futuro-tech-v1.png'];expect(await page.evaluate(async paths=>Promise.all(paths.map(async path=>(await fetch(path)).ok)),paths)).toEqual([true,true,true]);await page.screenshot({path:`${shots}/bandeira-corda.png`,...capture});await context.setOffline(false);
});

test('solo secret advances after fuel exhaustion and completes three words without an opponent',async({page})=>{
 await ready(page);await page.locator('[data-action="solo"]').click();await page.locator('#solo-form').evaluate(form=>form.requestSubmit());await page.locator('[data-id="secret"]').click();await expect(page.locator('.rule')).toContainText('três palavras');await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 const wordAt=round=>page.evaluate(async round=>[...(await import('/wordgames.js')).races.values()][0].words[round].word,round);
 const first=await wordAt(0),wrong=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>!first.includes(l)).slice(0,6);
 for(const letter of wrong){await page.locator(`[data-value="${letter}"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});await page.clock.runFor(350)}
 await expect(page.locator('#board-0 > .game > .helper')).toContainText('Sem combustível');await expect(page.locator('#board-0')).not.toContainText(/aguarde.*adversário/i);await page.clock.runFor(1800);
 for(let round=1;round<=3;round++){
  const word=await wordAt(round);
  for(const letter of new Set(word)){await page.locator(`[data-value="${letter}"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});await page.clock.runFor(350)}
  await page.clock.runFor(1800);
 }
 await expect(page.getByText('desafio concluído!')).toBeVisible();await expect(page.locator('.accuracy-result')).toContainText('3 acertos');await expect(page.locator('.solo-rank li')).toHaveCount(1);
});
