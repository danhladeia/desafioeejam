import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function swData(){
 const context={self:{addEventListener(){}},caches:{}};vm.createContext(context);
 vm.runInContext(read('sw.js')+';\nglobalThis.__FILES=FILES;globalThis.__VERSION=VERSION;',context);
 return{files:context.__FILES,version:context.__VERSION};
}

test('todo arquivo do cache offline existe no projeto e os arquivos novos do EDF estão listados',()=>{
 const {files}=swData();
 assert.deepEqual(Array.from(files).filter(file=>file!=='./'&&!existsSync(new URL('../'+file.slice(2),import.meta.url))),[]);
 for(const required of ['./edf-anos.js','./edf-ano6.js','./edf-ano7.js','./edf-ano8.js','./edf-ano9.js','./edf-sequencia.js','./forca-boneco.js','./edf-content.js','./edf-theme.js','./edf-menu.js','./edf-game.js'])assert.ok(files.includes(required),required);
});

test('a versão do cache mudou e é a mesma que o app abre para conferir o modo offline',()=>{
 const {version}=swData();
 assert.equal(version,'eejam-v26-volei');
 assert.match(read('app.js'),new RegExp(`caches\\.open\\('${version}'\\)`));
});
