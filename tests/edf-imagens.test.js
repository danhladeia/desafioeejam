import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {EDF_GRADES} from '../edf-anos.js';

const file=path=>readFileSync(new URL('../'+path,import.meta.url));
const sw=file('sw.js').toString('utf8');

test('cada ano tem as 12 figuras do glossário, com transparência real e o tamanho registrado',()=>{
 for(const info of EDF_GRADES){
  const names=Object.keys(info.imageSizes);assert.equal(names.length,12,`${info.grade}º`);
  for(const name of names){
   const png=file(`${info.imageDir}/${name}.png`);
   assert.equal(png.readUInt8(25),6,`${info.grade}º ${name}: não é RGBA`);
   assert.equal(png.readUInt32BE(16),info.imageSizes[name].w,`${info.grade}º ${name}: largura`);
   assert.equal(png.readUInt32BE(20),info.imageSizes[name].h,`${info.grade}º ${name}: altura`);
  }
 }
});

test('as figuras dos anos novos têm procedência registrada com a soma de verificação de cada arquivo',()=>{
 for(const info of EDF_GRADES.filter(item=>item.grade!==7)){
  const manifest=JSON.parse(file(`${info.imageDir}/proveniencia.json`).toString('utf8'));
  assert.match(manifest.source,new RegExp(`${info.grade}º ano`));assert.equal(manifest.images.length,12);
  for(const entry of manifest.images){
   assert.equal(entry.page,25);assert.ok(Object.hasOwn(info.imageSizes,entry.file.replace('.png','')));
   assert.equal(createHash('sha256').update(file(`${info.imageDir}/${entry.file}`)).digest('hex'),entry.sha256,entry.file);
  }
 }
});

test('as figuras dos anos novos entram no cache offline',()=>{
 for(const info of EDF_GRADES.filter(item=>item.grade!==7)){
  const folder=info.imageDir.split('/').pop();
  for(const name of Object.keys(info.imageSizes))assert.match(sw,new RegExp(`${folder}:\\[[^\\]]*'${name}'`),`${info.grade}º ${name} fora do sw.js`);
 }
});
