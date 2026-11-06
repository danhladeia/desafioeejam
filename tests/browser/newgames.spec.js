import {test,expect} from '@playwright/test';

// Joga de verdade, com o mouse, cada jogo novo dentro de uma partida livre.
const SHOTS='art-check-results/legacy-agent/newgames';
test.use({reducedMotion:'no-preference'});
test.beforeEach(async({page})=>{await page.clock.install()});

async function startGame(page,id,difficulty='normal'){
 await page.addInitScript(level=>{localStorage.setItem('eejam-prefs',JSON.stringify({difficulty:level,sound:false,music:false}))},difficulty);
 await page.goto('/');await page.clock.runFor(2400);
 await page.locator('[data-action="catalog-demo"]').click();
 await page.locator(`[data-id="${id}"]`).click();
 await page.locator('[data-action="start"]').click();
 await page.clock.runFor(2900);
 await expect(page.locator('#countdown')).toHaveCount(0,{timeout:8000});
 await page.clock.runFor(300);
}
async function drag(page,from,to,steps=5){
 await page.mouse.move(from.x,from.y);await page.mouse.down();
 await page.mouse.move((from.x+to.x)/2,(from.y+to.y)/2,{steps:3});await page.mouse.move(to.x,to.y,{steps});await page.mouse.up();
}
const center=box=>({x:box.x+box.width/2,y:box.y+box.height/2});
const fitsBoard=async(page,name)=>{for(const i of [0,1]){const o=await page.locator(`#board-${i}`).evaluate(e=>e.scrollHeight-e.clientHeight);expect(o,`${name}: arena ${i} rola ${o}px`).toBeLessThanOrEqual(1)}};
// Host points prioritize correct answers; speed is a bounded cumulative tiebreaker.
const hud=(page,i)=>page.evaluate(i=>{
 const text=document.querySelector(`#accuracy-${i}`).textContent;
 return {correct:Number(text.match(/(\d+) acertos/)[1]),bonus:Number(text.match(/velocidade: (\d+)/)[1]),points:Number(document.querySelector(`#score-${i}`).textContent)};
},i);
const score=async(page,i)=>(await hud(page,i)).correct;
async function expectScore(page,i,correct,{speed=true}={}){
 await expect.poll(()=>score(page,i)).toBe(correct);
 const state=await hud(page,i);
 expect(state.bonus).toBeGreaterThanOrEqual(0);expect(state.bonus).toBeLessThanOrEqual(speed?correct*20:0);
 expect(state.points).toBe(correct*1000+state.bonus);
 await expect(page.locator(`#board-${i} .game-progression`)).toContainText(`${correct} acertos`);
}
async function expectResult(page,counts,{speed=true}={}){
 await expect(page.locator('.result')).toBeVisible();
 await expect(page.locator('.accuracy-result')).toHaveText(`${counts[0]} × ${counts[1]} acertos`);
 const points=(await page.locator('.result-scores b').allTextContents()).map(Number);
 for(let i=0;i<2;i++){expect(points[i]).toBeGreaterThanOrEqual(counts[i]*1000);expect(points[i]).toBeLessThanOrEqual(counts[i]*(speed?1020:1000))}
}
const findWord=(read,word)=>{const size=Math.sqrt(read.letters.length);for(let r=0;r<size;r++)for(let c=0;c<size;c++)for(const dr of [-1,0,1])for(const dc of [-1,0,1]){if(!dr&&!dc)continue;const cells=[...word].map((_,i)=>[r+dr*i,c+dc*i]);if(cells.every(([row,col],i)=>row>=0&&row<size&&col>=0&&col<size&&read.letters[row*size+col]===word[i]))return [r*size+c,cells.at(-1)[0]*size+cells.at(-1)[1]]}return null};

