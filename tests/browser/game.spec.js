import {test,expect} from '@playwright/test';
const SHOTS='art-check-results/legacy-agent/game';

test('complete tournament, nonfinal ranking, persistence, undo and replay',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto('/');
 await expect(page.getByRole('button',{name:'Modo Duelo'})).toBeVisible();
 await page.screenshot({path:`${SHOTS}/home.png`,fullPage:true});
 await page.locator('[data-action="setup"]').first().click();
 await page.locator('input[value="individual"]').check();
 await page.locator('#names').fill('Azul\nLaranja\nVerde\nRoxo');
 await page.getByRole('button',{name:'Sortear confrontos'}).click();
 await expect(page.locator('.bracket')).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Retomar campeonato'}).click();
 let champion;
 for(let match=0;match<3;match++){
  await page.locator('[data-action="catalog"]').click();
  await expect(page.locator('.game-card')).toHaveCount(12);
  await page.screenshot({path:`${SHOTS}/catalog-${match}.png`,fullPage:true});
  await page.locator('[data-id="rope"]').click();await page.locator('[data-action="start"]').click();
  await page.clock.runFor(2900);await expect(page.locator('.game-rope')).toHaveCount(2);
  await page.screenshot({path:`${SHOTS}/game-${match}.png`,fullPage:true});
  if(match===0){
   const pauseBox=await page.locator('#presenter').boundingBox();await page.mouse.move(pauseBox.x+20,pauseBox.y+20);await page.mouse.down();await page.clock.runFor(700);await page.mouse.up();
   await expect(page.getByText('Duelo em pausa')).toBeVisible();const before=await page.locator('#clock').textContent();await page.clock.runFor(5000);expect(await page.locator('#clock').textContent()).toBe(before);
   await page.locator('#resume').click();
  }
  await page.clock.runFor(61000);await expect(page.locator('#clock')).toHaveText('EMPATE');
  const tiePrompt=await page.locator('#board-0 h2').textContent(),nums=tiePrompt.match(/\d+/g).map(Number),correct=nums[0]*nums[1]+nums[2];
  await page.locator(`#board-0 [data-value="${correct}"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});
  await expect(page.locator('.result')).toBeVisible();
  await expect(page.locator('.accuracy-result')).toHaveText('1 × 0 acertos');
  expect((await page.locator('.result-scores b').allTextContents()).map(Number)).toEqual([1000,0]);
  if(match===2)champion=(await page.locator('.result h1').innerText()).split('\n')[0];
  await page.locator('[data-action="confirm-result"]').click();
  if(match<2){
   await expect(page.locator('.champ-ranking')).toBeVisible();
   await expect(page.locator('.champ-ranking .solo-rank li')).toHaveCount(4);
   await page.getByRole('button',{name:'Ver chaveamento e continuar'}).click();
   await expect(page.locator('.bracket')).toBeVisible();
   await expect(page.locator('.match.finished')).toHaveCount(match+1);
  }else{
   await expect(page.getByText('o futuro é seu!')).toBeVisible();
   await expect(page.locator('.result h1')).toContainText(champion);
  }
 }
 await page.reload();await page.getByRole('button',{name:'Retomar campeonato'}).click();await expect(page.getByText('o futuro é seu!')).toBeVisible();
 await expect(page.locator('.result h1')).toContainText(champion);
 await page.getByRole('button',{name:'Desfazer final'}).click();await page.locator('#yes').click();await expect(page.locator('.bracket')).toBeVisible();
 await expect(page.locator('.match.finished')).toHaveCount(2);
 await expect(page.locator('.match.next')).toHaveCount(1);
 expect(errors).toEqual([]);
});

test('all games start, pause and dispose with independent sides',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {GAMES,createGame}=await import('/games.js');const results=[];
  for(const g of GAMES){const a=document.createElement('div'),b=document.createElement('div');a.style.width=b.style.width='650px';document.body.append(a,b);let scores=[0,0];const make=(el,side)=>createGame({id:g.id,el,side,seed:42,difficulty:'hard',onScore:n=>scores[side]+=n,onFinish:()=>{}});const ga=make(a,0),gb=make(b,1);ga.start();gb.start();const prompts=[a.querySelector('.prompt').textContent,b.querySelector('.prompt').textContent];const elements=a.querySelectorAll('button, .jigsaw-piece, .search-cell, .syl-chip, .weight').length;const button=a.querySelector('[data-action]');button?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,button:0}));ga.pause();gb.pause();results.push({id:g.id,elements,prompts,scores});ga.resume();gb.resume();ga.destroy();gb.destroy();a.remove();b.remove()}
  return results;
 });
 expect(result).toHaveLength(12);for(const item of result){expect(item.elements).toBeGreaterThan(0);expect(item.scores[1]).toBe(0)}
});
test('offline shell and assets load after cache',async({page,context})=>{
 await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();await context.setOffline(true);await page.reload();await expect(page.getByRole('button',{name:'Modo Duelo'})).toBeVisible();await page.locator('[data-action="catalog-demo"]').first().click();await expect(page.locator('.game-card')).toHaveCount(12);await context.setOffline(false);
});
test('real simultaneous touch contacts and cancellation',async({page,context})=>{
 await page.goto('/');await page.locator('[data-action="diagnostic"]').click();
 const box=await page.locator('#touch-test').boundingBox();const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:10});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+100,y:box.y+120,id:1},{x:box.x+box.width-100,y:box.y+120,id:2}]});
 await expect(page.locator('#contact-count')).toHaveText('2 contatos ativos');await expect(page.locator('.touch-dot')).toHaveCount(2);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await expect(page.locator('#contact-count')).toHaveText('0 contatos ativos');
});
test('quiz score consumes an answer once, pause blocks it and uses the learning bank',async({page})=>{
 await page.clock.install();await page.goto('/');
 const first=await page.evaluate(async()=>{
  const {createGame,seededRandom}=await import('/games.js');const {learningBank}=await import('/learning.js');
  const el=document.createElement('div');el.id='fixture';document.body.append(el);window.quizPoints=0;window.quizAwards=[];
  window.quiz=createGame({id:'rope',el,seed:251,side:0,difficulty:'hard',onScore:(n,meta)=>{window.quizPoints+=n;window.quizAwards.push({delta:n,...meta})}});window.quiz.start();
  const q=learningBank(3,seededRandom('251:rope:bank:3')).find(q=>q.question===el.querySelector('.prompt').textContent);if(!q)throw Error('Question outside the rope bank');
  window.quiz.pause();const b=el.querySelector(`[data-value="${q.answer}"]`);b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:20}));const paused=window.quizPoints;
  window.quiz.resume();b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:20}));b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:21}));return {paused,score:window.quizPoints,awards:window.quizAwards};
 });expect(first.paused).toBe(0);expect(first.awards).toHaveLength(1);
 const award=first.awards[0];expect(award.correct).toBe(true);expect(award.correctDelta).toBe(1);
 expect(award.base).toBe(1000);
 expect(award.bonus).toBeGreaterThanOrEqual(0);expect(award.bonus).toBeLessThanOrEqual(20);
 expect(first.score).toBe(award.base+award.bonus);
 await page.evaluate(()=>window.quiz.destroy());
});
test('secret word: both sides get the same word with the whole alphabet',async({page})=>{
 await page.goto('/');
 const sides=await page.evaluate(async()=>{const{createGame}=await import('/games.js');
  const els=[0,1].map(()=>{const el=document.createElement('div');document.body.append(el);return el});
  const games=els.map((el,i)=>createGame({id:'secret',el,side:i,seed:1,difficulty:'hard'}));
  const out=els.map(el=>({prompt:el.querySelector('.prompt').textContent,keys:el.querySelectorAll('.alphabet button').length,slots:el.querySelector('.word-slots').children.length}));
  games.forEach(g=>g.destroy());els.forEach(e=>e.remove());return out});
 expect(sides[0]).toEqual(sides[1]);expect(sides[0].keys).toBe(26);
});
