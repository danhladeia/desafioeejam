import {test,expect} from '@playwright/test';
const shots='art-check-results/edf';
async function ready(page){await page.clock.install();await page.goto('/');await page.clock.runFor(2300);await page.locator('[data-action="edf"]').click()}
async function launch(page,{solo=true,topics=['ginastica','aventura','lutas'],difficulty='normal'}={}){
 await page.locator('#edf-mode').selectOption(solo?'solo':'duel');await page.locator('#edf-level').selectOption(difficulty);
 for(const id of ['ginastica','aventura','lutas','tabuleiro'])await page.locator(`[name="edf-topic"][value="${id}"]`).setChecked(topics.includes(id));
 await page.locator('#edf-name-a').fill('Equipe Movimento');if(!solo)await page.locator('#edf-name-b').fill('Equipe Respeito');
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
}
async function card(page,side=0){const id=await page.locator(`#board-${side} .game-edf`).getAttribute('data-card-id');return page.evaluate(async id=>(await import('/edf-content.js')).EDF_CARDS.find(c=>c.id===id),id)}
async function answer(page,side=0,wrong=false){const c=await card(page,side);await page.locator(`#board-${side} [data-value="${wrong?(c.answer+1)%4:c.answer}"]`).dispatchEvent('pointerdown',{pointerId:side+1,button:0});return c}

test('EDF topic selection, study cards and saved preferences stay separate from the original catalog',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await ready(page);await expect(page.locator('#edf-count')).toContainText('27 cartas');await page.locator('.edf-study>summary').click();await expect(page.locator('.edf-study-card')).toHaveCount(27);await page.locator('.edf-study').evaluate(el=>el.open=false);
 for(const id of ['ginastica','aventura','lutas'])await page.locator(`[value="${id}"]`).uncheck();await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await expect(page.locator('#toast')).toHaveText('Selecione ao menos um tema para as cartas.');
 await page.locator('[value="tabuleiro"]').check();await expect(page.locator('#edf-count')).toContainText('6 cartas');await page.screenshot({path:`${shots}/selecao-edf.png`,animations:'disabled'});
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await expect(page.locator('.preparation')).toBeVisible();await page.locator('[data-action="edf"]').click();await expect(page.locator('[value="tabuleiro"]')).toBeChecked();await expect(page.locator('[value="ginastica"]')).not.toBeChecked();
 await page.locator('[data-action="home"]').first().click();await page.locator('[data-action="catalog-demo"]').click();await expect(page.locator('.game-card')).toHaveCount(12);expect(errors).toEqual([]);
});

test('EDF solo uses PDF pictures, excludes pause time, progresses and saves by selected topics',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await ready(page);await launch(page,{topics:['lutas']});await expect(page.locator('.arena')).toHaveCount(1);await expect(page.locator('.edf-question-image')).toBeVisible();
 await page.keyboard.press('Escape');const before=await page.locator('#clock').textContent();await page.clock.runFor(10000);await expect(page.locator('#clock')).toHaveText(before);await page.locator('#resume').click();
 for(let i=0;i<8;i++){
  const current=await answer(page);expect(current.topic).toBe('lutas');if(i===0){await expect(page.locator('.arena')).toHaveClass(/feedback-good/);const score=+(await page.locator('#score-0').textContent());expect(score).toBeGreaterThanOrEqual(1019);expect(score).toBeLessThanOrEqual(1020)}
  await expect(page.locator('.edf-house.visited')).toHaveCount(i+1);if(i===2)await page.screenshot({path:`${shots}/trilha-solo.png`,animations:'disabled'});
  await page.clock.runFor(1600);if(i===2)await expect(page.locator('.game-edf')).toHaveAttribute('data-level','2');if(i===5)await expect(page.locator('.game-edf')).toHaveAttribute('data-level','3');
 }
 await expect(page.getByText('desafio concluído!')).toBeVisible();await expect(page.locator('.accuracy-result')).toContainText('8 acertos');await expect(page.locator('.solo-rank li')).toHaveCount(1);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('eejam-solo-v1'))[0].gameId)).toBe('edf:lutas');await page.screenshot({path:`${shots}/resultado-edf.png`,animations:'disabled'});expect(errors).toEqual([]);
});

