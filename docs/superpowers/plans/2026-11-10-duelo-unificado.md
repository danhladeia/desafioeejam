# Modo Duelo unificado Implementation Plan

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Unificar o Modo Duelo e o campeonato EDF em um motor só, com escolha de conteúdo (Normal ou EDF), equipes e participantes cadastrados, sem token e sem as turmas fixas, mantendo o sorteio animado.

**Arquitetura:** O motor do campeonato EDF (`edf-duel.js` e `edf-duel-ui.js`) é renomeado para `duelo.js` e `duelo-ui.js` e ganha o campo `mode` (`normal` ou `edf`). A interface ganha o seletor de conteúdo. O duelo antigo de 3 turmas (`duel.js`, `duel-ui.js`, `duel.css`, `roster.js`) e o token são removidos, e o botão **Modo Duelo** abre o motor novo.

**Tecnologias:** JavaScript puro (módulos ES), `node:test`, Playwright.

**Especificação:** `docs/superpowers/specs/2026-11-10-duelo-unificado-design.md`

## Restrições Globais

- Sem token: nenhuma tela, modal ou código de senha no Modo Duelo.
- Sem turmas fixas nem nomes de alunos no código: `roster.js`, 9º A, 9º B, M. Braga e "Editar nomes" saem.
- Equipes: de 2 a 8, nome de até 40 caracteres, de 1 a 60 participantes por equipe, de até 40 caracteres, sem repetição na mesma equipe. Rodadas: de 1 a 40, a última é a final entre as duas melhores. Ninguém joga duas vezes.
- Conteúdo Normal: os 12 jogos de `GAMES`. Conteúdo EDF: os 14 jogos EDF, com ano (6º a 9º) e unidades.
- O sorteio animado dura 5 segundos (nomes girando, desacelerando, revelação do confronto) e a troca de um aluno só, o ranking animado de 2 segundos e a final continuam como estão. Com `prefers-reduced-motion`, a revelação é imediata.
- Compatibilidade: a chave de `localStorage` do duelo continua `eejam-edf-competition-v1`; um salvamento sem `grade` vale 7º ano e sem `mode` vale `edf`. O campo `grade` fica antes de `mode` no objeto, porque a validação compara os objetos pelo texto JSON, que depende da ordem das chaves.
- Na primeira abertura, o jogo apaga as chaves antigas do duelo: `eejam-duel-v1`, `eejam-braga-v1`, `eejam-names-v1-a`, `eejam-names-v1-b`, `eejam-names-v1-m`, `eejam-duel-games-v1`.
- Todo arquivo novo entra no cache de `sw.js`; a versão do cache sobe para `eejam-v17-duelo` em `sw.js` e `app.js`.
- Interface em português do Brasil, sem bibliotecas externas. Comandos no Git Bash (Windows). Mensagens de commit terminam com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Nenhum commit inclui `Conteudos EDF/` nem `Fotos do Evento/`.
- Há uma falha de navegador anterior a este trabalho, `tests/browser/newgames.spec.js:125` (Palavra Secreta), que deve ser ignorada.

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `duelo.js` | renomear de `edf-duel.js` e estender | Motor do duelo: equipes, sorteio, ranking, final, salvamento, campo `mode`, limpeza das chaves antigas |
| `duelo-ui.js` | renomear de `edf-duel-ui.js` e reescrever a configuração | Telas do duelo: seletor de conteúdo, equipes, sorteio animado, resultado, ranking, campeã |
| `app.js` | modificar | Liga `dueloUI` ao botão Modo Duelo, remove o duelo antigo, chama a limpeza das chaves antigas |
| `edf-menu.js` | modificar | Remove o botão "Equipes, alunos e sorteio" |
| `edf.css` | modificar | Estilos dos cartões de conteúdo (`.duelo-modo`) |
| `index.html` `sw.js` | modificar | Tiram `duel.css`, `duel.js`, `duel-ui.js`, `roster.js`; entram `duelo.js` e `duelo-ui.js`; versão `v17` |
| `duel.js` `duel-ui.js` `duel.css` `roster.js` | apagar | Duelo antigo de 3 turmas |
| `tests/duelo.test.js` | criar | Regras: modo, jogos por modo, migração, limpeza das chaves antigas |
| `tests/browser/duelo.spec.js` | criar | Telas do duelo nos dois conteúdos, sorteio, recusa de dados inválidos |
| `tests/duel.test.js` `tests/browser/duel.spec.js` | apagar | Testes do duelo antigo |
| `tests/edf-config.test.js` `tests/edf-expanded.test.js` `tests/edf-sequencia.test.js` `tests/browser/edf-expanded.spec.js` `tests/browser/edf-anos.spec.js` `tests/browser/edf-sequencia.spec.js` `tests/sw-files.test.js` | modificar | Novos nomes e novo ponto de entrada |
| `README.md` `MODO_EDF_7_ANO.md` | modificar | Documentação do fluxo novo |

---

### Tarefa 1: Motor `duelo.js` com modo Normal/EDF

**Arquivos:**
- Renomear: `edf-duel.js` → `duelo.js`, `edf-duel-ui.js` → `duelo-ui.js` (`git mv`)
- Modificar: `duelo.js` (reescrever), `duelo-ui.js`, `app.js`, `sw.js`, `tests/edf-config.test.js`, `tests/edf-expanded.test.js`, `tests/edf-sequencia.test.js`, `tests/browser/edf-expanded.spec.js`
- Criar: `tests/duelo.test.js`

**Interfaces:**
- Produz (`duelo.js`): `DUEL_KEY`, `LEGACY_KEYS`, `DUEL_MODES`, `createDuel({teams,rounds,games,topics,difficulty,grade,mode})`, `drawTurn`, `redrawStudent`, `commitTurn`, `standings`, `addStudents`, `validateDuel`, `saveDuel`, `loadDuel`, `clearLegacyDuelData(storage?)`.
- Nomes antigos → novos (a interface continua EDF-only nesta tarefa): `createEdfDuel→createDuel`, `drawEdfTurn→drawTurn`, `redrawEdfStudent→redrawStudent`, `commitEdfTurn→commitTurn`, `edfStandings→standings`, `validateEdfDuel→validateDuel`, `saveEdfDuel→saveDuel`, `loadEdfDuel→loadDuel`, `addEdfStudents→addStudents`, `EDF_DUEL_KEY→DUEL_KEY`, `createEdfDuelUI→createDueloUI`, `edfDuelUI→dueloUI`.
- O estado salvo ganha `mode` depois de `grade`. `createDuel` usa `mode='edf'` por padrão, então os testes existentes continuam valendo.

- [ ] **Passo 1: Escrever o teste que falha**

