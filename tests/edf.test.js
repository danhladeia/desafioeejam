import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {EDF_CARDS,EDF_TOPICS,edfPool,edfRecordId,normalizeEdfTopics,edfImage} from '../edf-content.js';

test('EDF cards cover all topic levels with unique valid answers and auditable PDF references',()=>{
 assert.equal(EDF_CARDS.length,33);assert.equal(new Set(EDF_CARDS.map(card=>card.id)).size,33);
 for(const topic of EDF_TOPICS)for(const level of [1,2,3])assert.ok(edfPool([topic.id],level).length>=2);
 for(const card of EDF_CARDS){
  assert.equal(card.options.length,4);assert.equal(new Set(card.options).size,4);assert.ok(card.options[card.answer]);assert.ok(card.explain.length>20);
  if(card.source==='pdf'){assert.ok(card.page>=5&&card.page<=25);assert.notEqual(card.topic,'tabuleiro');assert.ok(existsSync(new URL('../'+edfImage(card.image),import.meta.url)))}
  else{assert.equal(card.page,null);assert.equal(card.topic,'tabuleiro')}
 }
});

test('EDF selection isolates topics, rejects empty sets and separates ranking identities',()=>{
 assert.throws(()=>normalizeEdfTopics([]));assert.throws(()=>normalizeEdfTopics(['unknown']));
 assert.deepEqual(normalizeEdfTopics(['lutas','ginastica','ginastica']),['ginastica','lutas']);
 assert.ok(edfPool(['tabuleiro'],3).every(card=>card.topic==='tabuleiro'&&card.level===3));
 assert.equal(edfRecordId(['lutas','ginastica']),edfRecordId(['ginastica','lutas']));
 assert.notEqual(edfRecordId(['lutas']),edfRecordId(['tabuleiro']));
});

test('EDF source PNGs preserve transparency and provenance, and are included in offline cache',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/visual/edf/proveniencia.json',import.meta.url),'utf8'));
 assert.equal(manifest.images.length,12);
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 for(const entry of manifest.images){const png=readFileSync(new URL('../assets/visual/edf/'+entry.file,import.meta.url));assert.equal(png.readUInt8(25),6);assert.equal(entry.page,25);assert.match(entry.sha256,/^[a-f0-9]{64}$/);assert.ok(sw.includes("'"+entry.file.replace('.png','')+"'"))}
 for(const file of ['edf-content.js','edf-game.js','edf-menu.js','edf.css'])assert.ok(sw.includes(file));
});
