import {test,expect} from '@playwright/test';
const SHOTS='art-check-results/legacy-agent/rope';
const captureStyle='#wipe{visibility:hidden!important}.intro .hero-m{animation:none!important;transform:none!important;opacity:1!important}.tug-avatar{animation:none!important}';

async function play(page){await page.goto('/');await page.clock.runFor(2400);await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="rope"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2900);await expect(page.locator('.tug-stage')).toHaveAttribute('data-state','playing')}
async function answer(page,side=0){return page.evaluate(async side=>{const m=await import('/learning.js'),q=document.querySelector(`#board-${side} .prompt`).textContent;let r;const calc=e=>String(Function(`return (${e.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/')})`)());if((r=q.match(/^([\d\s+−×÷()]+)= \?$/)))return calc(r[1]);if((r=q.match(/tinha (\d+) .* mais (\d+)\./)))return String(+r[1]+ +r[2]);if((r=q.match(/Quanto é (\d+)% de (\d+)\?/)))return String(r[2]*r[1]/100);if((r=q.match(/Quanto é (\d+)\/(\d+) de (\d+)\?/)))return String(r[3]/r[2]*r[1]);if((r=q.match(/^(\d+) ao quadrado/)))return String(r[1]*r[1]);if((r=q.match(/2 elevado a (\d+)/)))return String(2**r[1]);if((r=q.match(/raiz quadrada de (\d+)/)))return String(Math.sqrt(+r[1]));if((r=q.match(/mede (\d+) cm por (\d+) cm\. Qual é a área/)))return `${r[1]*r[2]} cm²`;if((r=q.match(/mede (\d+) cm por (\d+) cm\. Qual é o perímetro/)))return `${2*(+r[1]+ +r[2])} cm`;const item=m.PORTUGUES.find(x=>x.question===q);if(!item)throw Error('Questão não reconhecida: '+q);return item.options[item.answer]},side)}

test('menu hides school staff; rope reacts to scores and freezes on pause',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.setViewportSize({width:1920,height:1080});await page.goto('/');
 await expect(page.locator('.team,.staff,img[src*="staff-"]')).toHaveCount(0);await page.screenshot({path:`${SHOTS}/menu.png`,animations:'disabled',style:captureStyle});
 await play(page);await expect(page.locator('.tug-sprite')).toHaveCount(2);
 const correct=await answer(page);const options=await page.locator('#board-0 .answer').allTextContents();await page.locator('#board-0 .answer').nth(options.indexOf(correct)).dispatchEvent('pointerdown',{pointerId:1,button:0});
 await expect(page.locator('#accuracy-0')).toContainText('1 acertos');
 const hud=await page.locator('#accuracy-0').textContent(),bonus=Number(hud.match(/velocidade: (\d+)/)[1]),points=Number(await page.locator('#score-0').textContent());
 expect(bonus).toBeGreaterThanOrEqual(0);expect(bonus).toBeLessThanOrEqual(20);expect(points).toBe(1000+bonus);await expect(page.locator('#score-1')).toHaveText('0');await expect(page.locator('.tug-left')).toHaveClass(/pulling/);expect(await page.locator('#rope-marker').evaluate(el=>parseFloat(el.style.left))).toBeLessThan(50);
 await expect(page.locator('#rope-marker')).toHaveAttribute('aria-valuenow','10');
 await page.screenshot({path:`${SHOTS}/rope-pulling.png`,animations:'disabled',style:captureStyle});
 await page.keyboard.press('Escape');await expect(page.locator('.tug-stage')).toHaveAttribute('data-state','paused');
 expect(await page.locator('.tug-faisca').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
 await page.locator('#resume').click();await expect(page.locator('.tug-stage')).toHaveAttribute('data-state','playing');expect(errors).toEqual([]);
});

test('rope artwork fits tablet and board, and remains available offline',async({page,context})=>{
 await page.clock.install();for(const size of [{width:1280,height:800},{width:1024,height:768},{width:1920,height:1080}]){
  await page.setViewportSize(size);await play(page);
  for(const side of [0,1])expect(await page.locator(`#board-${side}`).evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:`${SHOTS}/rope-${size.width}.png`,animations:'disabled',style:captureStyle});
 }
 await page.goto('/');await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await play(page);
 const loaded=await page.evaluate(async()=>Promise.all(['assets/visual/rope/mascots-pulling-4-frames-v1.png','assets/visual/rope/rope-strip-v1.png'].map(async src=>{const r=await fetch(src);return r.ok})));
 expect(loaded).toEqual([true,true]);await context.setOffline(false);
});