Crie `tests/duelo.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {GAMES} from '../games.js';
import {createDuel,drawTurn,commitTurn,validateDuel,saveDuel,loadDuel,clearLegacyDuelData,DUEL_KEY,LEGACY_KEYS,DUEL_MODES} from '../duelo.js';

const teams=(count=2,names=4)=>Array.from({length:count},(_,i)=>({name:'Equipe '+i,students:Array.from({length:names},(_,j)=>'Aluno '+i+'-'+j)}));
const memory=(initial={})=>{const data=new Map(Object.entries(initial));return{data,getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)}};

test('o duelo tem dois modos e a chave de salvamento continua a do campeonato EDF',()=>{
 assert.deepEqual(DUEL_MODES,['normal','edf']);assert.equal(DUEL_KEY,'eejam-edf-competition-v1');
 assert.deepEqual(LEGACY_KEYS,['eejam-duel-v1','eejam-braga-v1','eejam-names-v1-a','eejam-names-v1-b','eejam-names-v1-m','eejam-duel-games-v1']);
});

test('duelo Normal: sem unidades, ano 7 sem uso, só os 12 jogos do modo normal; ordem das chaves termina em grade e mode',()=>{
 const ids=GAMES.map(g=>g.id);assert.equal(ids.length,12);
 const normal=createDuel({teams:teams(),rounds:3,games:ids,topics:[],mode:'normal'});
 assert.equal(normal.mode,'normal');assert.deepEqual(normal.topics,[]);assert.equal(normal.grade,7);assert.deepEqual(Object.keys(normal).slice(-2),['grade','mode']);
 assert.throws(()=>createDuel({teams:teams(),rounds:3,games:['ordem'],topics:[],mode:'normal'}),/jogo válido/);
 assert.throws(()=>createDuel({teams:teams(),rounds:3,games:['edf'],topics:[],mode:'normal'}),/jogo válido/);
 assert.doesNotThrow(()=>createDuel({teams:teams(),rounds:3,games:['forca','search'],mode:'normal'}));
});

test('duelo EDF: jogos EDF (incluindo ordem), ano e unidades do ano; modo inválido recusado',()=>{
 const edf=createDuel({teams:teams(),rounds:3,games:['ordem','forca'],topics:['e8-rede'],grade:8,mode:'edf'});
 assert.equal(edf.mode,'edf');assert.equal(edf.grade,8);assert.deepEqual(edf.topics,['e8-rede']);
 assert.equal(createDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas']}).mode,'edf','padrão é EDF');
 assert.throws(()=>createDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas'],mode:'outro'}),/Modo de duelo inválido/);
 assert.throws(()=>createDuel({teams:teams(),rounds:3,games:['forca'],topics:['e8-rede'],grade:5,mode:'edf'}),/Ano inválido/);
 assert.throws(()=>createDuel({teams:teams(),rounds:3,games:['forca'],topics:[],mode:'edf'}),/ao menos um tema/);
});

test('salvamento: Normal e EDF fazem ida e volta; salvamento antigo sem grade e sem mode vira EDF do 7º ano',()=>{
 const storage=memory();
 const normal=createDuel({teams:teams(3),rounds:3,games:['forca','search'],mode:'normal'});drawTurn(normal,()=>0);commitTurn(normal,{scores:[1000,0],winnerSide:0});drawTurn(normal,()=>0);
 saveDuel(normal,storage);assert.deepEqual(loadDuel(storage),normal);
 const legacy=createDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas','ginastica']});drawTurn(legacy);
 const old=JSON.parse(JSON.stringify(legacy));delete old.grade;delete old.mode;
 const migrated=validateDuel(old);assert.equal(migrated.grade,7);assert.equal(migrated.mode,'edf');assert.deepEqual(Object.keys(migrated).slice(-2),['grade','mode']);
 const onlyNoMode=JSON.parse(JSON.stringify(legacy));delete onlyNoMode.mode;assert.equal(validateDuel(onlyNoMode).mode,'edf');
 const forged=structuredClone(normal);forged.mode='edf';assert.throws(()=>validateDuel(forged));
});

test('limpeza das chaves do duelo antigo apaga só elas e é segura sem armazenamento',()=>{
 const storage=memory({'eejam-duel-v1':'{}','eejam-braga-v1':'[]','eejam-names-v1-a':'[]','eejam-names-v1-b':'[]','eejam-names-v1-m':'[]','eejam-duel-games-v1':'[]','eejam-edf-v1':'{"keep":1}',[DUEL_KEY]:'{"keep":2}'});
 clearLegacyDuelData(storage);
 assert.deepEqual([...storage.data.keys()].sort(),['eejam-edf-v1',DUEL_KEY].sort());
 assert.doesNotThrow(()=>clearLegacyDuelData({removeItem(){throw Error('bloqueado')}}));
 assert.doesNotThrow(()=>clearLegacyDuelData(undefined));
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/duelo.test.js`
Expected: FAIL com `Cannot find module '.../duelo.js'`.

- [ ] **Passo 3: Renomear os dois arquivos**

```bash
git mv edf-duel.js duelo.js
git mv edf-duel-ui.js duelo-ui.js
```

- [ ] **Passo 4: Reescrever `duelo.js`**

Substitua o arquivo inteiro por (é o motor atual com os nomes novos, o campo `mode`, a validação de jogos por modo e a limpeza das chaves antigas):

```js
import {normalizeEdfTopics} from './edf-content.js';
import {isGrade,DEFAULT_GRADE} from './edf-anos.js';
import {EDF_VARIANTS} from './edf-theme.js';
import {GAMES} from './games.js';
export const DUEL_KEY='eejam-edf-competition-v1';
export const LEGACY_KEYS=['eejam-duel-v1','eejam-braga-v1','eejam-names-v1-a','eejam-names-v1-b','eejam-names-v1-m','eejam-duel-games-v1'];
export const DUEL_MODES=['normal','edf'];
const NORMAL_GAME_IDS=GAMES.map(game=>game.id);
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const clone=value=>structuredClone(value);
const fail=message=>{throw Error(message)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pairKey=ids=>[...ids].sort().join('|');
const pick=(list,rng)=>list[Math.min(list.length-1,Math.max(0,Math.floor(rng()*list.length)))];
function namesOf(names){
 if(!Array.isArray(names)||!names.length||names.length>60)fail('Cada equipe precisa de 1 a 60 alunos.');
 const result=names.map(n=>typeof n==='string'?n.replace(/\s+/g,' ').trim():'');
 if(result.some(n=>!n||n.length>40))fail('Use nomes ou apelidos de até 40 caracteres.');
 if(new Set(result.map(norm)).size!==result.length)fail('Há alunos repetidos na mesma equipe. Diferencie os homônimos com uma inicial.');
 return result;
}
export function createDuel({teams,rounds,games,topics,difficulty='normal',grade=DEFAULT_GRADE,mode='edf'}){
 if(!DUEL_MODES.includes(mode))fail('Modo de duelo inválido.');
 if(!Number.isInteger(rounds)||rounds<1||rounds>40)fail('Escolha de 1 a 40 rodadas, incluindo a final.');
 if(!Array.isArray(teams)||teams.length<2||teams.length>8)fail('Cadastre de 2 a 8 equipes.');
 const clean=teams.map((t,i)=>({id:'edf-team-'+i,name:typeof t.name==='string'?t.name.trim():'',students:namesOf(t.students)}));
 if(clean.length>2&&rounds<Math.ceil(clean.length/2)+1)fail(`Para ${clean.length} equipes, escolha ao menos ${Math.ceil(clean.length/2)+1} rodadas para que todas joguem antes da final.`);
 if(clean.some(t=>!t.name||t.name.length>40)||new Set(clean.map(t=>norm(t.name))).size!==clean.length)fail('Dê nomes diferentes às equipes, com até 40 caracteres.');
 const allowed=mode==='normal'?NORMAL_GAME_IDS:Object.keys(EDF_VARIANTS);
 if(!Array.isArray(games)||!games.length||games.some(id=>!allowed.includes(id))||new Set(games).size!==games.length)fail(mode==='normal'?'Selecione ao menos um jogo válido, sem repetições.':'Selecione ao menos um jogo EDF válido, sem repetições.');
 if(!['normal','hard'].includes(difficulty))fail('Dificuldade inválida.');
 if(mode==='edf'&&!isGrade(grade))fail('Ano inválido.');
 const year=mode==='edf'?Number(grade):DEFAULT_GRADE;
 return{version:1,createdAt:Date.now(),teams:clean,rounds,games:[...games],topics:mode==='edf'?normalizeEdfTopics(topics,year):[],difficulty,done:0,current:null,history:[],usedGames:[],lastGame:null,lastPair:null,champion:null,used:Object.fromEntries(clean.map(t=>[t.id,[]])),stats:Object.fromEntries(clean.map(t=>[t.id,{played:0,wins:0,points:0}])),grade:year,mode};
}
const compare=(a,b)=>(b.played?b.wins/b.played:0)-(a.played?a.wins/a.played:0)||b.wins-a.wins||b.points-a.points||a.name.localeCompare(b.name,'pt-BR');
export function standings(state){
 const table=state.teams.map(team=>({...state.stats[team.id],id:team.id,name:team.name})).sort(compare);
 if(state.champion){const final=state.history.at(-1),order=[state.champion,final.sides[1-final.winnerSide].teamId];table.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):2)-(order.includes(b.id)?order.indexOf(b.id):2))}
 return table;
}
function pairs(state){
 const all=[];for(let a=0;a<state.teams.length;a++)for(let b=a+1;b<state.teams.length;b++){
  const ids=[state.teams[a].id,state.teams[b].id],counts=state.teams.map(t=>state.stats[t.id].played+(ids.includes(t.id)?1:0));
  all.push({ids,spread:Math.max(...counts)-Math.min(...counts),load:ids.reduce((sum,id)=>sum+state.stats[id].played,0)});
 }
 const spread=Math.min(...all.map(p=>p.spread)),spreadPool=all.filter(p=>p.spread===spread),load=Math.min(...spreadPool.map(p=>p.load));
 let candidates=spreadPool.filter(p=>p.load===load).map(p=>p.ids);const others=candidates.filter(p=>pairKey(p)!==state.lastPair);if(others.length)candidates=others;return candidates;
}
function gamePool(state){let pool=state.games.filter(id=>!state.usedGames.includes(id));if(!pool.length)pool=[...state.games];const other=pool.filter(id=>id!==state.lastGame);return other.length?other:pool}
function student(state,id,rng,refused=[]){const team=state.teams.find(t=>t.id===id),pool=team.students.filter(n=>!state.used[id].includes(n)&&!refused.includes(n));if(!pool.length)fail(`${team.name}: não há alunos inéditos disponíveis. Adicione alunos à equipe; ninguém que já jogou será repetido.`);return pick(pool,rng)}
export function drawTurn(state,rng=Math.random){
 if(state.done>=state.rounds)fail('O duelo já terminou.');if(state.current)return state.current;
 const isFinal=state.done===state.rounds-1;let pair=isFinal?standings(state).slice(0,2).map(t=>t.id):pick(pairs(state),rng);if(rng()<.5)pair=[...pair].reverse();
 const sides=pair.map(teamId=>({teamId,student:student(state,teamId,rng)})),gameId=pick(gamePool(state),rng);
 state.current={turn:state.done+1,isFinal,gameId,sides,refused:[[],[]]};return state.current;
}
export function redrawStudent(state,side,rng=Math.random){
 if(!state.current||![0,1].includes(side))fail('Não há aluno sorteado nesse lado.');
 const current=state.current,refused=[...current.refused[side],current.sides[side].student],next=student(state,current.sides[side].teamId,rng,refused);
 current.refused[side]=refused;current.sides[side]={...current.sides[side],student:next};return current;
}
function checkTurn(state,current){
 if(!current||current.turn!==state.done+1||current.isFinal!==(state.done===state.rounds-1)||!gamePool(state).includes(current.gameId)||!Array.isArray(current.sides)||current.sides.length!==2)fail('Rodada salva inválida.');
 const ids=current.sides.map(s=>s.teamId);if(new Set(ids).size!==2)fail('Uma equipe não pode enfrentar a si mesma.');
 const allowed=current.isFinal?[standings(state).slice(0,2).map(t=>t.id)]:pairs(state);if(!allowed.some(p=>pairKey(p)===pairKey(ids)))fail('Confronto incompatível com o equilíbrio das equipes ou com a final.');
 if(!Array.isArray(current.refused)||current.refused.length!==2)fail('Recusas de alunos inválidas.');
 current.sides.forEach((s,i)=>{const team=state.teams.find(t=>t.id===s.teamId),refused=current.refused[i];if(!team||!team.students.includes(s.student)||state.used[team.id].includes(s.student)||!Array.isArray(refused)||new Set(refused).size!==refused.length||refused.includes(s.student)||refused.some(n=>!team.students.includes(n)||state.used[team.id].includes(n)))fail('A rodada contém aluno inválido ou repetido.');});
}
export function commitTurn(state,{scores,winnerSide}){
 if(state.done>=state.rounds)fail('O duelo já terminou.');checkTurn(state,state.current);
 if(![0,1].includes(winnerSide)||!Array.isArray(scores)||scores.length!==2||scores.some(n=>!Number.isSafeInteger(n)||n<0))fail('Resultado inválido.');
 const round=clone(state.current);round.scores=[...scores];round.winnerSide=winnerSide;
 round.sides.forEach((s,i)=>{state.used[s.teamId].push(s.student);const stats=state.stats[s.teamId];stats.played++;stats.points+=scores[i];if(i===winnerSide)stats.wins++});
 if(state.usedGames.length===state.games.length)state.usedGames=[];state.usedGames.push(round.gameId);state.lastGame=round.gameId;state.lastPair=pairKey(round.sides.map(s=>s.teamId));state.history.push(round);state.done++;state.current=null;if(round.isFinal)state.champion=round.sides[winnerSide].teamId;return state;
}
export function addStudents(state,id,names){const team=state.teams.find(t=>t.id===id);if(!team)fail('Equipe inválida.');team.students=namesOf([...team.students,...names]);return state}
export function validateDuel(value){
 if(!value||value.version!==1||!Array.isArray(value.history)||value.history.length>40)fail('Duelo salvo inválido.');
 if(value.grade===undefined)value={...value,grade:DEFAULT_GRADE};
 if(value.mode===undefined)value={...value,mode:'edf'};
 const rebuilt=createDuel({teams:value.teams,rounds:value.rounds,games:value.games,topics:value.topics,difficulty:value.difficulty,grade:value.grade,mode:value.mode});
 if(!same(rebuilt.teams,value.teams)||!Number.isFinite(value.createdAt))fail('Cadastro salvo inválido.');rebuilt.createdAt=value.createdAt;
 for(const round of value.history){rebuilt.current=clone(round);delete rebuilt.current.scores;delete rebuilt.current.winnerSide;commitTurn(rebuilt,round)}
 if(value.current){checkTurn(rebuilt,value.current);rebuilt.current=clone(value.current)}
 if(!same(rebuilt,value))fail('Dados do duelo estão inconsistentes. O arquivo original foi preservado.');return clone(rebuilt);
}
export function saveDuel(state,storage=localStorage){const clean=validateDuel(state);storage.setItem(DUEL_KEY,JSON.stringify(clean));return clean}
export function loadDuel(storage=localStorage){const text=storage.getItem(DUEL_KEY);return text?validateDuel(JSON.parse(text)):null}
// Apaga os dados do duelo antigo de três turmas (turmas fixas, nomes de alunos e jogos habilitados).
export function clearLegacyDuelData(storage=globalThis.localStorage){
 for(const key of LEGACY_KEYS){try{storage.removeItem(key)}catch{/* armazenamento indisponível */}}
}
```

