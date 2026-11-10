import {test,expect} from '@playwright/test';

const ORDER=['head','torso','arm-left','arm-right','leg-left','leg-right'];
async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}

// Aperta teclas e confere, a cada toque, que o contador e o desenho mostram o mesmo número de partes, na ordem.
async function playLetters(page,presses){
 let maxErrors=0;
 for(let i=0;i<presses;i++){
  await page.locator('#board-0 .answers .letter:not(.chosen)').first().dispatchEvent('pointerdown',{pointerId:1,button:0});
  await page.clock.runFor(1100);
  const label=await page.locator('#board-0 .game-stage > .helper').first().textContent();
  const count=Number(label.match(/Erros: (\d) de 6/)[1]);
  const shown=await page.locator('#board-0 .hangman-part.on').evaluateAll(parts=>parts.map(part=>part.dataset.part));
  expect(shown).toEqual(ORDER.slice(0,count));
  maxErrors=Math.max(maxErrors,count);
 }
 return maxErrors;
}

test('Forca (modo normal) mostra o boneco tradicional, sem foguete nem combustível',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await page.setViewportSize({width:1024,height:768});
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="forca"]').click();
 await expect(page.locator('.rule')).toContainText('boneco da forca');
 await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .hangman')).toBeVisible();await expect(page.locator('#board-0 .hangman-wood')).toHaveCount(5);
 await expect(page.locator('#board-0 .hangman-part.on')).toHaveCount(0);await expect(page.locator('#board-0 .game-stage > .helper').first()).toHaveText('Erros: 0 de 6');
 await expect(page.locator('#board-0 .fuel')).toHaveCount(0);await expect(page.locator('#board-0')).not.toContainText(/combust/i);
 expect(await playLetters(page,12)).toBeGreaterThan(0);
 const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));
 for(const b of bounds){expect(b.v).toBeLessThanOrEqual(1);expect(b.h).toBeLessThanOrEqual(1)}
 await page.screenshot({path:'art-check-results/forca-boneco/modo-normal.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 expect(errors).toEqual([]);
});

test('Forca EDF usa o mesmo boneco com palavras do ano escolhido',async({page})=>{
 await home(page);await page.setViewportSize({width:1024,height:768});
 await page.locator('[data-action="edf"]').click();await page.locator('.edf-grade:has([value="9"])').click();
 await page.locator('#edf-game').selectOption('forca');await page.locator('#edf-form').evaluate(form=>form.requestSubmit());
 await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .game')).toHaveAttribute('data-topics',/^e9-/);await expect(page.locator('#board-0 .hangman')).toBeVisible();
 expect(await playLetters(page,12)).toBeGreaterThan(0);
 await page.screenshot({path:'art-check-results/forca-boneco/modo-edf-9ano.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
});

test('a Palavra Secreta continua com o foguete e o combustível',async({page})=>{
 await home(page);
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="secret"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0')).toContainText('Combustível');await expect(page.locator('#board-0 .hangman')).toHaveCount(0);
});

test('o componente mostra de 0 a 6 partes, na ordem, e descreve o estado para leitores de tela',async({page})=>{
 await home(page);
 const states=await page.evaluate(async()=>{
  const {createHangman}=await import('/forca-boneco.js');const figure=createHangman(document);document.body.append(figure.el);
  const out=[];for(const n of [0,1,2,3,4,5,6,9]){figure.setMistakes(n);out.push({n,on:[...figure.el.querySelectorAll('.hangman-part.on')].map(el=>el.dataset.part),label:figure.el.querySelector('svg').getAttribute('aria-label'),wood:figure.el.querySelectorAll('.hangman-wood').length})}
  figure.el.remove();return out;
 });
 for(const state of states){const shown=Math.min(state.n,6);expect(state.on).toEqual(ORDER.slice(0,shown));expect(state.label).toContain(`${shown} de 6`);expect(state.wood).toBe(5)}
});
