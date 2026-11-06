import test from 'node:test';
import assert from 'node:assert/strict';
import {seededRandom} from '../games.js';
import {GRID,PICTURES,AREA,BOARD,geometry,buildEdges,edgePath,pieceEdges,piecePath,scatter} from '../jigsaw.js';
import {balanceRound} from '../mathgames.js';
import {raceWords,syllablePool} from '../wordgames.js';
import {SYLLABLE_WORDS,MISTAKES,PORTUGUES,mathQuestions,learningBank} from '../learning.js';

const shuffle=(values,rng)=>{const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
const numbers=text=>(text.match(/-?\d+(?:\.\d+)?/g)??[]).map(Number);
const pairs=list=>{const out=[];for(let i=0;i+1<list.length;i+=2)out.push([list[i],list[i+1]]);return out};
const close=(p,q)=>Math.abs(p[0]-q[0])<0.02&&Math.abs(p[1]-q[1])<0.02;
// Pontos do contorno de uma aresta, começando no ponto de partida.
const trace=(x0,y0,d)=>[[x0,y0],...pairs(numbers(d))];

test('quebra-cabeça: peças vizinhas têm o mesmo contorno, um saliente e o outro reentrante',()=>{
 for(const level of [1,2,3])for(let seed=1;seed<=30;seed++){
  const [cols,rows]=GRID[level];const geo=geometry(cols,rows,PICTURES[0]);const edges=buildEdges(cols,rows,seededRandom(`s${seed}`));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const mine=pieceEdges(r,c,geo,edges);
   if(c<cols-1){
    const next=pieceEdges(r,c+1,geo,edges);
    assert.equal(mine.right.sign,-next.left.sign);assert.ok(Math.abs(mine.right.shift+next.left.shift)<1e-9);
    // A direita desta peça, de cima para baixo, é a esquerda da vizinha, de baixo para cima, invertida.
    const x=(c+1)*geo.cw,y0=r*geo.ch,y1=y0+geo.ch;
    const a=trace(x,y0,edgePath(x,y0,x,y1,mine.right.sign,mine.right.shift));
    const b=trace(x,y1,edgePath(x,y1,x,y0,next.left.sign,next.left.shift)).reverse();
    assert.equal(a.length,b.length);a.forEach((p,i)=>assert.ok(close(p,b[i]),`nível ${level} seed ${seed} (${r},${c}) ponto ${i}`));
   }
   if(r<rows-1){
    const below=pieceEdges(r+1,c,geo,edges);
    assert.equal(mine.bottom.sign,-below.top.sign);assert.ok(Math.abs(mine.bottom.shift+below.top.shift)<1e-9);
    const y=(r+1)*geo.ch,x0=c*geo.cw,x1=x0+geo.cw;
    const a=trace(x1,y,edgePath(x1,y,x0,y,mine.bottom.sign,mine.bottom.shift));
    const b=trace(x0,y,edgePath(x0,y,x1,y,below.top.sign,below.top.shift)).reverse();
    a.forEach((p,i)=>assert.ok(close(p,b[i]),`nível ${level} seed ${seed} baixo (${r},${c}) ponto ${i}`));
   }
   if(c===0)assert.equal(mine.left.sign,0);
   if(r===0)assert.equal(mine.top.sign,0);
   if(c===cols-1)assert.equal(mine.right.sign,0);
   if(r===rows-1)assert.equal(mine.bottom.sign,0);
  }
 }
});

test('quebra-cabeça: o recorte é igual para a mesma semente e cada peça cabe na margem prevista',()=>{
 const geo=geometry(4,3,PICTURES[0]);
 const a=buildEdges(4,3,seededRandom('x')),b=buildEdges(4,3,seededRandom('x'));
 assert.deepEqual(a,b);assert.notDeepEqual(a,buildEdges(4,3,seededRandom('y')));
 for(let r=0;r<3;r++)for(let c=0;c<4;c++){
  const path=piecePath(r,c,geo,a);
  for(const [x,y] of pairs(numbers(path))){
   assert.ok(x>=c*geo.cw-geo.pad-0.5&&x<=(c+1)*geo.cw+geo.pad+0.5,`x fora da margem ${x}`);
   assert.ok(y>=r*geo.ch-geo.pad-0.5&&y<=(r+1)*geo.ch+geo.pad+0.5,`y fora da margem ${y}`);
  }
  assert.ok(path.startsWith('M')&&path.endsWith('Z'));
 }
});

test('quebra-cabeça: peças espalhadas ficam dentro da área, fora do quadro e mudam com a semente',()=>{
 for(const level of [1,2,3])for(let seed=1;seed<=20;seed++){
  const [cols,rows]=GRID[level];const geo=geometry(cols,rows,PICTURES[0]);const spots=scatter(cols*rows,geo,seededRandom(`l${seed}`));
  assert.equal(spots.length,cols*rows);
  for(const s of spots){
   assert.ok(s.x>=0&&s.y>=0&&s.x<=AREA.w-geo.pw+0.001&&s.y<=AREA.h-geo.ph+0.001,JSON.stringify(s));
   const insideBoard=s.x<BOARD.x+geo.bw&&s.x+geo.pw>BOARD.x&&s.y<BOARD.y+geo.bh&&s.y+geo.ph>BOARD.y;
   assert.equal(insideBoard,false,`peça sobre o quadro ${JSON.stringify(s)}`);
  }
  assert.notDeepEqual(spots,scatter(cols*rows,geo,seededRandom(`l${seed+99}`)));
 }
});