- [ ] **Passo 5: Aplicar os nomes novos nos demais arquivos**

Crie o arquivo temporário `.tmp-renomear.cjs` na raiz do projeto com o conteúdo abaixo (troca só palavras inteiras, nos arquivos que usam o motor), rode-o e apague-o:

```js
const fs=require('fs');
const map=[['createEdfDuelUI','createDueloUI'],['edfDuelUI','dueloUI'],['createEdfDuel','createDuel'],['drawEdfTurn','drawTurn'],['redrawEdfStudent','redrawStudent'],['commitEdfTurn','commitTurn'],['edfStandings','standings'],['validateEdfDuel','validateDuel'],['saveEdfDuel','saveDuel'],['loadEdfDuel','loadDuel'],['addEdfStudents','addStudents'],['EDF_DUEL_KEY','DUEL_KEY']];
const files=['duelo-ui.js','app.js','tests/edf-config.test.js','tests/edf-expanded.test.js','tests/edf-sequencia.test.js','tests/browser/edf-expanded.spec.js'];
for(const file of files){
 let text=fs.readFileSync(file,'utf8');const before=text;
 for(const [from,to] of map)text=text.replace(new RegExp('(^|[^A-Za-z0-9_])'+from+'(?![A-Za-z0-9_])','g'),'$1'+to);
 text=text.split('./edf-duel-ui.js').join('./duelo-ui.js').split('./edf-duel.js').join('./duelo.js').split('/edf-duel.js').join('/duelo.js');
 if(text!==before){fs.writeFileSync(file,text);console.log('atualizado',file)}
}
```

```bash
node .tmp-renomear.cjs
rm .tmp-renomear.cjs
grep -rn "edf-duel\|EdfDuel\|edfDuelUI\|EdfStudent\|EdfTurn" --include=*.js . --exclude-dir=node_modules --exclude-dir=docs | grep -v "^./Fotos"
```
Expected: o `grep` final não imprime nada. Em `sw.js`, troque `'./edf-duel.js','./edf-duel-ui.js'` por `'./duelo.js','./duelo-ui.js'`.

- [ ] **Passo 6: Ajustar os dois testes de `tests/edf-config.test.js` e rodar os testes de regras**

O estado agora termina em `grade` e `mode` (nessa ordem), e um salvamento antigo não tem nenhum dos dois. Em `tests/edf-config.test.js`:
- troque `assert.equal(old.grade,7);assert.equal(Object.keys(old).at(-1),'grade');` por `assert.equal(old.grade,7);assert.deepEqual(Object.keys(old).slice(-2),['grade','mode']);`;
- troque `const legacy=JSON.parse(JSON.stringify(state));delete legacy.grade;` por `const legacy=JSON.parse(JSON.stringify(state));delete legacy.grade;delete legacy.mode;`.

Run: `npm test`
Expected: PASS em tudo, incluindo `tests/duelo.test.js`. Se um teste antigo falhar por texto de erro que mudou (por exemplo "Rodada EDF salva inválida."), atualize o texto esperado no teste: nesta tarefa só mudaram as mensagens genéricas para "duelo" (`Duelo salvo inválido.`, `O duelo já terminou.`, `Rodada salva inválida.`, `Resultado inválido.`, `Cadastro salvo inválido.`, `Dados do duelo estão inconsistentes…`).

- [ ] **Passo 7: Rodar os testes de navegador do EDF**

Run: `npx playwright test tests/browser/edf-expanded.spec.js tests/browser/edf-anos.spec.js tests/browser/edf-sequencia.spec.js --reporter=line`
Expected: PASS (a interface do campeonato ainda é a do menu EDF; só os nomes internos mudaram). O teste longo do `edf-anos` demora alguns minutos: rode em segundo plano.

- [ ] **Passo 8: Commit**

