import {test,expect} from '@playwright/test';

async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}
async function start(page,{grade=6,solo=false,difficulty='normal'}={}){
 await page.locator('[data-action="edf"]').click();await page.locator(`.edf-grade:has([value="${grade}"])`).click();
 await page.locator('#edf-game').selectOption('ordem');await page.locator('#edf-mode').selectOption(solo?'solo':'duel');await page.locator('#edf-level').selectOption(difficulty);
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
}
const cards=(page,board=0)=>page.locator(`#board-${board} .seq-card`).allTextContents();
async function sequence(page,grade,board=0){
 const text=await page.locator(`#board-${board} .edf-question`).textContent();
 return page.evaluate(async({text,grade})=>{const {edfSequencesOf}=await import('/edf-content.js');return edfSequencesOf(grade).find(item=>text===`Coloque em ordem: ${item.prompt}`)},{text,grade});
}
// Cada toque separado por um tempo de jogo, para não acionar a proteção contra toques em excesso.
async function tap(page,board,position){await page.locator(`#board-${board} .seq-card`).nth(position).click();await page.clock.runFor(800)}
async function solve(page,item,board=0){
 for(let i=0;i<item.steps.length;i++){
  const now=await cards(page,board),at=now.indexOf(item.steps[i]);
  if(at!==i){await tap(page,board,i);await tap(page,board,at)}
 }
}
const check=(page,board=0)=>page.locator(`#board-${board} [data-action="check"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});

test('Ordene a Sequência está nas listas do EDF e do campeonato',async({page})=>{
 await home(page);await page.locator('[data-action="edf"]').click();
 await expect(page.locator('#edf-game option[value="ordem"]')).toHaveText('Ordene a Sequência');await expect(page.locator('[data-edf-pick="ordem"]')).toBeVisible();
 await page.locator('[data-action="edf-tournament"]').click();await expect(page.locator('[name="edf-comp-game"][value="ordem"]')).toBeChecked();
});

test('tocar em dois cartões troca os dois de lugar; a ordem certa vale 1000 pontos e os dois lados recebem a mesma sequência',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await start(page,{grade:6});
 await expect(page.locator('#board-0 .seq-card')).toHaveCount(3);
 expect(await cards(page,0)).toEqual(await cards(page,1));
 await expect(page.locator('#board-1 .edf-question')).toHaveText(await page.locator('#board-0 .edf-question').textContent());
 const item=await sequence(page,6);expect(item.steps).toHaveLength(3);
 const before=await cards(page);expect(before).not.toEqual(item.steps);
 await tap(page,0,0);await expect(page.locator('#board-0 .seq-card.selected')).toHaveCount(1);await tap(page,0,1);
 const swapped=await cards(page);expect(swapped[0]).toBe(before[1]);expect(swapped[1]).toBe(before[0]);await expect(page.locator('#board-0 .seq-card.selected')).toHaveCount(0);
 await solve(page,item);expect(await cards(page)).toEqual(item.steps);
 await check(page);
 await expect(page.locator('#board-0 .seq-list')).toHaveClass(/ok/);await expect(page.locator('#accuracy-0')).toContainText('1 acertos');await expect(page.locator('#score-0')).toHaveText(/^10\d\d$/);
 await page.clock.runFor(1700);await expect(page.locator('#board-0 .edf-question')).not.toHaveText(`Coloque em ordem: ${item.prompt}`);
 expect(errors).toEqual([]);
});

test('ordem errada vale 0, mostra a ordem correta e segue para outra sequência',async({page})=>{
 await home(page);await start(page,{grade:8});
 const item=await sequence(page,8);expect(await cards(page)).not.toEqual(item.steps);
 await check(page);
 await expect(page.locator('#board-0 .seq-list')).toHaveClass(/bad/);await expect(page.locator('#score-0')).toHaveText('0');
 expect(await cards(page)).toEqual(item.steps);await expect(page.locator('#board-0 .game > .helper')).toContainText('ordem correta');
 await page.clock.runFor(3300);await expect(page.locator('#board-0 .edf-question')).not.toHaveText(`Coloque em ordem: ${item.prompt}`);
 await expect(page.locator('#accuracy-0')).toContainText('0 acertos');
});

test('arrastar um cartão sobre outro troca os dois de lugar',async({page})=>{
 await home(page);await start(page,{grade:9});
 const before=await cards(page);
 await page.locator('#board-0 .seq-card').nth(0).dragTo(page.locator('#board-0 .seq-row').nth(2));
 const after=await cards(page);expect(after[2]).toBe(before[0]);expect(after[0]).toBe(before[2]);expect(after[1]).toBe(before[1]);
});

test('os níveis pedem 3, 4 e 5 cartões e o jogo funciona em solo',async({page})=>{
 await home(page);await start(page,{grade:7,solo:true,difficulty:'hard'});
 await expect(page.locator('#board-0 .seq-card')).toHaveCount(5);await expect(page.locator('.game[data-subject="edf"]')).toHaveCount(1);
 const item=await sequence(page,7);expect(item.steps).toHaveLength(5);await solve(page,item);await check(page);await expect(page.locator('#accuracy-0')).toContainText('1 acertos');
});

test('cabe na arena com 5 cartões em 16:9 e em 4:3',async({page})=>{
 const failures=[];
 await home(page);
 for(const size of [{width:1280,height:720},{width:1024,height:768}]){
  await page.setViewportSize(size);await page.goto('/');await page.clock.runFor(2300);await start(page,{grade:8,difficulty:'hard'});
  await expect(page.locator('#board-0 .seq-card')).toHaveCount(5);
  const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));
  for(const b of bounds)if(b.v>1||b.h>1)failures.push({...size,...b});
  await page.screenshot({path:`art-check-results/edf-sequencia/${size.width}x${size.height}.png`,animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 }
 expect(failures).toEqual([]);
});