test('EDF duel has paired cards, independent trails, wrong feedback and a thematic tiebreak',async({page})=>{
 await ready(page);await launch(page,{solo:false,topics:['tabuleiro']});await expect(page.locator('.game-edf')).toHaveCount(2);expect((await card(page,0)).id).toBe((await card(page,1)).id);
 await answer(page,0,true);await expect(page.locator('.arena[data-side="0"]')).toHaveClass(/feedback-bad/);await expect(page.locator('#score-0')).toHaveText('0');await expect(page.locator('#board-1 .edf-house.visited')).toHaveCount(0);
 await page.clock.runFor(121000);await expect(page.locator('#clock')).toHaveText('EMPATE');await expect(page.locator('#board-0')).toContainText('DESEMPATE EDF');
 const text=await page.locator('#board-0 h2').textContent();const correct=await page.evaluate(async text=>(await import('/edf-content.js')).EDF_CARDS.find(c=>c.topic==='tabuleiro'&&c.q===text).answer,text);
 await page.locator(`#board-1 [data-value="${correct}"]`).dispatchEvent('pointerdown',{pointerId:2,button:0});await expect(page.locator('.result h1')).toContainText('Equipe Respeito');await expect(page.locator('.fact')).not.toContainText('Marketing');await expect(page.locator('[data-action="edf"]')).toBeVisible();
});

for(const solo of [false,true])for(const difficulty of ['normal','hard'])test(`EDF layout ${solo?'solo':'duel'} ${difficulty} fits tablet and loads images offline`,async({page,context})=>{
 await page.setViewportSize({width:1024,height:768});await ready(page);await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await page.clock.runFor(2300);await context.setOffline(true);await page.reload();await page.clock.runFor(2300);await page.locator('[data-action="edf"]').click();await launch(page,{solo,difficulty});
 const failures=await page.locator('.board').evaluateAll(elements=>elements.map(el=>({vertical:el.scrollHeight-el.clientHeight,horizontal:el.scrollWidth-el.clientWidth})));for(const b of failures){expect(b.vertical).toBeLessThanOrEqual(1);expect(b.horizontal).toBeLessThanOrEqual(1)}
 const c=await card(page);expect(await page.locator('#board-0 .edf-question-image').evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);expect(c.page).toBeGreaterThan(0);
 await page.screenshot({path:`${shots}/tablet-${solo?'solo':'duel'}-${difficulty}.png`,animations:'disabled'});await context.setOffline(false);
});

test('all EDF question and answer texts fit tablet cards, including the longest feedback',async({page})=>{
 await page.setViewportSize({width:1024,height:768});await ready(page);await launch(page,{solo:false});
 const failures=await page.evaluate(async()=>{
  const {EDF_CARDS}=await import('/edf-content.js'),board=document.querySelector('#board-0'),root=board.querySelector('.game-edf'),bad=[];
  for(const card of EDF_CARDS){
   root.querySelector('.edf-question').textContent=card.q;root.querySelectorAll('.answer').forEach((el,index)=>el.textContent=card.options[index]);root.querySelector('.game>.helper').textContent=`Resposta: ${card.options[card.answer]}. ${card.explain}`;
   for(const [index,el]of [...root.querySelectorAll('.answer')].entries())if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)bad.push({id:card.id,index,kind:'answer'});
   if(board.scrollHeight>board.clientHeight+1||board.scrollWidth>board.clientWidth+1)bad.push({id:card.id,kind:'board'});
  }return bad;
 });expect(failures).toEqual([]);
});

test('EDF can reuse registered team names and leaves the championship results intact',async({page})=>{
 await page.clock.install();await page.goto('/');await page.clock.runFor(2300);await page.locator('[data-action="setup"]').click();
 for(const [index,name]of ['Equipe Sol','Equipe Lua'].entries()){await page.locator('.team-name').nth(index).fill(name);await page.locator('.team-members').nth(index).fill(index?'Bruno':'Ana')}
 await page.getByRole('button',{name:'Sortear confrontos'}).click();await page.locator('[data-action="home"]').first().click();await page.locator('[data-action="edf"]').click();await page.locator('#edf-use-teams').click();await expect(page.locator('#edf-name-a')).toHaveValue('Equipe Sol');await expect(page.locator('#edf-name-b')).toHaveValue('Equipe Lua');
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);await answer(page,0);await page.clock.runFor(121000);await expect(page.locator('.result h1')).toContainText('Equipe Sol');
 const saved=await page.evaluate(async()=>{const t=await(await import('/core.js')).loadTournament();return{done:t.rounds.flat().filter(m=>m.status==='completed').length,names:t.teams.map(t=>t.name)}});expect(saved.done).toBe(0);expect(saved.names).toEqual(['Equipe Sol','Equipe Lua']);
});