test('quebra-cabeça: arrastar cada peça até o quadro encaixa e termina a partida',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'puzzle');
 await expect(page.locator('#board-0 .jigsaw-piece')).toHaveCount(8);await expect(page.locator('#board-1 .jigsaw-piece')).toHaveCount(8);
 await page.screenshot({path:`${SHOTS}/quebra-cabeca-inicio.png`});await fitsBoard(page,'quebra-cabeça');
 // As peças começam espalhadas fora do quadro e as duas arenas têm o mesmo recorte.
 const shapes=await page.evaluate(()=>[0,1].map(s=>[...document.querySelectorAll(`#board-${s} .jigsaw-piece path`)].filter((_,i)=>i%3===0).map(p=>p.getAttribute('d')).join('|')));
 expect(shapes[0]).toBe(shapes[1]);
 const ghost=await page.locator('#board-0 .jigsaw-ghost').boundingBox();
 for(const box of await page.locator('#board-0 .jigsaw-piece').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}))){
  const overlapsBoard=box.x<ghost.x+ghost.width-4&&box.x+box.w>ghost.x+4&&box.y<ghost.y+ghost.height-4&&box.y+box.h>ghost.y+4;expect(overlapsBoard).toBe(false);
 }
 // Soltar longe do lugar não encaixa.
 const first=page.locator('#board-0 .jigsaw-piece[data-i="0"]');
 const grab=async(i)=>page.evaluate(i=>{const el=document.querySelector(`#board-0 .jigsaw-piece[data-i="${i}"]`),r=el.getBoundingClientRect();
  for(const fy of [.5,.4,.6,.3,.7])for(const fx of [.5,.4,.6,.3,.7]){const x=r.x+r.width*fx,y=r.y+r.height*fy;if(document.elementFromPoint(x,y)?.closest('.jigsaw-piece')===el)return {x,y,w:r.width,h:r.height,ox:r.width*fx,oy:r.height*fy}}return null},i);
 let g=await grab(0);const far={x:g.x+10,y:g.y+10};
 await drag(page,g,far);await expect(first).not.toHaveAttribute('data-placed','true');expect(await score(page,0)).toBe(0);
 for(let i=0;i<8;i++){
  g=await grab(i);expect(g,`peça ${i} sem ponto livre para pegar`).not.toBeNull();
  const tx=Number(await page.locator(`#board-0 .jigsaw-piece[data-i="${i}"]`).getAttribute('data-tx')),ty=Number(await page.locator(`#board-0 .jigsaw-piece[data-i="${i}"]`).getAttribute('data-ty'));
  const area=await page.locator('#board-0 .jigsaw-area').boundingBox(),k=area.width/1000;
  await drag(page,g,{x:area.x+tx*k+g.ox,y:area.y+ty*k+g.oy});
  if(i<7){await expect(page.locator(`#board-0 .jigsaw-piece[data-i="${i}"]`)).toHaveAttribute('data-placed','true');await expectScore(page,0,i+1,{speed:false});await page.clock.runFor(150)}
  if(i===3)await page.screenshot({path:`${SHOTS}/quebra-cabeca-meio.png`});
 }
 await expect(page.locator('.result')).toBeVisible({timeout:5000});
 await expectResult(page,[8,0],{speed:false});
 await page.screenshot({path:`${SHOTS}/quebra-cabeca-resultado.png`});
 expect(errors).toEqual([]);
});

for(const difficulty of ['normal','hard'])
test(`caça-palavras ${difficulty}: diagonais e inversas funcionam, e errar não pontua`,async({page})=>{
 // Seed 2 has diagonal and inverse placements in both sizes. Other seeds may
 // use the generator's cardinal-only fallback for crowded words.
 await page.addInitScript(()=>{
  const random=crypto.getRandomValues.bind(crypto);
  crypto.getRandomValues=array=>{random(array);if(array instanceof Uint32Array&&array.length===1)array[0]=2;return array};
 });
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'search',difficulty);
 await page.screenshot({path:`${SHOTS}/caca-palavras-inicio.png`});await fitsBoard(page,'caça-palavras');
 const read=await page.evaluate(()=>({letters:[...document.querySelectorAll('#board-0 .search-cell')].map(c=>c.textContent),words:[...document.querySelectorAll('#board-0 .word-slots .letter')].map(l=>l.textContent)}));
 expect(read.letters).toHaveLength(difficulty==='hard'?64:49);
 await expect(page.locator('#board-0 .search-grid')).toHaveAttribute('data-size',difficulty==='hard'?'8':'7');
 const size=Math.sqrt(read.letters.length),ends=read.words.map(word=>findWord(read,word));
 expect(ends.every(Boolean)).toBe(true);
 expect(ends.some(([a,b])=>Math.floor(a/size)!==Math.floor(b/size)&&a%size!==b%size)).toBe(true);
 expect(ends.some(([a,b])=>b<a)).toBe(true);
 const find=word=>findWord(read,word);
 const cell=i=>page.locator('#board-0 .search-cell').nth(i).boundingBox().then(center);
 // Errado: arrasta por um trecho que não é palavra.
 await drag(page,await cell(0),await cell(1));
 await expect(page.locator('#board-0 .game-search')).toHaveAttribute('aria-busy','true');
 await page.clock.runFor(1100);
 expect(await score(page,0)).toBe(0);
 let expected=0;
 for(const word of read.words){
  const ends=find(word);expect(ends,`${word} não achada na grade`).not.toBeNull();
  await page.clock.runFor(350);
  // Reverse alternate solutions to exercise both endpoint orders.
  await drag(page,await cell(ends[expected%2]),await cell(ends[1-expected%2]));
  expected++;
  if(expected<read.words.length){await expectScore(page,0,expected);}
  if(word===read.words[0])await page.screenshot({path:`${SHOTS}/caca-palavras-achou.png`});
 }
 await expect(page.locator('.result')).toBeVisible({timeout:5000});
 await expectResult(page,[read.words.length,0]);
 // Palavra de trás para frente também vale (tocar na última e depois na primeira letra).
});

