import {test,expect} from '@playwright/test';

// A clock-free host harness exercises createGame directly; no menus, countdowns
// or match timers can hide failures. The real production styles are loaded.
async function mount(page,{solo=false,difficulty='hard',width=1024,height=768}={}) {
  await page.setViewportSize({width,height});
  await page.goto('/server.js');
  await page.setContent(`<!doctype html><html><head><base href="http://127.0.0.1:4173/">
    ${['style.css','menu.css','duel.css','play.css','new-art.css','jigsaw-fix.css'].map(s=>`<link rel="stylesheet" href="${s}">`).join('')}
    <style>html{font-size:10px!important}body{display:block;margin:0!important;overflow:hidden}#harness{display:grid;grid-template-columns:${solo?'1fr':'1fr 1fr'};gap:24px;padding:20px;height:100vh;box-sizing:border-box}.board{width:100%;height:100%;padding:10px;min-width:0;overflow:visible}</style>
    </head><body><div id="harness">${[0,...(solo?[]:[1])].map(i=>`<div id="host-${i}" class="board"></div>`).join('')}</div></body></html>`);
  await page.evaluate(async({solo,difficulty})=>{
    const {createGame}=await import('/games.js');
    window.scores=[0,0];window.finishes=[0,0];window.games=[];window.awards=[];
    for(let side=0;side<(solo?1:2);side++) {
      const game=createGame({id:'puzzle',el:document.querySelector(`#host-${side}`),side,seed:71,difficulty,
        onScore:(n,metadata)=>{window.scores[side]+=n;window.awards.push({side,delta:n,...metadata})},onFinish:()=>window.finishes[side]++});
      window.games.push(game);game.start();
    }
  },{solo,difficulty});
  await expect.poll(()=>page.locator('#host-0 .jigsaw-area').evaluate(e=>e.clientWidth)).toBeGreaterThan(0);
  // Wait until ResizeObserver has applied the final fit, not just initial layout.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function grab(page,i,side=0,prefix='#host-') {
  return page.evaluate(({i,side,prefix})=>{
    const el=document.querySelector(`${prefix}${side} .jigsaw-piece[data-i="${i}"]`),r=el.getBoundingClientRect();
    for(const fy of [.5,.35,.65,.25,.75,.45,.55]) for(const fx of [.5,.35,.65,.25,.75,.45,.55]) {
      const x=r.x+r.width*fx,y=r.y+r.height*fy;
      if(document.elementFromPoint(x,y)?.closest('.jigsaw-piece')===el)
        return {x,y,ox:r.width*fx,oy:r.height*fy,left:r.left,top:r.top};
    }
    return null;
  },{i,side,prefix});
}
async function destination(page,i,g,side=0,prefix='#host-') {
  return page.locator(`${prefix}${side} .jigsaw-piece[data-i="${i}"]`).evaluate((el,g)=>{
    const a=el.parentElement.getBoundingClientRect();
    return {x:a.x+Number(el.dataset.tx)*a.width/1000+g.ox,y:a.y+Number(el.dataset.ty)*a.height/700+g.oy};
  },g);
}
async function drag(page,g,to) {
  await page.mouse.move(g.x,g.y);await page.mouse.down();
  await page.mouse.move(to.x,to.y,{steps:5});await page.mouse.up();
}

