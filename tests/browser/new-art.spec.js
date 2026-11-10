import {test,expect} from '@playwright/test';

test('new seals and gameplay sprites load online and offline',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
 await page.setViewportSize({width:1920,height:1080});await page.goto('/');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;const{NEW_ART_FILES}=await import('/new-art.js');await Promise.all(NEW_ART_FILES.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=src})))});
 await page.clock.runFor(2300);await page.locator('[data-action="catalog-demo"]').click();
 for(const id of ['balanca','silabas','erro'])await expect(page.locator(`[data-id="${id}"] .new-game-seal`)).toBeVisible();
 await page.screenshot({path:'test-results/new-art/catalog.png',animations:'disabled'});
 for(const id of ['balanca','silabas','erro']){
  await page.goto('/');await page.clock.runFor(2300);await page.locator('[data-action="catalog-demo"]').click();await page.locator(`[data-id="${id}"]`).click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
  await expect(page.locator('#board-0 .asset-sprite').first()).toBeVisible();
  const backgrounds=await page.locator('#board-0 .asset-sprite').evaluateAll(els=>els.filter(el=>!el.classList.contains('mistake-word')).map(el=>getComputedStyle(el).backgroundImage));expect(backgrounds.every(bg=>bg.includes('assets/visual/new-games/'))).toBe(true);
  if(id==='erro'){const words=await page.locator('#board-0 .mistake-word').evaluateAll(els=>els.map(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor})));expect(words.length).toBeGreaterThan(0);for(const w of words){expect(w.color).toBe('rgb(255, 255, 255)');expect(w.bg).not.toBe('rgba(0, 0, 0, 0)')}}
  await page.screenshot({path:`test-results/new-art/${id}.png`,animations:'disabled'});
 }
 await page.goto('/');await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await page.clock.runFor(2300);
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="balanca"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 expect(await page.evaluate(async()=>{const{NEW_ART_FILES}=await import('/new-art.js');return Promise.all(NEW_ART_FILES.map(async url=>(await fetch(url)).ok))})).toEqual([true,true,true,true]);
 await expect(page.locator('#board-0 [data-sprite="balance-post"]')).toBeVisible();await context.setOffline(false);expect(errors).toEqual([]);
});