test('caça-palavras: tocar na primeira e na última letra também funciona',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await startGame(page,'search');
 const read=await page.evaluate(()=>({letters:[...document.querySelectorAll('#board-0 .search-cell')].map(c=>c.textContent),words:[...document.querySelectorAll('#board-0 .word-slots .letter')].map(l=>l.textContent)}));
 const ends=findWord(read,read.words[0]);
 const cell=i=>page.locator('#board-0 .search-cell').nth(i);
 await cell(ends[1]).click();await page.clock.runFor(350);await cell(ends[0]).click();
 await expectScore(page,0,1);
});

test('palavra secreta: alfabeto inteiro, mesma palavra para os dois e vence quem chegar a 3',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'secret');
 await expect(page.locator('#board-0 .alphabet button')).toHaveCount(26);await expect(page.locator('#board-1 .alphabet button')).toHaveCount(26);
 await page.screenshot({path:`${SHOTS}/palavra-secreta-inicio.png`});await fitsBoard(page,'palavra secreta');
 const prompts=await page.evaluate(()=>[0,1].map(i=>document.querySelector(`#board-${i} .prompt`).textContent));
 expect(prompts[0]).toBe(prompts[1]);
 const wordsOf=()=>page.evaluate(async()=>{const m=await import('/wordgames.js');return [...m.races.values()][0].words.map(w=>w.word)});
 const words=await wordsOf();expect(new Set(words).size).toBe(9);
 const type=async(side,word)=>{for(const letter of new Set(word)){await page.locator(`#board-${side} .alphabet button`,{hasText:new RegExp(`^${letter}$`)}).click();await page.clock.runFor(340)}};
 // Rodada 1: o lado esquerdo acerta primeiro. O direito vê o aviso e ninguém mais pontua.
 await type(0,words[0]);
 await expectScore(page,0,1);
 await expect(page.locator('#board-1 .helper').last()).toContainText('adversário acertou primeiro');
 await expect(page.locator('#board-0 .game-progress')).toContainText('Você 1 × 0');
 await expect(page.locator('#board-1 .game-progress')).toContainText('Você 0 × 1');
 await page.screenshot({path:`${SHOTS}/palavra-secreta-ponto.png`});
 // Rodada 2: o lado direito acerta primeiro.
 await page.clock.runFor(1900);
 await type(1,words[1]);await expectScore(page,1,1,{speed:false});
 // Rodada 3 e 4: o esquerdo leva as duas e fecha em 3 × 1, antes do tempo.
 await page.clock.runFor(1900);await type(0,words[2]);await expectScore(page,0,2,{speed:false});
 await page.clock.runFor(1900);await type(0,words[3]);
 await expect(page.locator('.result')).toBeVisible({timeout:6000});
 await expect(page.locator('.result h1')).toContainText('Faísca');
 const final=(await page.locator('.result-scores b').allTextContents()).map(Number);
 expect(final).toEqual([3000,1000]);await expectResult(page,[3,1],{speed:false});
});