for(const size of [{width:1024,height:768},{width:1280,height:800},{width:1920,height:1080}])
for(const solo of [false,true])
test(`hard puzzle ${solo?'solo':'duel'} ${size.width}x${size.height}: failed snap, exact crops, complete`,async({page})=>{
  await mount(page,{...size,solo});
  const metrics=await page.evaluate(()=>[...document.querySelectorAll('.jigsaw-area')].map(area=>{
    const a=area.getBoundingClientRect(),b=area.closest('.board').getBoundingClientRect();
    return {ratio:a.width/a.height,inside:a.left>=b.left&&a.right<=b.right+.5&&a.top>=b.top&&a.bottom<=b.bottom+.5,
      overflow:area.closest('.board').scrollHeight-area.closest('.board').clientHeight};
  }));
  // Browser layout quantizes fractional CSS lengths to 1/64px.
  for(const m of metrics){expect(m.ratio).toBeCloseTo(1000/700,4);expect(m.inside).toBe(true);expect(m.overflow).toBeLessThanOrEqual(1)}
  await expect(page.locator('#host-0 .jigsaw-piece')).toHaveCount(12);
  for(let i=0;i<12;i++)expect(await grab(page,i),`piece ${i} must be reachable before moving its neighbors`).not.toBeNull();
  if(!solo) {
    const shapes=await page.evaluate(()=>[0,1].map(s=>[...document.querySelectorAll(`#host-${s} .jigsaw-hit`)].map(p=>p.getAttribute('d'))));
    expect(shapes[0]).toEqual(shapes[1]);
  }
  let g=await grab(page,11);expect(g).not.toBeNull();
  await drag(page,g,{x:g.x+4,y:g.y+4});
  await expect(page.locator('#host-0 .jigsaw-piece[data-i="11"]')).not.toHaveAttribute('data-placed','true');
  expect(await page.evaluate(()=>scores)).toEqual([0,0]);
  // Highest-first ordering guarantees a free painted hit point despite overlaps.
  for(let i=11;i>=0;i--) {
    g=await grab(page,i);expect(g,`piece ${i} needs an exposed painted hit region`).not.toBeNull();
    await drag(page,g,await destination(page,i,g));
    const piece=page.locator(`#host-0 .jigsaw-piece[data-i="${i}"]`);
    await expect(piece).toHaveAttribute('data-placed','true');
    const alignment=await piece.evaluate(el=>{
      const ghost=el.parentElement.querySelector('.jigsaw-ghost').getBoundingClientRect();
      const image=el.querySelector('image').getScreenCTM();
      return {dx:image.e-ghost.left,dy:image.f-ghost.top};
    });
    expect(Math.abs(alignment.dx)).toBeLessThan(.1);expect(Math.abs(alignment.dy)).toBeLessThan(.1);
  }
  expect(await page.evaluate(()=>scores)).toEqual([12000,0]);
  const awards=await page.evaluate(()=>window.awards);
  expect(awards).toHaveLength(12);
  for(const award of awards){expect(award.side).toBe(0);expect(award.correctDelta).toBe(1);expect(award.bonus).toBe(0);expect(award.delta).toBe(1000)}
  expect(await page.evaluate(()=>finishes)).toEqual([1,0]);
  await expect(page.locator('#host-0 .jigsaw-area')).toHaveAttribute('data-complete','true');
});

test('puzzle cancellation releases capture; pause, lost capture, cancel and destroy never snap',async({page})=>{
  await mount(page);
  for(const reason of ['pause','lostpointercapture','pointercancel','blur','destroy']) {
    const g=await grab(page,11),piece=page.locator('#host-0 .jigsaw-piece[data-i="11"]');
    const start=await piece.evaluate(el=>({left:el.style.left,top:el.style.top}));
    await piece.evaluate(el=>el.addEventListener('pointerdown',e=>window.lastPointer=e.pointerId,{once:true}));
    await page.mouse.move(g.x,g.y);await page.mouse.down();
    const to=await destination(page,11,g);
    await page.mouse.move(to.x,to.y);
    expect(await piece.evaluate(el=>el.hasPointerCapture(window.lastPointer))).toBe(true);
    if(reason==='pause')await page.evaluate(()=>games[0].pause());
    else if(reason==='destroy')await page.evaluate(()=>games[0].destroy());
    else if(reason==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    else await piece.dispatchEvent(reason,{pointerId:await page.evaluate(()=>lastPointer)});
    if(reason!=='destroy') {
      await expect(piece).not.toHaveClass(/lifted/);
      expect(await piece.evaluate(el=>el.hasPointerCapture(window.lastPointer))).toBe(false);
      expect(await piece.evaluate(el=>({left:el.style.left,top:el.style.top}))).toEqual(start);
    }
    await page.mouse.up();
    expect(await page.evaluate(()=>scores)).toEqual([0,0]);
    if(reason==='pause')await page.evaluate(()=>games[0].resume());
  }
});

test('puzzle rejects cross-arena release and transparent padding hits',async({page})=>{
  await mount(page);
  const g=await grab(page,11),piece=page.locator('#host-0 .jigsaw-piece[data-i="11"]');
  const start=await piece.evaluate(el=>[el.style.left,el.style.top]);
  const opponent=await page.locator('#host-1 .jigsaw-ghost').boundingBox();
  await drag(page,g,{x:opponent.x+opponent.width/2,y:opponent.y+opponent.height/2});
  expect(await piece.evaluate(el=>[el.style.left,el.style.top])).toEqual(start);
  expect(await page.evaluate(()=>scores)).toEqual([0,0]);
  const padding=await piece.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {x:r.left+1,y:r.top+1,hit:document.elementFromPoint(r.left+1,r.top+1)?.closest('.jigsaw-piece')===el};
  });
  expect(padding.hit).toBe(false);
  await page.mouse.move(padding.x,padding.y);await page.mouse.down();
  await expect(piece).not.toHaveClass(/lifted/);await page.mouse.up();
});

