import test from 'node:test';
import assert from 'node:assert/strict';
import {EDF_VARIANTS,makeEdfGame} from '../edf-theme.js';
import {EDF_ORDEM_GAME} from '../edf-content.js';
import {UI_ICON_NAMES} from '../ui-art.js';
import {createEdfDuel} from '../edf-duel.js';

test('Ordene a Sequência é um jogo EDF com ícone existente, 90 segundos e regra própria',()=>{
 assert.equal(EDF_ORDEM_GAME.id,'ordem');assert.equal(EDF_ORDEM_GAME.duration,90);assert.ok(UI_ICON_NAMES.includes(EDF_ORDEM_GAME.icon));
 assert.ok(EDF_VARIANTS.ordem);assert.equal(EDF_VARIANTS.ordem.title,'Ordene a Sequência');assert.match(EDF_VARIANTS.ordem.rule,/Conferir/);
 assert.equal(Object.keys(EDF_VARIANTS).length,14);
});

test('a partida identifica o ano e guarda o recorde do Ordene a Sequência por ano e unidades',()=>{
 const game=makeEdfGame(EDF_ORDEM_GAME,['e8-sociedade'],8);
 assert.equal(game.subject,'edf');assert.equal(game.edfGrade,8);assert.equal(game.recordId,'edf8:e8-sociedade:ordem');assert.equal(game.duration,90);
 assert.equal(makeEdfGame(EDF_ORDEM_GAME,['lutas']).recordId,'edf:lutas:ordem');
});

test('o campeonato EDF aceita o Ordene a Sequência no sorteio',()=>{
 const teams=Array.from({length:2},(_,i)=>({name:'Equipe '+i,students:['A'+i,'B'+i]}));
 const state=createEdfDuel({teams,rounds:2,games:['ordem','forca'],topics:['e9-corpo'],grade:9});
 assert.deepEqual(state.games,['ordem','forca']);
});