test('palavra secreta: sem combustível espera o adversário, e se os dois erram a rodada passa',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await startGame(page,'secret');
 const words=await page.evaluate(async()=>{const m=await import('/wordgames.js');return [...m.races.values()][0].words.map(w=>w.word)});
 const wrong=w=>[...'ZXQJKWYVUHBFGPMDCLNRS'].filter(l=>!w.includes(l)).slice(0,6);
 for(const l of wrong(words[0])){await page.locator('#board-0 .alphabet button',{hasText:new RegExp(`^${l}$`)}).click();await page.clock.runFor(340)}
 await expect(page.locator('#board-0 .helper').last()).toContainText('Aguarde');
 await expect(page.locator('#board-0 .alphabet button:not([disabled])')).toHaveCount(0);
 for(const l of wrong(words[0])){await page.locator('#board-1 .alphabet button',{hasText:new RegExp(`^${l}$`)}).click();await page.clock.runFor(340)}
 await expect(page.locator('#board-1 .helper').last()).toContainText('Ninguém acertou');
 await expect(page.locator('#board-0 .helper').last()).toContainText('Ninguém acertou');
 await page.clock.runFor(2000);
 expect(await score(page,0)+await score(page,1)).toBe(0);
 await expect(page.locator('#board-0 .game-progress')).toContainText('0 × 0');
 const next=await page.evaluate(()=>[0,1].map(i=>document.querySelector(`#board-${i} .prompt`).textContent));
 expect(next[0]).toBe(next[1]);
});

test('sílabas soltas: arrastar as sílabas na ordem forma a palavra',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'silabas');
 await page.screenshot({path:`${SHOTS}/silabas-inicio.png`});await fitsBoard(page,'sílabas');
 for(let round=0;round<2;round++){
  const info=await page.evaluate(async()=>{const m=await import('/learning.js');const hint=document.querySelector('#board-0 .prompt').textContent;return m.SYLLABLE_WORDS.find(w=>w.hint===hint).syllables});
  for(let slot=0;slot<info.length;slot++){
   const chip=page.locator('#board-0 .syl-tray .syl-chip',{hasText:new RegExp(`^${info[slot]}$`)}).first();
   const to=await page.locator('#board-0 .syl-slot').nth(slot).boundingBox();
   if(round===0)await drag(page,center(await chip.boundingBox()),center(to));else await chip.click();
   await page.clock.runFor(200);
  }
  await expectScore(page,0,round+1);
  if(round===0)await page.screenshot({path:`${SHOTS}/silabas-certo.png`});
  await page.clock.runFor(1200);
 }
 // Ordem errada: encher os espaços sem acertar limpa tudo.
 const n=await page.locator('#board-0 .syl-slot').count();
 const info=await page.evaluate(async()=>{const m=await import('/learning.js');return m.SYLLABLE_WORDS.find(w=>w.hint===document.querySelector('#board-0 .prompt').textContent).syllables});
 const wrongOrder=[...info.slice(1),info[0]];
 expect(wrongOrder).toHaveLength(n);expect(wrongOrder.join('')).not.toBe(info.join(''));
 const beforeWrong=await hud(page,0);
 for(const text of wrongOrder){await page.locator('#board-0 .syl-tray .syl-chip',{hasText:new RegExp(`^${text}$`)}).first().click();await page.clock.runFor(120)}
 await expect(page.locator('#board-0 .syl-slots')).toHaveClass(/bad/);await page.clock.runFor(1200);
 await expect(page.locator('#board-0 .syl-slot .syl-chip')).toHaveCount(0);
 expect(await hud(page,0)).toEqual(beforeWrong);
 await expectScore(page,1,0);
});

test('balança dos números: arrastar os pesos certos equilibra e pontua',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'balanca');
 await page.screenshot({path:`${SHOTS}/balanca-inicio.png`});await fitsBoard(page,'balança');
 for(let round=0;round<2;round++){
  const state=await page.evaluate(()=>({target:Number(document.querySelector('#board-0 .prompt').textContent.match(/\d+/)[0]),values:[...document.querySelectorAll('#board-0 .bal-tray .weight')].map(w=>Number(w.textContent))}));
  let pick=null;for(let m=1;m<1<<state.values.length&&!pick;m++){const idx=state.values.map((_,i)=>i).filter(i=>m&1<<i);if(idx.reduce((n,i)=>n+state.values[i],0)===state.target)pick=idx}
  expect(pick,`sem combinação para ${state.target} com ${state.values}`).not.toBeNull();
  const chosen=pick.map(i=>state.values[i]);
  for(const [n,value] of chosen.entries()){
   const chip=page.locator('#board-0 .bal-tray .weight',{hasText:new RegExp(`^${value}$`)}).first();
   const pan=await page.locator('#board-0 .bal-right').boundingBox();
   if(round===0)await drag(page,center(await chip.boundingBox()),center(pan));else await chip.click();
   await page.clock.runFor(250);
   if(n===0&&round===0)await page.screenshot({path:`${SHOTS}/balanca-peso.png`});
  }
  await expect(page.locator('#board-0 .bal-beam')).toHaveClass(/level/);
  await expectScore(page,0,round+1);
  if(round===0)await page.screenshot({path:`${SHOTS}/balanca-equilibrada.png`});
  await page.clock.runFor(1300);
 }
 expect(await score(page,1)).toBe(0);
});