test('touch keeps the grab offset and two fingers can drag independent pieces',async({page})=>{
  await mount(page);
  const session=await page.context().newCDPSession(page);
  const g=await grab(page,11),other=await grab(page,10);expect(other).not.toBeNull();
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x:g.x,y:g.y},{id:1,x:other.x,y:other.y}]});
  await expect(page.locator('.jigsaw-piece.lifted')).toHaveCount(2);
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:0,x:g.x-20,y:g.y+15},{id:1,x:other.x-10,y:other.y+10}]});
  const box=await page.locator('#host-0 .jigsaw-piece[data-i="11"]').boundingBox();
  expect(box.x-g.left).toBeCloseTo(-20,0);expect(box.y-g.top).toBeCloseTo(15,0);
  await page.evaluate(()=>games[0].pause());
  await expect(page.locator('.jigsaw-piece.lifted')).toHaveCount(0);
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(await page.evaluate(()=>scores)).toEqual([0,0]);
});

async function generic(page) {
  await mount(page,{solo:true});
  await page.evaluate(async()=>{
    games[0].destroy();
    const {attachDrag}=await import('/drag.js');
    const host=document.querySelector('#harness');
    host.innerHTML='<section id="a" style="position:relative;width:450px;height:500px"><div class="rotated" style="position:absolute;left:70px;top:90px;transform:rotate(17deg)"><button class="item" style="width:70px;height:60px;transform:scale(.95);z-index:3;transition:opacity 2s;touch-action:none">A</button></div><div class="target" style="position:absolute;top:300px;left:150px;width:150px;height:100px">target</div></section><section id="b" style="position:absolute;left:530px;top:30px;width:450px;height:500px"><button class="item" style="width:70px;height:60px;touch-action:none">B</button><div class="target" style="position:absolute;top:300px;left:150px;width:150px;height:100px">opponent</div></section>';
    window.calls=[];window.generic=[];
    for(const id of ['a','b']) {
      const root=document.getElementById(id),hooks=[];let cancel;
      const ctx={root,doc:document,active:()=>true,listen:(type,fn)=>root.addEventListener(type,fn),setCancel:fn=>cancel=fn,onDestroy:fn=>hooks.push(fn)};
      const dispose=attachDrag(ctx,{items:'.item',targets:'.target',onTap:item=>calls.push(['tap',id,item.textContent]),onDrop:(item,target)=>calls.push(['drop',id,target?.textContent??null])});
      generic.push({cancel:()=>cancel(),dispose,item:root.querySelector('.item'),ctx});
    }
  });
}
const middle=b=>({x:b.x+b.width/2,y:b.y+b.height/2});

