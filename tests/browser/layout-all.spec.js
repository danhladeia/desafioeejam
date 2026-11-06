import {test,expect} from '@playwright/test';
test('all games fit their arenas on tablet at both difficulties, including solo',async({page})=>{
 test.setTimeout(120000);await page.clock.install();await page.setViewportSize({width:1024,height:768});await page.goto('/');
 const ids=await page.evaluate(async()=>(await import('/games.js')).GAMES.map(g=>g.id));
 const failures=[];
 for(const difficulty of ['normal','hard'])for(const solo of [false,true])for(const id of ids){
  await page.goto('/');await page.clock.runFor(2300);
  await page.evaluate(difficulty=>{const p=JSON.parse(localStorage.getItem('eejam-prefs')||'{}');localStorage.setItem('eejam-prefs',JSON.stringify({...p,difficulty}))},difficulty);await page.reload();await page.clock.runFor(2300);
  if(solo){await page.locator('[data-action="solo"]').click();await page.locator('#solo-form').evaluate(form=>form.requestSubmit())}else await page.locator('[data-action="catalog-demo"]').click();
  await page.locator(`[data-id="${id}"]`).click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
  const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>{const box=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();return {vertical:el.scrollHeight-el.clientHeight,horizontal:el.scrollWidth-el.clientWidth,outside:box.bottom-parent.bottom}}));
  for(const [side,b]of bounds.entries())if(b.vertical>1||b.horizontal>1||b.outside>1)failures.push({difficulty,solo,id,side,...b});
 }
 expect(failures).toEqual([]);
});
