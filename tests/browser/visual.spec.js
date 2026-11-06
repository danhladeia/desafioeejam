import {test,expect} from '@playwright/test';

// Confere a abertura e o encaixe do menu em telas de tablet e na proporção da lousa.
const SHOTS='art-check-results/legacy-agent/visual';
const SCREENS=[{name:'tablet-16x10',width:1280,height:800},{name:'tablet-4x3',width:1024,height:768},{name:'lousa-16x9',width:1920,height:1080}];

test.use({reducedMotion:'no-preference'});

test('abertura passa pelas etapas e termina com o menu utilizável',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.goto('/');
 await expect(page.locator('body')).toHaveClass(/intro/);
 const at=async(ms,name)=>{await page.evaluate(t=>{document.getAnimations().forEach(a=>{a.pause();a.currentTime=t})},ms);await page.waitForTimeout(60);await page.screenshot({path:`${SHOTS}/intro-${name}.png`,animations:'allow'})};
 await at(240,'1-colisao');await at(520,'2-raio');await at(800,'3-escudo');await at(1250,'4-mascotes');await at(2200,'5-final');
 const opacity=await page.locator('.shield').evaluate(e=>getComputedStyle(e).opacity);expect(opacity).toBe('1');
 await page.evaluate(()=>document.getAnimations().forEach(a=>a.play()));
 await page.locator('[data-action="setup"]').click();await page.locator('input[value="individual"]').check();await expect(page.locator('#names')).toBeVisible();
});

for(const s of SCREENS)test(`menu e catálogo cabem sem rolagem em ${s.name}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:s.width,height:s.height});await page.goto('/');await page.waitForTimeout(2300);
 await page.screenshot({path:`${SHOTS}/${s.name}-menu.png`});
 const fits=sel=>page.locator(sel).evaluate(e=>({over:e.scrollHeight-e.clientHeight,wide:e.scrollWidth-e.clientWidth}));
 expect(await fits('html')).toEqual({over:0,wide:0});
 await page.screenshot({path:`${SHOTS}/${s.name}-menu-equipe.png`});
 const inside=[...await page.locator('.menu-buttons button').all(),page.locator('.shield')];
 expect(inside.length).toBeGreaterThanOrEqual(4);
 for(const el of inside){const b=await el.boundingBox();expect(b.y+b.height).toBeLessThanOrEqual(s.height);expect(b.y).toBeGreaterThanOrEqual(0)}
 await page.locator('[data-action="catalog-demo"]').click();await page.waitForTimeout(1000);
 await page.screenshot({path:`${SHOTS}/${s.name}-catalogo.png`});
 const main=await fits('main');expect(main.over).toBeLessThanOrEqual(0);
 await expect(page.locator('.game-card')).toHaveCount(12);
 const last=await page.locator('.surprise').boundingBox();expect(last.y+last.height).toBeLessThanOrEqual(s.height);
 await page.locator('[data-id="turbo"]').click();await page.waitForTimeout(700);await page.screenshot({path:`${SHOTS}/${s.name}-preparo.png`});
 await page.locator('[data-action="start"]').click();await page.waitForTimeout(3300);await page.screenshot({path:`${SHOTS}/${s.name}-partida.png`});
 expect(await page.locator('.play').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(0);
 expect(errors).toEqual([]);
});

test('fonte embutida carrega com e sem internet',async({page,context})=>{
 const loaded=()=>page.evaluate(async()=>{await document.fonts.load('700 20px Fredoka','Começar');await document.fonts.ready;return [...document.fonts].some(f=>f.family==='Fredoka'&&f.status==='loaded')});
 await page.goto('/');expect(await loaded()).toBe(true);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();
 await context.setOffline(true);await page.reload();expect(await loaded()).toBe(true);await context.setOffline(false);
});

test('tela vertical pede para girar',async({page})=>{
 await page.setViewportSize({width:800,height:1280});await page.goto('/');
 await expect(page.getByText('Gire a tela para jogar na horizontal.')).toBeVisible();
});

test('campeonato fica legível no tablet',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.goto('/');await page.waitForTimeout(2200);
 await page.locator('[data-action="setup"]').click();await page.waitForTimeout(600);await page.screenshot({path:`${SHOTS}/setup.png`});
 await page.locator('input[value="individual"]').check();
 await page.locator('#names').fill('Ana\nBia\nCaio\nDani\nEdu\nFlor\nGabi\nHugo');await page.getByRole('button',{name:'Sortear confrontos'}).click();
 const ask=page.locator('#yes');if(await ask.isVisible().catch(()=>false))await ask.click();
 await expect(page.locator('.bracket')).toBeVisible();await page.waitForTimeout(600);await page.screenshot({path:`${SHOTS}/chave.png`});
});