test('generic drag retains callback API, screen offset through rotated parents and original styles',async({page})=>{
  await generic(page);
  const item=page.locator('#a .item'),before=await item.evaluate(el=>el.style.cssText);
  await item.click();expect(await page.evaluate(()=>calls)).toEqual([['tap','a','A']]);
  const from=middle(await item.boundingBox()),target=middle(await page.locator('#a .target').boundingBox());
  await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x+50,from.y+25);
  const moved=middle(await item.boundingBox());
  expect(moved.x-from.x).toBeCloseTo(50,0);expect(moved.y-from.y).toBeCloseTo(25,0);
  await page.mouse.move(target.x,target.y);await page.mouse.up();
  expect(await page.evaluate(()=>calls)).toEqual([['tap','a','A'],['drop','a','target']]);
  expect(await item.evaluate(el=>el.style.cssText)).toBe(before);
  await drag(page,middle(await item.boundingBox()),middle(await page.locator('#b .target').boundingBox()));
  expect(await page.evaluate(()=>calls.at(-1))).toEqual(['drop','a',null]);
  expect(await item.evaluate(el=>el.style.cssText)).toBe(before);
});

test('generic drag outside-root release and cancelled/disposed helpers clean up capture once',async({page})=>{
  await generic(page);
  const item=page.locator('#a .item');
  for(const reason of ['cancel','lostpointercapture','dispose']) {
    const from=middle(await item.boundingBox());
    await item.evaluate(el=>el.addEventListener('pointerdown',e=>window.lastPointer=e.pointerId,{once:true}));
    await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x+30,from.y+10);
    if(reason==='cancel')await page.evaluate(()=>generic[0].cancel());
    else if(reason==='dispose')await page.evaluate(()=>generic[0].dispose());
    else await item.dispatchEvent(reason,{pointerId:await page.evaluate(()=>lastPointer)});
    await expect(item).not.toHaveClass(/dragging/);
    expect(await item.evaluate(el=>el.hasPointerCapture(window.lastPointer))).toBe(false);
    await page.mouse.up();expect(await page.evaluate(()=>calls)).toEqual([]);
  }
  // The other helper remains usable after disposing the first.
  await page.locator('#b .item').click();expect(await page.evaluate(()=>calls)).toEqual([['tap','b','B']]);
});

for(const [difficulty,total] of [['easy',6],['normal',8]])
test(`${difficulty} puzzle 1024x768: each visible piece reaches its exact padded target`,async({page})=>{
  await mount(page,{difficulty});
  for(let i=0;i<total;i++)expect(await grab(page,i),`piece ${i} must be reachable before moving its neighbors`).not.toBeNull();
  for(let i=total-1;i>=0;i--) {
    const g=await grab(page,i);expect(g).not.toBeNull();
    await drag(page,g,await destination(page,i,g));
    await expect(page.locator(`#host-0 .jigsaw-piece[data-i="${i}"]`)).toHaveAttribute('data-placed','true');
  }
  expect(await page.evaluate(()=>scores)).toEqual([total*1000,0]);
  expect(await page.evaluate(()=>finishes)).toEqual([1,0]);
});

test('puzzle resize cancels a live grab, refits the area and still allows snapping',async({page})=>{
  await mount(page,{solo:true});
  const g=await grab(page,11);
  await page.mouse.move(g.x,g.y);await page.mouse.down();await page.mouse.move(g.x+20,g.y+10);
  await page.setViewportSize({width:1280,height:800});
  await expect(page.locator('.jigsaw-piece.lifted')).toHaveCount(0);
  await page.mouse.up();expect(await page.evaluate(()=>scores)).toEqual([0,0]);
  const resized=await grab(page,11);await drag(page,resized,await destination(page,11,resized));
  await expect(page.locator('#host-0 .jigsaw-piece[data-i="11"]')).toHaveAttribute('data-placed','true');
});

test('puzzle release coordinates work without a last move or pointer capture',async({page})=>{
  await mount(page);
  const g=await grab(page,11),to=await destination(page,11,g),piece=page.locator('#host-0 .jigsaw-piece[data-i="11"]');
  await piece.dispatchEvent('pointerdown',{pointerId:89,button:0,clientX:g.x,clientY:g.y});
  await piece.dispatchEvent('pointerup',{pointerId:89,button:0,clientX:to.x,clientY:to.y});
  await expect(piece).toHaveAttribute('data-placed','true');
  expect(await page.evaluate(()=>scores)).toEqual([1000,0]);
});