```bash
git add -A duelo.js duelo-ui.js app.js sw.js tests/duelo.test.js tests/edf-config.test.js tests/edf-expanded.test.js tests/edf-sequencia.test.js tests/browser/edf-expanded.spec.js
git commit -m "refactor(duelo): motor do campeonato EDF vira duelo.js com modo Normal/EDF

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Tarefa 2: Interface do duelo, ligação no `app.js` e remoção do duelo antigo

**Arquivos:**
- Reescrever: `duelo-ui.js`
- Modificar: `app.js`, `edf-menu.js`, `edf.css`, `index.html`, `sw.js`, `tests/browser/edf-expanded.spec.js`, `tests/browser/edf-anos.spec.js`, `tests/browser/edf-sequencia.spec.js`
- Criar: `tests/browser/duelo.spec.js`
- Apagar: `duel.js`, `duel-ui.js`, `duel.css`, `roster.js`, `tests/duel.test.js`, `tests/browser/duel.spec.js`

**Interfaces:**
- Consome (Tarefa 1): `createDuel`, `drawTurn`, `redrawStudent`, `commitTurn`, `standings`, `loadDuel`, `saveDuel`, `addStudents`, `DUEL_KEY`, `clearLegacyDuelData` de `duelo.js`; `makeEdfGame`, `EDF_GRADES`, `getGrade`, `normalizeGrade`, `edfImage`.
- Produz: `createDueloUI(api)` com `api = {esc, button, prefs, toast, ask, modal, games (os 12 do modo normal), edfGames (os 14 EDF), edfConfig(): {grade, topicsByGrade}, getTeams(), dispose(), sound(), celebrate(), show(name, html, cls), startMatch(ctx)}`. Devolve `{open, action, result, back, stop, state}`.
- `startMatch(ctx)` recebe `{kind:'duel', mode:'normal'|'edf', gameId, topics, grade, difficulty, turn, total, isFinal, names, labels}`.
- Os ids e ações do DOM (`edf-competition-form`, `edf-rounds`, `edf-team-name`, `edf-match-draw`, `edf-match-start`, `edf-match-add`, `edf-confirm-result`, `.edf-ranking`, `edf-comp-topic`, `edf-comp-game` etc.) continuam iguais aos atuais; só mudam os textos e as seções novas (`duelo-mode`, `duelo-grade`).

- [ ] **Passo 1: Escrever o teste de navegador que falha**

Crie `tests/browser/duelo.spec.js`:

```js
import {test,expect} from '@playwright/test';

const LEGACY={'eejam-duel-v1':'{"version":2}','eejam-braga-v1':'["Ana"]','eejam-names-v1-a':'["Ana"]','eejam-names-v1-b':'["Bia"]','eejam-names-v1-m':'["Caio"]','eejam-duel-games-v1':'["turbo"]'};
async function freeze(page){await page.clock.install({time:new Date('2027-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2027-01-01T00:00:10Z'))}
async function home(page){await freeze(page);await page.goto('/');await page.clock.runFor(2300)}
const openDuelo=page=>page.locator('[data-action="duel"]').click();
const pickMode=(page,mode)=>page.locator(`.duelo-modo:has([value="${mode}"])`).click();
async function fillTeams(page,{count=2,students=6}={}){
 for(let i=2;i<count;i++)await page.locator('#edf-add-team').click();
 for(let i=0;i<count;i++){await page.locator('.edf-team-name').nth(i).fill('Equipe '+i);await page.locator('.edf-team-students').nth(i).fill(Array.from({length:students},(_,j)=>'Aluno '+i+'-'+j).join('\n'))}
}
async function onlyGames(page,ids){for(const el of await page.locator('[name="edf-comp-game"]').all())await el.setChecked(ids.includes(await el.getAttribute('value')))}
const create=page=>page.locator('#edf-competition-form').evaluate(form=>form.requestSubmit());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('eejam-edf-competition-v1')));

test('Modo Duelo abre sem token e oferece a escolha de conteúdo, com jogos e anos de cada modo',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await openDuelo(page);
 await expect(page.locator('#token')).toHaveCount(0);await expect(page.locator('dialog[open]')).toHaveCount(0);
 await expect(page.locator('.duelo-modo')).toHaveCount(2);await expect(page.locator('[name="duelo-mode"][value="normal"]')).toBeChecked();
 await expect(page.locator('#duelo-edf')).toBeHidden();await expect(page.locator('[name="edf-comp-game"]')).toHaveCount(12);
 await expect(page.locator('#edf-competition-level option').first()).toHaveText('Desafio • 14–15 anos');
 await pickMode(page,'edf');
 await expect(page.locator('#duelo-edf')).toBeVisible();await expect(page.locator('[name="duelo-grade"]')).toHaveCount(4);await expect(page.locator('[name="duelo-grade"][value="7"]')).toBeChecked();
 await expect(page.locator('[name="edf-comp-topic"]')).toHaveCount(4);await expect(page.locator('[name="edf-comp-game"]')).toHaveCount(14);
 await expect(page.locator('[name="edf-comp-game"][value="ordem"]')).toBeChecked();await expect(page.locator('#edf-competition-level option').first()).toHaveText('Desafio • 7º ano');
 await page.locator('.edf-grade:has([value="8"])').click();
 await expect(page.locator('[name="edf-comp-topic"]')).toHaveCount(3);await expect(page.locator('[name="edf-comp-topic"]').first()).toHaveAttribute('value','e8-rede');
 await expect(page.locator('#edf-competition-level option').first()).toHaveText('Desafio • 8º ano');
 await pickMode(page,'normal');await expect(page.locator('#duelo-edf')).toBeHidden();await expect(page.locator('[name="edf-comp-game"]')).toHaveCount(12);
 expect(errors).toEqual([]);
});

test('duelo Normal: cria equipes, sorteia em 5 s, começa uma partida do modo normal e Anular volta ao sorteio',async({page})=>{
 await home(page);await openDuelo(page);await fillTeams(page,{count:2,students:5});await page.locator('#edf-rounds').fill('3');await onlyGames(page,['turbo']);await create(page);
 const state=await saved(page);expect(state.mode).toBe('normal');expect(state.topics).toEqual([]);expect(state.games).toEqual(['turbo']);
 await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(4999);await expect(page.locator('[data-action="edf-match-start"]')).toHaveCount(0);
 await page.clock.runFor(1);await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
 await page.locator('[data-action="edf-match-start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('.game[data-game="turbo"]')).toHaveCount(2);await expect(page.locator('.game[data-subject="edf"]')).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(page.getByText('Duelo em pausa')).toBeVisible();
 await page.locator('#leave').click();await page.locator('#yes').click();
 await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
});

test('duelo EDF: usa o ano e as unidades escolhidos e guarda ano e modo',async({page})=>{
 await home(page);await openDuelo(page);await pickMode(page,'edf');await page.locator('.edf-grade:has([value="8"])').click();
 await page.locator('[name="edf-comp-topic"][value="e8-invasao"]').uncheck();await page.locator('[name="edf-comp-topic"][value="e8-sociedade"]').uncheck();
 await fillTeams(page,{count:2,students:4});await page.locator('#edf-rounds').fill('2');await onlyGames(page,['edf']);await create(page);
 const state=await saved(page);expect(state.mode).toBe('edf');expect(state.grade).toBe(8);expect(state.topics).toEqual(['e8-rede']);
 await expect(page.locator('.page-heading .eyebrow')).toContainText('EDF • 8º ANO');
 await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);await page.locator('[data-action="edf-match-start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .game')).toHaveAttribute('data-topics','e8-rede');
});

test('sem unidade marcada o duelo EDF avisa; equipes repetidas e participantes repetidos são recusados',async({page})=>{
 await home(page);await openDuelo(page);await pickMode(page,'edf');
 await fillTeams(page,{count:2,students:3});
 await page.locator('[name="edf-comp-topic"]').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false}));await create(page);
 await expect(page.locator('#toast')).toHaveText('Selecione ao menos um tema para as cartas.');
 await page.locator('[name="edf-comp-topic"]').first().check();
 await page.locator('.edf-team-students').first().fill('Ana\nana');await create(page);await expect(page.locator('#toast')).toContainText('repetidos na mesma equipe');
 await page.locator('.edf-team-students').first().fill('Ana\nBia');await page.locator('.edf-team-name').nth(1).fill('Equipe 0');await create(page);await expect(page.locator('#toast')).toContainText('nomes diferentes');
 expect(await page.evaluate(()=>localStorage.getItem('eejam-edf-competition-v1'))).toBeNull();
});

test('na primeira abertura os dados do duelo antigo são apagados e o menu EDF não tem mais o botão do campeonato',async({page})=>{
 await page.addInitScript(legacy=>{for(const [key,value] of Object.entries(legacy))localStorage.setItem(key,value);localStorage.setItem('eejam-edf-v1',JSON.stringify({topics:['lutas'],names:['A','B']}))},LEGACY);
 await home(page);
 expect(await page.evaluate(keys=>keys.map(key=>localStorage.getItem(key)),Object.keys(LEGACY))).toEqual(Object.keys(LEGACY).map(()=>null));
 expect(await page.evaluate(()=>localStorage.getItem('eejam-edf-v1'))).not.toBeNull();
 await page.locator('[data-action="edf"]').click();await expect(page.locator('#edf-form')).toBeVisible();await expect(page.locator('[data-action="edf-tournament"]')).toHaveCount(0);await expect(page.getByText('Equipes, alunos e sorteio')).toHaveCount(0);
});

