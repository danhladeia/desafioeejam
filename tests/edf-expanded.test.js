import test from 'node:test';
import assert from 'node:assert/strict';
import {createEdfTheme,EDF_WORDS,EDF_MISTAKES,EDF_VARIANTS} from '../edf-theme.js';
import {EDF_TOPICS} from '../edf-content.js';
import {seededRandom} from '../games.js';
import {createEdfDuel,drawEdfTurn,redrawEdfStudent,commitEdfTurn,edfStandings,validateEdfDuel,saveEdfDuel,loadEdfDuel,addEdfStudents} from '../edf-duel.js';
const teams=(count,names=40)=>Array.from({length:count},(_,i)=>({name:'Equipe '+i,students:Array.from({length:names},(_,j)=>'Aluno '+i+'-'+j)}));
test('all thirteen EDF games have usable isolated content at every level and syllables rebuild their words',()=>{
 assert.equal(Object.keys(EDF_VARIANTS).length,13);
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 for(const w of EDF_WORDS)assert.equal(normalize(w.syllables.join('')),w.word,w.display);
 for(const topic of EDF_TOPICS){const t=createEdfTheme([topic.id]);assert.ok(t.words.length>=8);assert.ok(t.pictures.length);assert.ok(t.words.every(w=>w.topic===topic.id));for(const level of [1,2,3]){assert.ok(t.questions(level).length>=2);assert.ok(t.mistakes.filter(m=>m.level===level).length>=2);assert.ok(t.syllables.some(w=>level===1?w.syllables.length===2:level===2?w.syllables.length===3:w.syllables.length>=4))}}
 for(const m of EDF_MISTAKES){assert.equal(m.tokens.filter(t=>t.wrong).length,1);assert.notEqual(m.tokens.find(t=>t.wrong).text,m.right)}
});
test('EDF qualifying appearances stay balanced for two through eight teams; final, game cycles and students survive restore',()=>{
 for(let n=2;n<=8;n++)for(const rounds of [5,10,15,20]){
  let s=createEdfDuel({teams:teams(n),rounds,games:['forca','search','memory'],topics:['lutas']});const rng=seededRandom(n*100+rounds),seen=new Set();
  for(let r=0;r<rounds;r++){
   const top=edfStandings(s).slice(0,2).map(t=>t.id).sort(),current=drawEdfTurn(s,rng);
   if(r===rounds-1)assert.deepEqual(current.sides.map(t=>t.teamId).sort(),top);
   else{const counts=s.teams.map(t=>s.stats[t.id].played+(current.sides.some(x=>x.teamId===t.id)?1:0));assert.ok(Math.max(...counts)-Math.min(...counts)<=1)}
   for(const side of current.sides){const key=side.teamId+':'+side.student;assert.ok(!seen.has(key));seen.add(key)}
   const selected=current.gameId;if(s.history.length&&s.games.length>1)assert.notEqual(selected,s.history.at(-1).gameId);
   commitEdfTurn(s,{scores:[1000+r,0],winnerSide:0});s=validateEdfDuel(JSON.parse(JSON.stringify(s)));
  }assert.equal(s.done,rounds);assert.equal(edfStandings(s)[0].id,s.champion);
 }
});
test('EDF redraw only changes its side, never recycles played or refused students, and failure is atomic',()=>{
 const s=createEdfDuel({teams:teams(2,2),rounds:5,games:['forca'],topics:['ginastica']});drawEdfTurn(s,()=>0);const other=structuredClone(s.current.sides[1]),game=s.current.gameId;redrawEdfStudent(s,0,()=>0);assert.deepEqual(s.current.sides[1],other);assert.equal(s.current.gameId,game);
 const before=JSON.stringify(s);assert.throws(()=>redrawEdfStudent(s,0,()=>0),/inéditos/);assert.equal(JSON.stringify(s),before);
 commitEdfTurn(s,{scores:[1000,0],winnerSide:0});drawEdfTurn(s,()=>0);commitEdfTurn(s,{scores:[1000,0],winnerSide:0});const exhausted=JSON.stringify(s);assert.throws(()=>drawEdfTurn(s),/inéditos/);assert.equal(JSON.stringify(s),exhausted);
 for(const team of s.teams)addEdfStudents(s,team.id,['Aluno extra '+team.id]);assert.ok(drawEdfTurn(s));assert.ok(validateEdfDuel(s));
});
test('EDF storage rejects malformed saves without deleting previous data and validates replayed results',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const s=createEdfDuel({teams:teams(3),rounds:5,games:['rope','edf'],topics:['aventura']});drawEdfTurn(s);saveEdfDuel(s,storage);assert.deepEqual(loadEdfDuel(storage),s);
 const forged=structuredClone(s);forged.stats[forged.teams[0].id].wins=10;assert.throws(()=>saveEdfDuel(forged,storage));assert.deepEqual(loadEdfDuel(storage),s);
 assert.throws(()=>createEdfDuel({teams:teams(8),rounds:2,games:['forca'],topics:['lutas']}),/ao menos/);
});
