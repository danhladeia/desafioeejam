import {test,expect} from '@playwright/test';
async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}
async function competition(page,{count=3,rounds=5,students=10}={}){
 await home(page);await page.locator('[data-action="edf"]').click();await page.locator('[data-action="edf-tournament"]').click();
 for(let i=2;i<count;i++)await page.locator('#edf-add-team').click();
 for(let i=0;i<count;i++){await page.locator('.edf-team-name').nth(i).fill('Equipe '+['Sol','Lua','Terra','Mar','Ar','Luz','Vida','Paz'][i]);await page.locator('.edf-team-students').nth(i).fill(Array.from({length:students},(_,j)=>'Aluno '+i+'-'+j).join('\n'))}
 await page.locator('#edf-rounds').fill(String(rounds));for(const id of ['ginastica','aventura','tabuleiro'])await page.locator(`[name="edf-comp-topic"][value="${id}"]`).uncheck();
 for(const el of await page.locator('[name="edf-comp-game"]').all())await el.setChecked((await el.getAttribute('value'))==='rope');
 await page.locator('#edf-competition-form').evaluate(form=>form.requestSubmit());await expect(page.locator('.edf-ranking li')).toHaveCount(count);
}
const state=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('eejam-edf-competition-v1')));
async function win(page){
 await page.locator('[data-action="edf-match-start"]').click();await page.clock.runFor(2800);
 const question=await page.locator('#board-0 .prompt').textContent(),answer=await page.evaluate(async q=>(await import('/edf-content.js')).EDF_CARDS.find(c=>c.q===q).answer,question);
 await page.locator(`#board-0 [data-value="${answer}"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});await page.clock.runFor(61000);await page.locator('#edf-confirm-result').click();await expect(page.locator('#edf-ranking-next')).toBeDisabled();await page.clock.runFor(2200);await page.locator('#edf-ranking-next').click();
}

test('EDF custom teams: five-second draw, individual redraw, saved rounds, balanced final and no repeated students',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await competition(page);const seen=new Set();
 for(let round=0;round<5;round++){
  await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(4999);await expect(page.locator('[data-action="edf-match-start"]')).toHaveCount(0);await page.clock.runFor(1);await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
  if(round===0){const before=await state(page);await page.locator('[data-action="edf-match-redraw"]').first().click();await page.clock.runFor(5000);const after=await state(page);expect(after.current.sides[0].student).not.toBe(before.current.sides[0].student);expect(after.current.sides[1]).toEqual(before.current.sides[1]);expect(after.current.gameId).toBe(before.current.gameId);await page.screenshot({path:'art-check-results/edf-expanded/sorteio-equipes.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'})}
  const pending=await state(page);for(const side of pending.current.sides){const id=side.teamId+':'+side.student;expect(seen.has(id)).toBe(false);seen.add(id)}
  if(round===4){expect(pending.current.isFinal).toBe(true);const top=await page.evaluate(async s=>(await import('/edf-duel.js')).edfStandings(s).slice(0,2).map(t=>t.id).sort(),pending);expect(pending.current.sides.map(s=>s.teamId).sort()).toEqual(top)}
  await win(page);
  if(round===1){await page.reload();await page.clock.runFor(2300);await page.locator('[data-action="edf"]').click();await page.locator('[data-action="edf-tournament"]').click();expect((await state(page)).done).toBe(2)}
 }
 const saved=await state(page);expect(saved.done).toBe(5);await expect(page.getByText('equipe campeã!')).toBeVisible();expect(saved.champion).toBeTruthy();expect(await page.evaluate(()=>localStorage.getItem('eejam-duel-v1'))).toBeNull();expect(errors).toEqual([]);
});

test('EDF exhausted rosters stop, allow adding students, and resume without recycling played names',async({page})=>{
 await competition(page,{count:2,rounds:2,students:1});await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);await win(page);await page.locator('[data-action="edf-match-draw"]').click();await expect(page.locator('#toast')).toContainText('não há alunos inéditos');expect((await state(page)).current).toBeNull();
 for(const index of [0,1]){await page.locator('[data-action="edf-match-add"]').click();await page.locator('#edf-add-team-id').selectOption('edf-team-'+index);await page.locator('#edf-add-students').fill('Novo '+index);await page.locator('#edf-add-save').click()}
 await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);expect((await state(page)).current.sides.every(s=>s.student.startsWith('Novo'))).toBe(true);
});

test('leaving EDF roulette cancels its timers and restores the same pending draw',async({page})=>{
 await competition(page);await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(1500);const pending=(await state(page)).current;await page.locator('[data-action="home"]').first().click();await page.clock.runFor(10000);await expect(page.locator('.menu-buttons')).toBeVisible();await page.locator('[data-action="edf"]').click();await page.locator('[data-action="edf-tournament"]').click();await page.locator('[data-action="edf-match-draw"]').click();expect((await state(page)).current).toEqual(pending);await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
});

test('all thirteen EDF games start at both levels in solo and duel with themed content and fit tablet',async({page})=>{
 test.setTimeout(180000);await home(page);await page.setViewportSize({width:1024,height:768});const ids=['edf','turbo','rota','memory','puzzle','secret','scramble','search','rope','forca','balanca','silabas','erro'];const failures=[];
 for(const solo of [false,true])for(const difficulty of ['normal','hard'])for(const id of ids){
  await page.goto('/');await page.clock.runFor(2300);await page.locator('[data-action="edf"]').click();await page.locator('#edf-game').selectOption(id);await page.locator('#edf-mode').selectOption(solo?'solo':'duel');await page.locator('#edf-level').selectOption(difficulty);await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
  await expect(page.locator('.game[data-subject="edf"]')).toHaveCount(solo?1:2);const root=page.locator('#board-0 .game');await expect(root).not.toContainText(/marketing|campanha|slogan|público-alvo/i);
  if(id==='puzzle'){await expect(page.locator('#board-0 .jigsaw-ghost img')).toHaveAttribute('src',/visual\/edf\//);await expect(page.locator('#board-0 .jigsaw-piece rect').first()).toHaveAttribute('fill','#f0e8ff')}
  if(id==='memory'){await page.locator('#board-0 .memory-card').first().dispatchEvent('pointerdown',{pointerId:1,button:0});await expect(page.locator('#board-0 .edf-memory-label')).toBeVisible()}
  const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));for(const b of bounds)if(b.v>1||b.h>1)failures.push({id,solo,difficulty,...b});
  if(!solo&&difficulty==='hard'&&['forca','search','puzzle','memory'].includes(id))await page.screenshot({path:`art-check-results/edf-expanded/${id}.png`,animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 }expect(failures).toEqual([]);
});

test('EDF illustrated puzzle still snaps and scores exactly once after a drag',async({page})=>{
 await home(page);await page.setViewportSize({width:1024,height:768});await page.locator('[data-action="edf"]').click();await page.locator('#edf-game').selectOption('puzzle');await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 const coordinates=await page.locator('#board-0 .jigsaw-piece').first().evaluate(piece=>{
  const area=piece.closest('.jigsaw-area').getBoundingClientRect(),box=piece.getBoundingClientRect(),hit=piece.querySelector('.jigsaw-hit').getBoundingClientRect(),from={x:hit.x+hit.width/2,y:hit.y+hit.height/2};
  return{from,to:{x:area.x+Number(piece.dataset.tx)/1000*area.width+(from.x-box.x),y:area.y+Number(piece.dataset.ty)/700*area.height+(from.y-box.y)}};
 });const hit=page.locator('#board-0 .jigsaw-piece').first().locator('.jigsaw-hit');
 await hit.dispatchEvent('pointerdown',{pointerId:7,button:0,clientX:coordinates.from.x,clientY:coordinates.from.y});await hit.dispatchEvent('pointermove',{pointerId:7,button:0,clientX:coordinates.to.x,clientY:coordinates.to.y});await hit.dispatchEvent('pointerup',{pointerId:7,button:0,clientX:coordinates.to.x,clientY:coordinates.to.y});
 await expect(page.locator('#board-0 .jigsaw-piece').first()).toHaveAttribute('data-placed','true');await expect(page.locator('#score-0')).toHaveText('1000');await page.screenshot({path:'art-check-results/edf-expanded/puzzle-encaixe.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
});

test('EDF new board artwork and a saved custom competition work offline',async({page,context})=>{
 await competition(page,{count:2,rounds:1,students:3});await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await page.clock.runFor(2300);await context.setOffline(true);await page.reload();await page.clock.runFor(2300);await page.locator('[data-action="edf"]').click();await page.locator('[data-action="edf-tournament"]').click();await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);await page.locator('[data-action="edf-match-start"]').click();await page.clock.runFor(2800);await expect(page.locator('.game-rope[data-subject="edf"]')).toHaveCount(2);
 expect(await page.evaluate(async()=>(await fetch('/assets/visual/edf/board-pieces-atlas-v1.png')).ok)).toBe(true);await context.setOffline(false);
});