// Harness: a interface do duelo sozinha, com a partida substituída por um resultado simulado.
async function harness(page,{reduced=false,saved}={}){
 await page.addInitScript(({saved})=>{if(saved!==undefined)localStorage.setItem('eejam-edf-competition-v1',typeof saved==='string'?saved:JSON.stringify(saved))},{saved});
 await page.route('**/duelo-test-harness',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><link rel="stylesheet" href="/menu.css"><link rel="stylesheet" href="/experience.css"><link rel="stylesheet" href="/edf.css"></head><body><div id="app"></div><dialog id="modal"></dialog><div id="toast"></div><script type="module">
  import {createDueloUI} from '/duelo-ui.js';import {GAMES} from '/games.js';import {EDF_GAME,EDF_ORDEM_GAME} from '/edf-content.js';
  const $=s=>document.querySelector(s);window.soundCalls=0;
  window.ui=createDueloUI({esc:v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
   button:(label,action,cls='secondary',extra='')=>'<button class="'+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>',
   prefs:{reduced:${reduced},difficulty:'normal'},toast:m=>$('#toast').textContent=m,ask:async()=>true,modal:$('#modal'),games:GAMES,edfGames:[EDF_GAME,...GAMES,EDF_ORDEM_GAME],
   edfConfig:()=>({grade:7,topics:['ginastica','aventura','lutas'],topicsByGrade:{}}),getTeams:()=>[],dispose:()=>{},sound:()=>window.soundCalls++,celebrate:()=>{},
   show:(name,html,cls)=>{window.screen=name;$('#app').innerHTML='<main class="'+cls+'">'+html+'</main>'},startMatch:ctx=>{window.matchContext=ctx}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)window.ui.action(b.dataset.action,b)});
  window.ui.open();window.ready=true;
 </script></body></html>`}));
 await page.goto('/duelo-test-harness');await page.waitForFunction(()=>window.ready);
}
const finish=async(page,winner)=>{
 await page.evaluate(winner=>window.ui.result({names:['A','B'],winner,scores:winner?[0,1000]:[1000,0],correctCounts:winner?[0,1]:[1,0]}),winner);
 await page.locator('#edf-confirm-result').click();
};

test('duelo Normal de duas rodadas: sorteio de 5 s, jogo do modo normal, ranking de 2 s e equipe campeã pela final',async({page})=>{
 await freeze(page);await harness(page);
 await fillTeams(page,{count:2,students:3});await page.locator('#edf-rounds').fill('2');await create(page);
 for(let round=1;round<=2;round++){
  await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);
  const current=await page.evaluate(()=>structuredClone(window.ui.state().current));expect(current.turn).toBe(round);expect(current.isFinal).toBe(round===2);
  await page.locator('[data-action="edf-match-start"]').click();
  const ctx=await page.evaluate(()=>window.matchContext);expect(ctx.kind).toBe('duel');expect(ctx.mode).toBe('normal');expect(ctx.isFinal).toBe(round===2);
  expect(await page.evaluate(async id=>(await import('/games.js')).GAMES.some(game=>game.id===id),ctx.gameId)).toBe(true);
  await finish(page,0);
  await expect(page.locator('#edf-ranking-next')).toBeDisabled();await page.clock.runFor(2000);await expect(page.locator('#edf-ranking-next')).toBeEnabled();await page.locator('#edf-ranking-next').click();
 }
 await expect(page.getByText('equipe campeã!')).toBeVisible();
 const state=await page.evaluate(()=>window.ui.state());expect(state.done).toBe(2);expect(state.champion).toBeTruthy();expect(state.mode).toBe('normal');
});

test('redução de movimento revela o confronto imediatamente',async({page})=>{
 await freeze(page);await harness(page,{reduced:true});
 await fillTeams(page,{count:2,students:2});await page.locator('#edf-rounds').fill('1');await create(page);
 await page.locator('[data-action="edf-match-draw"]').click();await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
});

test('duelo salvo inválido aparece como erro e é preservado; dá para configurar um novo duelo',async({page})=>{
 await freeze(page);await harness(page,{saved:'{isto nao e json'});
 await expect(page.getByRole('heading',{name:'Não foi possível ler o duelo salvo.'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('eejam-edf-competition-v1'))).toBe('{isto nao e json');
 await page.locator('[data-action="edf-match-new"]').click();await expect(page.locator('#edf-competition-form')).toBeVisible();
});

test('sair durante o sorteio cancela os temporizadores e o sorteio pendente é restaurado',async({page})=>{
 await home(page);await openDuelo(page);await fillTeams(page,{count:2,students:4});await create(page);
 await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(1500);
 const pending=(await saved(page)).current;
 await page.locator('[data-action="home"]').first().click();await page.clock.runFor(10000);await expect(page.locator('.menu-buttons')).toBeVisible();
 await openDuelo(page);expect((await saved(page)).current).toEqual(pending);
 await page.locator('[data-action="edf-match-draw"]').click();await expect(page.locator('[data-action="edf-match-start"]')).toBeVisible();
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `npx playwright test tests/browser/duelo.spec.js --reporter=line`
Expected: FAIL (o Modo Duelo ainda abre o modal de token e `.duelo-modo` não existe).

- [ ] **Passo 3: Reescrever `duelo-ui.js`**

Substitua o arquivo inteiro por:

```js
import {normalizeEdfTopics,edfImage} from './edf-content.js';
import {EDF_GRADES,getGrade,normalizeGrade} from './edf-anos.js';
import {makeEdfGame} from './edf-theme.js';
import {createDuel,drawTurn,redrawStudent,commitTurn,standings,loadDuel,saveDuel,addStudents,DUEL_KEY} from './duelo.js';
import {uiIcon} from './ui-art.js';

export function createDueloUI(api){
 const {esc,button,prefs,toast,ask}=api,$=s=>document.querySelector(s);let state=null,timers=[],busy=false;
 const stop=()=>{timers.forEach(clearTimeout);timers=[];busy=false};
 const delay=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const show=(name,html)=>{stop();api.dispose();api.show(name,html,'edf-competition')};
 const team=id=>state.teams.find(t=>t.id===id);
 const gameOf=id=>state.mode==='edf'?makeEdfGame(api.edfGames.find(g=>g.id===id),state.topics,state.grade):api.games.find(g=>g.id===id);
 const where=()=>state.mode==='edf'?`EDF • ${state.grade}º ANO`:'CONTEÚDO NORMAL';
 const persist=draft=>{state=saveDuel(draft)};
 const attempt=fn=>{try{return fn()}catch(error){toast(error.message)}};
 const table=()=>`<ol class="edf-ranking">${standings(state).map((t,i)=>`<li style="--rank:${i}"><b>${i+1}. ${esc(t.name)}</b><span>${t.wins} vitórias • ${t.played} jogos • ${t.points} pontos</span></li>`).join('')}</ol>`;
 function open(){
  try{state=loadDuel()}catch(error){show('duelo-save-error',`<h1>Não foi possível ler o duelo salvo.</h1><p>${esc(error.message)}</p><p>Os dados originais foram preservados neste aparelho.</p><div class="actions">${button('Configurar novo duelo','edf-match-new')}${button('Voltar','home')}</div>`);return}
  if(state)return ready();setup();
 }
 function setup(){
  const config=api.edfConfig();let mode='normal',grade=normalizeGrade(config.grade);const byGrade={...config.topicsByGrade};
  const topicsFor=year=>{const saved=byGrade[year];return saved?.length?saved:[...getGrade(year).defaultTopics]};
  show('edf-competition-setup',`<div class="page-heading"><span class="eyebrow">MODO DUELO • EQUIPES E PARTICIPANTES</span><h1>Monte as equipes. Prepare o duelo.</h1><p>Escolha o conteúdo, cadastre equipes e participantes e deixe o sorteio decidir os confrontos. A última rodada é a final entre as duas melhores equipes.</p></div><form id="edf-competition-form" class="edf-setup"><fieldset class="duelo-modos"><legend>Conteúdo do duelo</legend><label class="duelo-modo"><input type="radio" name="duelo-mode" value="normal" checked><span><b>Normal</b><small>Marketing, projetos e comunicação: os 12 jogos do desafio.</small></span></label><label class="duelo-modo"><input type="radio" name="duelo-mode" value="edf"><span><b>Educação Física</b><small>Conteúdo dos cadernos do 6º ao 9º ano: 14 jogos EDF.</small></span></label></fieldset><div id="duelo-edf" hidden><fieldset class="edf-grades"><legend>Qual ano?</legend>${EDF_GRADES.map(info=>`<label class="edf-grade"><input type="radio" name="duelo-grade" value="${info.grade}" ${info.grade===grade?'checked':''}><img src="${edfImage(info.heroImage,info.grade)}" alt=""><span><b>${info.grade}º ano</b><small>${esc(info.tagline)}</small></span></label>`).join('')}</fieldset><fieldset class="edf-topics" id="duelo-topics"></fieldset></div><fieldset class="edf-game-options" id="duelo-games"></fieldset><div class="edf-options"><label>Total de rodadas, incluindo a final<input id="edf-rounds" type="number" min="1" max="40" value="5" required></label><label>Dificuldade inicial<select id="edf-competition-level"><option value="normal"></option><option value="hard">Avançado</option></select></label></div><div id="edf-team-editor" class="team-editor"></div><div class="actions"><button type="button" id="edf-add-team" class="secondary">${uiIcon('teams')} Adicionar equipe</button>${api.getTeams().length>=2?'<button type="button" id="edf-import-teams" class="secondary">Usar equipes cadastradas</button>':''}</div><p class="edf-note">De 2 a 8 equipes, com até 60 participantes em cada uma. Um nome ou apelido por linha. Quem já jogou não entra de novo no sorteio. Você poderá adicionar mais participantes durante o duelo.</p><div class="actions">${button('Voltar','home')}<button type="submit" class="primary">${uiIcon('confirm')} Criar duelo</button></div></form>`);
  const checkedTopics=()=>[...document.querySelectorAll('[name="edf-comp-topic"]:checked')].map(el=>el.value);
  const titleOf=g=>mode==='edf'?makeEdfGame(g,getGrade(grade).defaultTopics,grade).title:g.title;
  function renderGames(){$('#duelo-games').innerHTML='<legend>Jogos que entram no sorteio</legend>'+(mode==='edf'?api.edfGames:api.games).map(g=>`<label><input type="checkbox" name="edf-comp-game" value="${g.id}" checked> ${esc(titleOf(g))}</label>`).join('')}
  function renderTopics(){
   const info=getGrade(grade),chosen=topicsFor(grade);
   $('#duelo-topics').innerHTML='<legend>Conteúdos do duelo</legend>'+info.topics.map(t=>`<label class="edf-topic"><input type="checkbox" name="edf-comp-topic" value="${t.id}" ${chosen.includes(t.id)?'checked':''}>${t.image?`<img src="${edfImage(t.image,info.grade)}" alt="">`:uiIcon('book')}<span><b>${esc(t.title)}</b><small>${t.supplement?'Complemento':esc(t.description)}</small></span></label>`).join('');
   document.querySelectorAll('[name="edf-comp-topic"]').forEach(input=>input.addEventListener('change',()=>{byGrade[grade]=checkedTopics()}));
  }
  function renderMode(){
   $('#duelo-edf').hidden=mode!=='edf';
   $('#edf-competition-level').options[0].textContent=mode==='edf'?`Desafio • ${grade}º ano`:'Desafio • 14–15 anos';
   if(mode==='edf')renderTopics();
   renderGames();
  }
  document.querySelectorAll('[name="duelo-mode"]').forEach(input=>input.addEventListener('change',()=>{mode=input.value;renderMode()}));
  document.querySelectorAll('[name="duelo-grade"]').forEach(input=>input.addEventListener('change',()=>{byGrade[grade]=checkedTopics();grade=Number(input.value);renderMode()}));
  function row(name='',students=[]){const host=$('#edf-team-editor');if(host.children.length>=8)return toast('Limite de oito equipes.');const el=document.createElement('section');el.className='team-row';el.innerHTML=`<label>Nome da equipe<input class="edf-team-name" maxlength="40" value="${esc(name)}" required></label><label>Participantes — um por linha<textarea class="edf-team-students" rows="4" required>${students.map(esc).join('\n')}</textarea></label><button type="button" class="secondary edf-remove-team">${uiIcon('trash')} Remover equipe</button>`;el.querySelector('button').onclick=()=>{if(host.children.length<=2)return toast('Mantenha ao menos duas equipes.');el.remove()};host.append(el)}
  row();row();$('#edf-add-team').onclick=()=>row();
  if($('#edf-import-teams'))$('#edf-import-teams').onclick=()=>{$('#edf-team-editor').replaceChildren();api.getTeams().slice(0,8).forEach(t=>row(t.name,t.members))};
  renderMode();$('#edf-competition-level').value=prefs.difficulty;
  $('#edf-competition-form').onsubmit=async e=>{e.preventDefault();try{
   const draft=createDuel({mode,grade,topics:mode==='edf'?checkedTopics():[],teams:[...$('#edf-team-editor').children].map(el=>({name:el.querySelector('input').value,students:el.querySelector('textarea').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean)})),rounds:Number($('#edf-rounds').value),games:[...document.querySelectorAll('[name="edf-comp-game"]:checked')].map(el=>el.value),difficulty:$('#edf-competition-level').value});
   if((state||localStorage.getItem(DUEL_KEY))&&!await ask('Criar outro duelo?','O duelo atual será substituído.'))return;
   persist(draft);ready();
  }catch(error){toast(error.message)}};
 }
 function ready(){
  if(state.done>=state.rounds)return champion();
  show('edf-competition-ready',`<div class="page-heading"><span class="eyebrow">MODO DUELO • ${where()} • ${state.done} DE ${state.rounds} RODADAS</span><h1>${state.current?'Sorteio já preparado.':'Quem entra no próximo duelo?'}</h1><p>A última rodada é a final. Classificação por aproveitamento, vitórias e pontos.</p></div>${table()}<div class="actions">${button(state.current?'Ver sorteio pendente':state.done===state.rounds-1?'Sortear a FINAL':`Sortear rodada ${state.done+1}`,'edf-match-draw','primary')}${button('Adicionar participantes','edf-match-add')}${button('Novo duelo','edf-match-new')}${button('Voltar','home')}</div>`);
 }
 function reveal(){
  const current=state.current;if(!current)return ready();
  show('edf-competition-reveal',`<div class="page-heading"><span class="eyebrow">${current.isFinal?'GRANDE FINAL':`RODADA ${current.turn} DE ${state.rounds}`}</span><h1>${esc(gameOf(current.gameId).title)}</h1></div><div class="edf-versus">${current.sides.map((s,i)=>`${i===1?uiIcon('versus'):''}<section class="edf-player ${i?'orange':'blue'}"><small>${esc(team(s.teamId).name)}</small><h2>${esc(s.student)}</h2>${button('Sortear outro participante','edf-match-redraw','secondary',`data-side-index="${i}"`)}</section>`).join('')}</div><p class="edf-note">Se alguém não puder participar, troque apenas o participante desse lado. Quem já jogou não será sorteado novamente.</p><div class="actions">${button('Começar partida','edf-match-start','primary')}${button('Adicionar participantes','edf-match-add')}${button('Voltar ao placar','edf-match-back')}</div>`);
 }
 function spin(side){
  if(busy)return;let draft=structuredClone(state);try{if(side===undefined)drawTurn(draft);else redrawStudent(draft,side);persist(draft)}catch(error){toast(error.message);return}
  if(prefs.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)return reveal();
  const cur=state.current;
  show('edf-competition-spin',`<div class="page-heading"><span class="eyebrow">${cur.isFinal?'SORTEIO DA FINAL':'SORTEIO'}</span><h1>O próximo duelo vem aí...</h1></div><div class="edf-spin-game" id="edf-spin-game"></div><div class="edf-versus">${cur.sides.map((s,i)=>`${i?uiIcon('versus'):''}<section class="edf-player ${i?'orange':'blue'}"><small id="edf-spin-team-${i}">${esc(team(s.teamId).name)}</small><h2 id="edf-spin-name-${i}">${esc(s.student)}</h2></section>`).join('')}</div><p class="edf-spin-status" role="status">Sorteando... os nomes estão desacelerando.</p>`);
  busy=true;const started=performance.now();api.sound('shuffle');
  function frame(){const elapsed=performance.now()-started;if(elapsed>=5000){api.sound('start');return reveal()}
   $('#edf-spin-game').textContent=elapsed<2000?gameOf(state.games[Math.floor(Math.random()*state.games.length)]).title:gameOf(cur.gameId).title;
   cur.sides.forEach((s,i)=>{if(side!==undefined&&side!==i)return;const t=elapsed<1500?state.teams[Math.floor(Math.random()*state.teams.length)]:team(s.teamId);$('#edf-spin-team-'+i).textContent=t.name;$('#edf-spin-name-'+i).textContent=t.students[Math.floor(Math.random()*t.students.length)]});
   delay(frame,Math.min(5000-elapsed,30+Math.pow(elapsed/5000,3)*430));
  }frame();
 }
 function start(){if(busy||!state.current)return;const cur=state.current;api.startMatch({kind:'duel',mode:state.mode,gameId:cur.gameId,topics:[...state.topics],grade:state.grade,difficulty:state.difficulty,turn:cur.turn,total:state.rounds,isFinal:cur.isFinal,names:cur.sides.map(s=>s.student),labels:cur.sides.map(s=>team(s.teamId).name)})}
 function result(session){
  const current=state.current;if(!current)return ready();
  show('edf-competition-result',`<div class="result"><span class="eyebrow">RESULTADO DA RODADA</span><div class="trophy">${uiIcon('trophy')}</div><h1>${esc(session.names[session.winner])}<br><span>venceu pela ${esc(team(current.sides[session.winner].teamId).name)}!</span></h1><p class="accuracy-result">${session.correctCounts[0]} × ${session.correctCounts[1]} acertos</p><div class="result-scores"><span>AZUL <b>${session.scores[0]}</b></span><em>×</em><span>LARANJA <b>${session.scores[1]}</b></span></div><div class="actions"><button class="primary" id="edf-confirm-result">Confirmar resultado e ver ranking</button>${button('Repetir partida','edf-match-start')}${button('Voltar ao sorteio','edf-match-reveal')}</div></div>`);
  $('#edf-confirm-result').onclick=()=>{try{const draft=structuredClone(state);commitTurn(draft,{scores:session.scores,winnerSide:session.winner});persist(draft);ranking()}catch(error){toast(error.message)}};
 }
 function ranking(){
  show('edf-competition-ranking',`<div class="page-heading"><span class="eyebrow">RODADA ${state.done} CONFIRMADA</span><h1>Como ficou a classificação?</h1><p id="edf-ranking-status" role="status">Calculando o placar...</p></div><div class="edf-ranking-reveal">${table()}</div><div class="actions">${button(state.done>=state.rounds?'Ver equipe campeã':'Próximo sorteio','edf-match-back','primary','disabled id="edf-ranking-next"')}${button('Pausar duelo','home')}</div>`);
  const done=()=>{$('#edf-ranking-status').textContent=state.done>=state.rounds?'A final definiu a equipe campeã!':state.done===state.rounds-1?'As duas melhores equipes vão disputar a FINAL!':'Classificação atualizada.';$('#edf-ranking-next').disabled=false;busy=false};
  if(prefs.reduced)return done();busy=true;delay(done,2000);
 }
 function champion(){
  show('edf-competition-champion',`<div class="result"><div class="trophy">${uiIcon('trophy')}</div><span class="eyebrow">DUELO CONCLUÍDO</span><h1>${esc(team(state.champion).name)}<br><span>equipe campeã!</span></h1>${table()}<div class="actions">${button('Novo duelo','edf-match-new','primary')}${button('Voltar','home')}</div></div>`);api.celebrate();
 }
 function add(){
  const modal=api.modal;modal.innerHTML=`<h2>Adicionar participantes ao duelo</h2><label>Equipe<select id="edf-add-team-id">${state.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label><label>Novos participantes — um por linha<textarea id="edf-add-students" rows="6"></textarea></label><p>Os resultados e quem já jogou serão preservados.</p><div class="actions"><button class="secondary" id="edf-add-cancel">Cancelar</button><button class="primary" id="edf-add-save">Salvar participantes</button></div>`;modal.showModal();$('#edf-add-cancel').onclick=()=>modal.close();$('#edf-add-save').onclick=()=>attempt(()=>{const names=$('#edf-add-students').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean);if(!names.length)throw Error('Informe ao menos um participante novo.');const draft=structuredClone(state);addStudents(draft,$('#edf-add-team-id').value,names);persist(draft);modal.close();toast('Participantes adicionados. O sorteio já pode continuar.');state.current?reveal():ready()});
 }
 function action(name,el){if(name==='edf-match-new')return setup();if(name==='edf-match-add')return add();if(name==='edf-match-back')return busy?null:ready();if(name==='edf-match-reveal')return reveal();if(name==='edf-match-draw')return state.current?reveal():spin();if(name==='edf-match-redraw')return spin(Number(el.dataset.sideIndex));if(name==='edf-match-start')return start()}
 return{open,action,result,back:()=>state?.current?reveal():ready(),stop,state:()=>state};
}
```

- [ ] **Passo 4: Estilos dos cartões de conteúdo (`edf.css`)**

Acrescente ao final de `edf.css`:

```css
.duelo-modos{border:0;margin:0 0 1.2rem;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.duelo-modos legend{font-size:1.8rem;font-weight:700;margin-bottom:1rem}
.duelo-modo{position:relative;display:flex;align-items:center;min-height:6.6rem;padding:1rem 1.4rem;border:.25rem solid #ffffff35;border-radius:1.4rem;background:#0d1650;cursor:pointer}
.duelo-modo input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.duelo-modo b{display:block;font-size:2.2rem}
.duelo-modo small{display:block;font-size:1.3rem;line-height:1.2;opacity:.85}
.duelo-modo:has(input:checked){border-color:#ffd63d;background:#1b2a8a;box-shadow:0 0 0 .2rem #ffd63d66}
.duelo-modo:has(input:focus-visible){outline:.3rem solid #fff;outline-offset:.2rem}
#duelo-edf{margin-bottom:1rem}
@media(max-aspect-ratio:14/10){.duelo-modos{grid-template-columns:1fr}}
```

- [ ] **Passo 5: Ligar o duelo no `app.js`**

Edições em `app.js` (confirme que cada trecho antigo aparece exatamente uma vez; o arquivo pode estar em CRLF no disco, preserve o estilo existente):

1. Importações: remova a linha `import {createDuelUI} from './duel-ui.js';`. Troque `import {getGrade,normalizeGrade} from './edf-anos.js';` por nada (as duas funções só eram usadas por `edfCompetition`, que sai no item 3). Troque a importação do motor `import {createDueloUI} from './duelo-ui.js';` por duas linhas:
```js
import {createDueloUI} from './duelo-ui.js';
import {clearLegacyDuelData} from './duelo.js';
```
2. Troque o início de `action()`: o trecho `else if(a==='duel'){edfActive=false;duelUI.open();}else if(a.startsWith('duel-'))duelUI.action(a,b)` por `else if(a==='duel'){edfActive=false;dueloUI.open()}`.
3. Apague a função inteira `edfCompetition` (a linha que começa com `function edfCompetition(){`) e, em `action()`, o trecho `else if(a==='edf-tournament')edfCompetition()`.
4. Em `finish()`: troque `if(s.duel)return s.duel.kind==='edf'?dueloUI.result(s):duelUI.result(s);` por `if(s.duel)return dueloUI.result(s);`.
5. Em `pauseGame()`: troque `s.duel?(s.duel.kind==='edf'?dueloUI.back():duelUI.back()):s.demo?hero():bracket()` por `s.duel?dueloUI.back():s.demo?hero():bracket()`.
6. Apague a linha inteira `const duelUI=createDuelUI({…});`.
7. Troque a linha inteira `const dueloUI=createDueloUI({…});` por:
```js
const dueloUI=createDueloUI({esc,button,prefs,toast,ask,modal,games:GAMES,edfGames,edfConfig:()=>edfConfig,getTeams:()=>tournament?.teams||[],dispose,sound,celebrate,show:(name,html,cls)=>{screen=name;shell(html,cls)},startMatch:ctx=>{soloMode=false;prefs.difficulty=ctx.difficulty;prefSave();selected=ctx.gameId;if(ctx.mode==='edf'){edfActive=true;edfConfig={...edfConfig,topics:ctx.topics,grade:ctx.grade}}else edfActive=false;begin(true,ctx)}});
```
8. Antes da chamada final `hero();` (depois de `try{tournament=await loadTournament()…}`), acrescente a linha `clearLegacyDuelData();`.

Confira que não restou nada do duelo antigo: `grep -n "duelUI\|createDuelUI\|duel-ui\|TOKEN\|edf-tournament\|edfCompetition" app.js` não deve imprimir nada.

- [ ] **Passo 6: Tirar o botão do campeonato do menu EDF (`edf-menu.js`)**

1. Apague o trecho `<div class="actions edf-entry-actions">${button(uiIcon('shuffle')+' Equipes, alunos e sorteio','edf-tournament','primary')}</div>`.
2. Troque o texto `Escolha o ano, um jogo, os temas e o modo de jogar. Para cadastrar alunos e definir rodadas, use Equipes, alunos e sorteio.` por `Escolha o ano, um jogo, os temas e o modo de jogar. Para cadastrar equipes e participantes e sortear os confrontos, use o Modo Duelo.`

- [ ] **Passo 7: Apagar o duelo antigo e atualizar índice e cache**

```bash
git rm -q duel.js duel-ui.js duel.css roster.js tests/duel.test.js tests/browser/duel.spec.js
```
Em `index.html`, apague a tag `<link rel="stylesheet" href="duel.css">`. Em `sw.js`, apague `'./duel.css'`, `'./duel.js'`, `'./duel-ui.js'` e `'./roster.js'` das listas (o `duelo.js` e o `duelo-ui.js` já estão lá desde a Tarefa 1).

Antes de apagar o `duel.css`, confirme que nenhuma regra global dele fazia falta: `git show HEAD:duel.css | grep -nE "^\.(actions|eyebrow|primary|form-error|hint|small|chips?|text-button|result-scores)\b"`. Se aparecer alguma regra sem o prefixo `.duel` ou `.dd-`, copie essa regra para `edf.css` e confira visualmente a tela de configuração do duelo (Passo 10).

- [ ] **Passo 8: Atualizar os testes que usavam o ponto de entrada antigo**

1. `tests/browser/edf-expanded.spec.js`: em todo trecho `page.locator('[data-action="edf"]').click();await page.locator('[data-action="edf-tournament"]').click();` troque por `page.locator('[data-action="duel"]').click();`. No auxiliar `competition()` (o que cria as equipes), acrescente logo depois dessa troca `await page.locator('.duelo-modo:has([value="edf"])').click();`. Nos pontos em que o duelo já existe e a tela abre direto no placar (volta depois de recarregar, "leaving EDF roulette"), não clique no modo.
2. `tests/browser/edf-anos.spec.js`: apague o teste `campeonato EDF: usa o ano escolhido no menu…` (foi substituído por `duelo EDF: usa o ano e as unidades escolhidos…` no `duelo.spec.js`).
3. `tests/browser/edf-sequencia.spec.js`: no primeiro teste, troque a segunda linha (`await page.locator('[data-action="edf-tournament"]').click();await expect(page.locator('[name="edf-comp-game"][value="ordem"]')).toBeChecked();`) por `await page.goto('/');await page.clock.runFor(2300);await page.locator('[data-action="duel"]').click();await page.locator('.duelo-modo:has([value="edf"])').click();await expect(page.locator('[name="edf-comp-game"][value="ordem"]')).toBeChecked();`.

- [ ] **Passo 9: Rodar os testes**

Run: `npm test`
Expected: PASS (o `tests/duel.test.js` antigo foi apagado).

Run: `npx playwright test tests/browser/duelo.spec.js tests/browser/edf-expanded.spec.js tests/browser/edf-sequencia.spec.js tests/browser/game.spec.js --reporter=line`
Expected: PASS. Se um teste do `duelo.spec.js` falhar por tempo (o sorteio dura 5 s de relógio simulado), confira se o `page.clock` está instalado antes do `goto` no auxiliar `home`.

Run (em segundo plano): `npx playwright test tests/browser/edf-anos.spec.js tests/browser/visual.spec.js tests/browser/upgrade.spec.js --reporter=line`
Expected: PASS.

- [ ] **Passo 10: Conferência visual**

Com um servidor local (`npm start`), tire capturas com o Playwright (1024×768 e 1920×1080) da configuração do duelo no modo Normal, no modo EDF 8º ano (com as três unidades marcadas) e da tela de sorteio, salve em `art-check-results/duelo/` e abra cada uma: os dois cartões de conteúdo, os quatro cartões de ano, as unidades, a lista de jogos, as equipes e o botão **Criar duelo** devem aparecer sem corte e sem rolagem horizontal. Descreva o que viu no relatório.

- [ ] **Passo 11: Commit**

```bash
git add -A app.js duelo-ui.js edf-menu.js edf.css index.html sw.js tests/browser/duelo.spec.js tests/browser/edf-expanded.spec.js tests/browser/edf-anos.spec.js tests/browser/edf-sequencia.spec.js
git commit -m "feat(duelo): Modo Duelo com escolha Normal ou EDF, equipes cadastradas e sem token

Remove o duelo antigo de três turmas, o token e a lista de alunos fixa.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected no `git status`: só `?? "Conteudos EDF/"` e `?? "Fotos do Evento/"`.

---

### Tarefa 3: Documentação, cache v17 e verificação final

**Arquivos:**
- Modificar: `sw.js`, `app.js`, `tests/sw-files.test.js`, `README.md`, `MODO_EDF_7_ANO.md`

- [ ] **Passo 1: Escrever a expectativa nova e ver falhar**

Em `tests/sw-files.test.js`, troque a versão esperada `'eejam-v16-edf-anos'` por `'eejam-v17-duelo'` (a asserção que compara com `VERSION` e o `caches.open(...)` de `app.js`).
Run: `node --test tests/sw-files.test.js`
Expected: FAIL (a versão ainda é `eejam-v16-edf-anos`).

- [ ] **Passo 2: Subir a versão do cache**

Em `sw.js`, troque `const VERSION='eejam-v16-edf-anos';` por `const VERSION='eejam-v17-duelo';`. Em `app.js`, troque `caches.open('eejam-v16-edf-anos')` por `caches.open('eejam-v17-duelo')`.
Run: `grep -rn "eejam-v16" --include=*.js --include=*.md . --exclude-dir=node_modules --exclude-dir=docs`
Expected: nenhuma linha. Rode `node --test tests/sw-files.test.js` e confira que passa (todos os arquivos do cache existem, inclusive `duelo.js` e `duelo-ui.js`).

- [ ] **Passo 3: Atualizar o `README.md`**

1. Troque toda a seção `## Modo Duelo (três turmas)` (do título até a linha anterior a `## Jogos e dificuldade`) por:
```
## Modo Duelo

O botão **Modo Duelo** abre direto a configuração, sem token. O professor escolhe o **conteúdo** (Normal ou Educação Física), cadastra de 2 a 8 equipes com seus participantes (um nome ou apelido por linha, até 60 por equipe) e define o total de rodadas (de 1 a 40, a última é a final).

- **Normal:** os 12 jogos do desafio (marketing, projetos e comunicação), à escolha do professor.
- **Educação Física:** o ano (6º ao 9º), as unidades e os 14 jogos EDF, incluindo o Ordene a Sequência.
- O sorteio dura cinco segundos: nomes giram, desaceleram e revelam o confronto. É possível trocar o participante de um lado só sem alterar o outro lado, o jogo ou as equipes.
- As classificatórias mantêm a diferença de participações das equipes em no máximo uma partida. A última rodada é a final entre as duas melhores. Quem já jogou não é sorteado de novo; **Adicionar participantes** acrescenta nomes durante o duelo.
- A tabela considera aproveitamento, vitórias e pontos; o empate absoluto é ordenado pelo nome da equipe. O ranking aparece animado depois de cada resultado confirmado.
- O duelo fica salvo a cada rodada neste aparelho. Depois de recarregar, **Modo Duelo** retoma no sorteio em que parou. Uma partida interrompida precisa ser repetida.
- Não há mais turmas fixas nem lista de alunos no jogo. Na primeira abertura desta versão, os dados do duelo antigo (turmas, nomes do M. Braga e jogos habilitados) são apagados do aparelho.
```
2. No parágrafo do EDF do início do arquivo (`O botão **EDF** oferece catorze jogos…`), troque a frase `Há partidas solo/livres e campeonato próprio com equipes, alunos, quantidade de rodadas, sorteio de cinco segundos, troca individual de aluno, ranking e final.` por `Há partidas solo e livres; equipes, participantes e sorteio ficam no Modo Duelo.`
3. No parágrafo "Arquivos principais", troque `duel.js (regras e sorteio do Modo Duelo), duel-ui.js e duel.css (telas do Modo Duelo), roster.js (alunos do 9º A e B)` por `duelo.js (regras e sorteio do Modo Duelo) e duelo-ui.js (telas do Modo Duelo)`. Se o texto exato diferir, ajuste só as menções a `duel.js`, `duel-ui.js`, `duel.css` e `roster.js`.
4. Troque as menções a `eejam-v16-edf-anos`, se houver, por `eejam-v17-duelo`.

- [ ] **Passo 4: Atualizar o `MODO_EDF_7_ANO.md`**

1. Troque a seção `## Equipes, alunos e sorteio` inteira (até a linha anterior a `## Conteúdo e artes`) por:
```
## Equipes, participantes e sorteio

As equipes, os participantes e o sorteio animado agora ficam no **Modo Duelo** da tela inicial (veja o README). Lá, escolha **Educação Física**, o ano, as unidades e os jogos EDF, cadastre as equipes e crie o duelo. Um duelo EDF salvo na versão anterior continua abrindo no Modo Duelo.
```
2. Em "Jogar uma partida" (no começo), troque a frase sobre reaproveitar "nomes das equipes cadastradas no campeonato normal" apenas se ela citar o campeonato EDF; o duelo livre continua como está.
3. Na linha final de "Verificação desta atualização", acrescente: `O Modo Duelo foi unificado: escolha de conteúdo Normal ou EDF, equipes e participantes cadastrados, sem token.`

- [ ] **Passo 5: Verificação completa**

Run: `npm test`
Expected: PASS. Anote o total.

Run (em segundo plano, cerca de 5 minutos): `npx playwright test --reporter=line`
Expected: todos passam, exceto a falha antiga `newgames.spec.js:125` (Palavra Secreta). Qualquer outra falha é regressão: investigue a causa raiz. Se for texto que mudou de propósito (por exemplo "Equipes, alunos e sorteio"), atualize o texto esperado no teste. Anote os totais.

Confirme também, com um servidor local, que o jogo abre e o Modo Duelo carrega sem erro no console: abra `http://localhost:4173`, clique em **Modo Duelo** e confira que aparece a configuração (sem modal de token) e que o console não tem erros.

- [ ] **Passo 6: Commit**

```bash
git add sw.js app.js tests/sw-files.test.js README.md MODO_EDF_7_ANO.md
git commit -m "docs(duelo): cache v17 e documentação do Modo Duelo unificado

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected no `git status`: só `?? "Conteudos EDF/"` e `?? "Fotos do Evento/"`.

---

## Desvios da especificação

- Os ids e as ações do DOM do campeonato (`edf-*`) foram mantidos para não reescrever os testes atuais; os rótulos visíveis mudaram para "Modo Duelo".
- O conteúdo padrão ao abrir o Modo Duelo é **Normal**; o ano e as unidades do EDF vêm da configuração salva do menu EDF (`eejam-edf-v1`).
