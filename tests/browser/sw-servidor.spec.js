import {test,expect} from '@playwright/test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('todos os arquivos do cache offline são servidos com sucesso',async({request})=>{
 const context={self:{addEventListener(){}},caches:{}};vm.createContext(context);
 vm.runInContext(readFileSync('sw.js','utf8')+';\nglobalThis.__FILES=FILES;',context);
 const failures=[];
 for(const file of context.__FILES){const response=await request.get(file.replace(/^\.\//,'/'));if(!response.ok())failures.push(`${file}: ${response.status()}`)}
 expect(failures).toEqual([]);
});