test('caça-erro: tocar na palavra errada pontua e na certa não',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'erro');
 await page.screenshot({path:`${SHOTS}/caca-erro-inicio.png`});await fitsBoard(page,'caça-erro');
 const info=()=>page.evaluate(async()=>{const m=await import('/learning.js');const words=[...document.querySelectorAll('#board-0 .mistake-word')].map(b=>b.textContent);const hit=m.MISTAKES.find(x=>x.tokens.map(t=>t.text).join(' ')===words.join(' '));return {wrong:hit.tokens.findIndex(t=>t.wrong),right:hit.right}});
 let current=await info();
 const other=current.wrong===0?1:0;
 await page.locator('#board-0 .mistake-word').nth(other).click();
 await expect(page.locator('#board-0 .mistake-word').nth(other)).toHaveClass(/wrong/);expect(await score(page,0)).toBe(0);
 await page.clock.runFor(1200);
 await page.locator('#board-0 .mistake-word').nth(current.wrong).click();
 await expectScore(page,0,1);
 await expect(page.locator('#board-0 .helper').last()).toContainText(current.right);
 await page.screenshot({path:`${SHOTS}/caca-erro-certo.png`});
});

test('cabo de guerra: conta e português, acertar puxa a corda',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startGame(page,'rope');
 await page.screenshot({path:`${SHOTS}/cabo-de-guerra-inicio.png`});
 const answer=async(i)=>page.evaluate(async(i)=>{const m=await import('/learning.js');const q=document.querySelector(`#board-${i} .prompt`).textContent;
  const calc=e=>String(Function(`"use strict";return (${e.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/')})`)());
  let r;
  if((r=q.match(/^([\d\s+−×÷()]+)= \?$/)))return calc(r[1]);
  if((r=q.match(/tinha (\d+) .* mais (\d+)\./)))return String(+r[1]+ +r[2]);
  if((r=q.match(/Quanto é (\d+)% de (\d+)\?/)))return String(r[2]*r[1]/100);
  if((r=q.match(/Quanto é (\d+)\/(\d+) de (\d+)\?/)))return String(r[3]/r[2]*r[1]);
  if((r=q.match(/^(\d+) ao quadrado/)))return String(r[1]*r[1]);
  if((r=q.match(/2 elevado a (\d+)/)))return String(2**r[1]);
  if((r=q.match(/raiz quadrada de (\d+)/)))return String(Math.sqrt(+r[1]));
  if((r=q.match(/mede (\d+) cm por (\d+) cm\. Qual é a área/)))return `${r[1]*r[2]} cm²`;
  if((r=q.match(/mede (\d+) cm por (\d+) cm\. Qual é o perímetro/)))return `${2*(+r[1]+ +r[2])} cm`;
  const pt=m.PORTUGUES.find(p=>p.question===q);if(!pt)throw Error(`Questão não reconhecida: ${q}`);return pt.options[pt.answer]},i);
 const solved=[];
 for(let n=0;n<4;n++){
  const text=await page.locator('#board-0 .prompt').textContent();
  const right=await answer(0);
  await page.locator('#board-0 .answer',{hasText:new RegExp(`^${right.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)}).first().click();
  solved.push(text);await page.clock.runFor(1900);
 }
 expect(solved).toHaveLength(4);
 await expectScore(page,0,4);await expectScore(page,1,0);
 const marker=await page.locator('#rope-marker').evaluate(e=>parseFloat(e.style.left));
 expect(marker).toBeLessThan(50);
});

for(const s of [{name:'tablet-16x10',width:1280,height:800},{name:'tablet-4x3',width:1024,height:768}])
test(`jogos novos cabem na arena sem rolagem em ${s.name}`,async({page})=>{
 await page.setViewportSize({width:s.width,height:s.height});
 for(const id of ['puzzle','secret','search','silabas','balanca','erro','rope']){
  await startGame(page,id);await fitsBoard(page,`${id} em ${s.name}`);
  await page.screenshot({path:`${SHOTS}/${id}-${s.name}.png`});
 }
});