test('balança: sempre existe uma combinação exata e os pesos não repetem o número',()=>{
 for(const level of [1,2,3])for(let seed=0;seed<300;seed++){
  const {target,tiles}=balanceRound(level,seededRandom(`b${level}${seed}`),shuffle);
  assert.equal(tiles.length,(level===1?2:3)+2);assert.equal(new Set(tiles.map(t=>t.id)).size,tiles.length);
  assert.ok(tiles.every(t=>t.value>=2&&t.value<target),`peso inválido ${JSON.stringify(tiles)} para ${target}`);
  let ok=false;
  for(let mask=1;mask<1<<tiles.length&&!ok;mask++){let sum=0;tiles.forEach((t,i)=>{if(mask&(1<<i))sum+=t.value});ok=sum===target}
  assert.ok(ok,`sem solução: ${target} com ${tiles.map(t=>t.value)}`);
 }
});

test('balance generation terminates even with a constant random source',()=>{
 for(const level of [1,2,3])for(const n of [0,0.5,0.999]){
  const round=balanceRound(level,()=>n,shuffle);
  assert.equal(round.tiles.length,(level===1?2:3)+2);
  assert.ok(round.tiles.every(t=>t.value>=2&&t.value<round.target));
 }
});

test('learning banks only use the requested level, including after progression',()=>{
 for(const level of [1,2,3]){
  const bank=learningBank(level,seededRandom('progression'));
  assert.ok(bank.length>=24);assert.ok(bank.every(q=>q.level===level));
 }
});

test('sílabas: cada palavra fecha com suas sílabas e há palavras em todos os níveis',()=>{
 for(const w of SYLLABLE_WORDS){assert.equal(w.syllables.join(''),w.word);assert.ok(w.syllables.every(s=>s.length>=1));assert.ok(w.hint.length>=6)}
 assert.equal(new Set(SYLLABLE_WORDS.map(w=>w.word)).size,SYLLABLE_WORDS.length);
 for(const level of [1,2,3])assert.ok(syllablePool(level).length>=8,`nível ${level}`);
});

test('caça-erro: cada frase tem exatamente uma palavra errada e a correção é diferente',()=>{
 assert.ok(MISTAKES.length>=24);
 for(const m of MISTAKES){
  const wrong=m.tokens.filter(t=>t.wrong);assert.equal(wrong.length,1,m.tokens.map(t=>t.text).join(' '));
  assert.notEqual(wrong[0].text.replace(/[.,!?]$/,''),m.right);assert.ok(m.right.length>=4);
 }
 for(const level of [1,2,3])assert.ok(MISTAKES.filter(m=>level===1?m.level<=2:level===3?m.level>=2:true).length>=10);
});

test('português e contas: quatro opções diferentes, resposta válida e conta conferida',()=>{
 for(const q of PORTUGUES){assert.equal(new Set(q.options).size,4);assert.equal(q.answer,0);assert.ok(q.explanation.length>10)}
 const calc=expr=>Function(`"use strict";return (${expr.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/')})`)();
 let checked=0;
 for(const level of [1,2,3])for(let seed=0;seed<20;seed++){
  for(const q of learningBank(level,seededRandom(`q${level}${seed}`))){
   assert.equal(new Set(q.options).size,4,q.question);assert.ok(q.answer>=0&&q.answer<4);
   const m=q.question.match(/^([\d\s+−×÷()]+)= \?$/);
   if(m){assert.equal(Number(q.options[q.answer]),calc(m[1]),q.question);checked++}
  }
 }
 assert.ok(checked>200);
 for(let seed=0;seed<30;seed++){const list=mathQuestions(3,seededRandom(`z${seed}`),40);assert.equal(new Set(list.map(q=>q.question)).size,list.length)}
});

test('palavra secreta em disputa: os dois lados recebem as mesmas nove palavras',()=>{
 const bank=()=>['MARCA','IDEIA','META','CURSO','MIDIA','ETICA','EQUIPE','SLOGAN','PUBLICO','PROJETO','PESQUISA','CAMPANHA'].map(word=>({word,hint:'x'}));
 const ctx=side=>({level:2,seed:42,side,wordBank:bank,shuffle,seededRandom});
 const left=raceWords(ctx(0)),right=raceWords(ctx(1));
 assert.deepEqual(left,right);assert.equal(left.length,9);assert.equal(new Set(left.map(w=>w.word)).size,9);
 assert.notDeepEqual(left,raceWords({...ctx(0),seed:43}));
});
