import test from 'node:test';
import assert from 'node:assert/strict';
import {GAMES,buildWordSearch,seededRandom,normalizeWord,searchPath,speedBonus} from '../games.js';
import {QUESTIONS,CAMPAIGNS,WORDS,WORD_HINTS,ACTIVITIES} from '../content.js';
test('catalog and educational content have usable, objective answers',()=>{
 assert.equal(GAMES.length,23);assert.equal(new Set(GAMES.map(g=>g.id)).size,23);assert.ok(GAMES.some(g=>g.id==='slice'));assert.ok(!GAMES.some(g=>['marketing','ideas'].includes(g.id)));
 assert.ok(QUESTIONS.length>=40);assert.ok(CAMPAIGNS.length>=12);
 for(const q of [...QUESTIONS,...CAMPAIGNS]){assert.equal(q.options.length,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert.equal(new Set(q.options).size,4);assert.ok(q.explain.length>10)}
 assert.ok(WORDS.length>=45);assert.ok(WORDS.every(word=>WORD_HINTS[word]?.length>15));assert.ok(ACTIVITIES.every(a=>[0,1,2].includes(a.category)));
 assert.equal(normalizeWord('AÇÃO'),'ACAO');
});

test('search uses scattered cardinal, diagonal and inverse directions without corrupting words',()=>{
 const directions=new Set(), layouts=new Set();
 for(let seed=0;seed<120;seed++){
  const board=buildWordSearch(['MARCA','EQUIPE','CURSO','IDEIA','META'],seededRandom(seed));
  for(const p of board.placements){
   directions.add(p.direction);layouts.add(p.cells.join(','));
   assert.deepEqual(searchPath(p.cells[0],p.cells.at(-1)),p.cells);
   assert.deepEqual(searchPath(p.cells.at(-1),p.cells[0]),[...p.cells].reverse());
   assert.equal(p.cells.map(c=>board.grid[Math.floor(c/7)][c%7]).join(''),p.word);
  }
  assert.ok(board.placements.some(p=>p.dr&&p.dc),'a diagonal is guaranteed');
  assert.ok(board.placements.some(p=>p.dr<0||p.dc<0),'an inverse direction is guaranteed');
 }
 assert.equal(directions.size,8);assert.ok(layouts.size>150);
 assert.deepEqual(searchPath(0,9),[],'no projected/wrapped path for an off-axis drag');
 assert.deepEqual(searchPath(-1,7),[]);
});

test('advanced search is reproducible on 8×8 and accepts long words in any entry position',()=>{
 const words=['META','IDEIA','PESQUISA','CAMPANHA','EQUIPE','CURSO'];
 for(let seed=0;seed<40;seed++){
  const a=buildWordSearch(words,seededRandom(seed),{size:8});
  assert.deepEqual(a,buildWordSearch(words,seededRandom(seed),{level:3}));
  assert.equal(a.grid.length,8);
  for(const p of a.placements)assert.equal(p.cells.map(c=>a.grid[Math.floor(c/8)][c%8]).join(''),p.word);
 }
 assert.throws(()=>buildWordSearch(['META','MÉTA']),RangeError);
 assert.throws(()=>buildWordSearch(['PESQUISA']),RangeError);
 assert.throws(()=>buildWordSearch(['META'],seededRandom(1),{size:6}),RangeError);
});

test('speed is bounded and strictly rewards shorter active solve time',()=>{
 assert.equal(speedBonus(0),20);assert.equal(speedBonus(999),20);
 assert.equal(speedBonus(1000),19);assert.equal(speedBonus(5000),15);
 assert.equal(speedBonus(10000),10);assert.equal(speedBonus(20000),0);assert.equal(speedBonus(90000),0);
 for(const g of GAMES)assert.match(g.icon,/^[a-z]+$/);
});
test('100 seeded word grids contain every requested word and repeat deterministically',()=>{
 const words=['MARCA','EQUIPE','CURSO','IDEIA','META'];
 for(let seed=0;seed<100;seed++){
  const a=buildWordSearch(words.map(word=>({word})),seededRandom(seed));
  assert.deepEqual(a,buildWordSearch(words.map(word=>({word})),seededRandom(seed)));
  assert.equal(a.grid.length,7);assert.ok(a.grid.every(row=>row.length===7));assert.equal(a.placements.length,5);
  for(const item of a.placements){assert.equal(item.cells.map(cell=>a.grid[Math.floor(cell/7)][cell%7]).join(''),item.word)}
 }
});