test('generic release outside both roots without capture reports one null target',async({page})=>{
  await generic(page);
  const item=page.locator('#a .item'),before=await item.evaluate(el=>el.style.cssText);
  await item.evaluate(el=>el.setPointerCapture=()=>{});
  await drag(page,middle(await item.boundingBox()),{x:1000,y:700});
  expect(await page.evaluate(()=>calls)).toEqual([['drop','a',null]]);
  expect(await item.evaluate(el=>el.style.cssText)).toBe(before);
  await expect(item).not.toHaveClass(/dragging/);
});

test('generic helpers sharing a context cancel independently; removed items never invoke callbacks',async({page})=>{
  await generic(page);
  await page.evaluate(async()=>{
    const {attachDrag}=await import('/drag.js');
    const ctx=generic[0].ctx,extra=document.createElement('button');
    extra.className='extra';extra.textContent='extra';extra.style.cssText='position:absolute;left:300px;top:30px;width:60px;height:60px;touch-action:none';ctx.root.append(extra);
    generic[0].extraDispose=attachDrag(ctx,{items:'.extra',targets:'.target',onTap:()=>calls.push(['extra'])});
    for(const [selector,id] of [['.item',45],['.extra',46]]) {
      const el=ctx.root.querySelector(selector),r=el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:id,button:0,clientX:r.x+30,clientY:r.y+30}));
      el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:id,clientX:r.x+50,clientY:r.y+50}));
    }
  });
  await expect(page.locator('#a .dragging')).toHaveCount(2);
  await page.evaluate(()=>generic[0].cancel());
  await expect(page.locator('#a .dragging')).toHaveCount(0);
  expect(await page.evaluate(()=>calls)).toEqual([]);
  await page.evaluate(()=>generic[0].dispose());
  await page.locator('#a .extra').click();expect(await page.evaluate(()=>calls)).toEqual([['extra']]);
  await page.evaluate(()=>{
    const el=generic[1].item,r=el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:90,button:0,clientX:r.x+30,clientY:r.y+30}));
    el.remove();window.dispatchEvent(new PointerEvent('pointerup',{pointerId:90,clientX:r.x+30,clientY:r.y+30}));
  });
  expect(await page.evaluate(()=>calls)).toEqual([['extra']]);
});

for(const solo of [false,true])
test(`production ${solo?'solo':'duel'} tablet: CSS loads, clean preview fits, awards exactly one answer per snap`,async({page})=>{
  await page.setViewportSize({width:1024,height:768});await page.goto('/');
  await page.locator(`[data-action="${solo?'solo':'catalog-demo'}"]`).click();
  if(solo)await page.locator('#solo-form button[type="submit"]').click();
  await page.locator('[data-id="puzzle"]').click();await page.locator('[data-action="start"]').click();
  await expect(page.locator('#countdown')).toHaveCount(0,{timeout:8000});
  await expect(page.locator('link[href="jigsaw-fix.css"]')).toHaveCount(1);
  const picture=page.locator('#board-0 .jigsaw-ghost img');
  await expect.poll(()=>picture.evaluate(img=>img.complete&&img.naturalWidth===1448&&img.naturalHeight===1086)).toBe(true);
  expect(await page.locator('#board-0').evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  const count=await page.locator('#board-0 .jigsaw-piece').count();
  for(let n=0;n<3;n++) {
    const i=count-1-n,g=await grab(page,i,0,'#board-');expect(g).not.toBeNull();
    await drag(page,g,await destination(page,i,g,0,'#board-'));
    await expect(page.locator(`#board-0 .jigsaw-piece[data-i="${i}"]`)).toHaveAttribute('data-placed','true');
    await expect(page.locator('#score-0')).toHaveText(String((n+1)*1000));
    await expect(page.locator('#accuracy-0')).toContainText(`${n+1} acertos`);
    await expect(page.locator('#accuracy-0')).toContainText('velocidade: 0');
    // Feedback adds one line on the first award, so wait for the refit.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  }
  if(!solo)await expect(page.locator('#score-1')).toHaveText('0');
});
