import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEdfConfig} from '../edf-menu.js';
import {createEdfDuel,drawEdfTurn,commitEdfTurn,validateEdfDuel,saveEdfDuel,loadEdfDuel} from '../edf-duel.js';

const teams=(count=2,names=4)=>Array.from({length:count},(_,i)=>({name:'Equipe '+i,students:Array.from({length:names},(_,j)=>'Aluno '+i+'-'+j)}));

test('configuração do menu EDF: padrão, salvamento antigo sem ano e salvamento por ano',()=>{
 const fresh=parseEdfConfig(null);
 assert.equal(fresh.grade,7);assert.deepEqual(fresh.topics,['ginastica','aventura','lutas']);assert.deepEqual(fresh.names,['Faísca','Pipo']);assert.equal(fresh.gameId,'edf');assert.equal(fresh.solo,false);
 const legacy=parseEdfConfig({topics:['lutas'],solo:true,gameId:'forca',names:[' Ana ','']});
 assert.equal(legacy.grade,7);assert.deepEqual(legacy.topics,['lutas']);assert.deepEqual(legacy.topicsByGrade[7],['lutas']);assert.equal(legacy.solo,true);assert.equal(legacy.gameId,'forca');assert.deepEqual(legacy.names,['Ana','Pipo']);
 const nine=parseEdfConfig({grade:9,topics:['e9-lutas'],topicsByGrade:{9:['e9-lutas'],8:['e8-rede'],6:['ginastica']},names:['A','B']});
 assert.equal(nine.grade,9);assert.deepEqual(nine.topics,['e9-lutas']);assert.deepEqual(nine.topicsByGrade[8],['e8-rede']);assert.equal(nine.topicsByGrade[6],undefined,'unidade de outro ano é ignorada');
 const mixed=parseEdfConfig({grade:6,topics:['ginastica'],names:['A','B']});
 assert.deepEqual(mixed.topics,['e6-corpo','e6-aventura','e6-lutas'],'unidades inválidas voltam ao padrão do ano');
 assert.equal(parseEdfConfig({grade:99,topics:['lutas'],names:['A','B']}).grade,7);
 assert.equal(parseEdfConfig({topics:['lutas'],names:['só um']}).grade,7);
});

test('campeonato EDF: ano padrão 7, ano guardado como última chave, ano inválido e unidades de outro ano são recusados',()=>{
 const old=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas']});
 assert.equal(old.grade,7);assert.equal(Object.keys(old).at(-1),'mode');assert.equal(old.mode,'edf');
 const eight=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['e8-rede'],grade:8});
 assert.equal(eight.grade,8);assert.deepEqual(eight.topics,['e8-rede']);
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['e8-rede'],grade:5}),/Ano inválido/);
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas'],grade:8}),/ao menos um tema/);
});

test('campeonato EDF salvo sem ano (versão anterior) continua válido e vira 7º ano; com ano percorre a validação inteira',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
 const state=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas','ginastica']});drawEdfTurn(state,()=>0);
 const legacy=JSON.parse(JSON.stringify(state));delete legacy.grade;
 const migrated=validateEdfDuel(legacy);assert.equal(migrated.grade,7);assert.deepEqual(migrated.topics,['ginastica','lutas']);
 const six=createEdfDuel({teams:teams(3),rounds:3,games:['forca','search'],topics:['e6-lutas'],grade:6});
 drawEdfTurn(six,()=>0);commitEdfTurn(six,{scores:[1000,0],winnerSide:0});drawEdfTurn(six,()=>0);
 saveEdfDuel(six,storage);const loaded=loadEdfDuel(storage);assert.equal(loaded.grade,6);assert.deepEqual(loaded,six);
 const forged=structuredClone(six);forged.grade=8;assert.throws(()=>validateEdfDuel(forged));
});

test('Modo Duelo Normal: usa os jogos normais, não precisa de unidades e vale o ano padrão',()=>{
 const state=createEdfDuel({teams:teams(),rounds:3,games:['turbo','bike','archery'],mode:'normal',difficulty:'easy'});
 assert.equal(state.mode,'normal');assert.deepEqual(state.topics,[]);assert.equal(state.grade,7);assert.equal(state.difficulty,'easy');
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['ordem'],mode:'normal'}),/jogo válido/,'o Ordene a Sequência só existe no EDF');
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['rota'],mode:'normal'}),/jogo válido/,'o Rota do EMTI está desativado');
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['turbo'],mode:'outro'}),/Normal ou EDF/);
});

test('Modo Duelo Normal: sorteia, confirma e recarrega do armazenamento',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
 let state=createEdfDuel({teams:teams(2,4),rounds:2,games:['turbo','bike'],mode:'normal',difficulty:'hard'});
 drawEdfTurn(state);commitEdfTurn(state,{scores:[3000,1000],winnerSide:0});
 drawEdfTurn(state);commitEdfTurn(state,{scores:[1000,2000],winnerSide:1});
 saveEdfDuel(state,storage);const back=loadEdfDuel(storage);
 assert.equal(back.mode,'normal');assert.equal(back.difficulty,'hard');assert.ok(back.champion);assert.equal(back.history.length,2);
});

test('Modo Duelo: salvamento antigo sem modo vira EDF',()=>{
 const state=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas']}),old={...state};delete old.mode;
 assert.equal(validateEdfDuel(old).mode,'edf');
});
