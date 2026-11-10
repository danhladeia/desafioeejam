import {normalizeEdfTopics} from './edf-content.js';
import {isGrade,DEFAULT_GRADE} from './edf-anos.js';
import {EDF_VARIANTS} from './edf-theme.js';
export const EDF_DUEL_KEY='eejam-edf-competition-v1';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
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
export function createEdfDuel({teams,rounds,games,topics,difficulty='normal',grade=DEFAULT_GRADE}){
 if(!Number.isInteger(rounds)||rounds<1||rounds>40)fail('Escolha de 1 a 40 rodadas, incluindo a final.');
 if(!Array.isArray(teams)||teams.length<2||teams.length>8)fail('Cadastre de 2 a 8 equipes.');
 const clean=teams.map((t,i)=>({id:'edf-team-'+i,name:typeof t.name==='string'?t.name.trim():'',students:namesOf(t.students)}));
 if(clean.length>2&&rounds<Math.ceil(clean.length/2)+1)fail(`Para ${clean.length} equipes, escolha ao menos ${Math.ceil(clean.length/2)+1} rodadas para que todas joguem antes da final.`);
 if(clean.some(t=>!t.name||t.name.length>40)||new Set(clean.map(t=>norm(t.name))).size!==clean.length)fail('Dê nomes diferentes às equipes, com até 40 caracteres.');
 if(!Array.isArray(games)||!games.length||games.some(id=>!Object.hasOwn(EDF_VARIANTS,id))||new Set(games).size!==games.length)fail('Selecione ao menos um jogo EDF válido, sem repetições.');
 if(!['normal','hard'].includes(difficulty))fail('Dificuldade inválida.');
 if(!isGrade(grade))fail('Ano inválido.');
 return{version:1,createdAt:Date.now(),teams:clean,rounds,games:[...games],topics:normalizeEdfTopics(topics,Number(grade)),difficulty,done:0,current:null,history:[],usedGames:[],lastGame:null,lastPair:null,champion:null,used:Object.fromEntries(clean.map(t=>[t.id,[]])),stats:Object.fromEntries(clean.map(t=>[t.id,{played:0,wins:0,points:0}])),grade:Number(grade)};
}
const compare=(a,b)=>(b.played?b.wins/b.played:0)-(a.played?a.wins/a.played:0)||b.wins-a.wins||b.points-a.points||a.name.localeCompare(b.name,'pt-BR');
export function edfStandings(state){
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
export function drawEdfTurn(state,rng=Math.random){
 if(state.done>=state.rounds)fail('O campeonato EDF já terminou.');if(state.current)return state.current;
 const isFinal=state.done===state.rounds-1;let pair=isFinal?edfStandings(state).slice(0,2).map(t=>t.id):pick(pairs(state),rng);if(rng()<.5)pair=[...pair].reverse();
 const sides=pair.map(teamId=>({teamId,student:student(state,teamId,rng)})),gameId=pick(gamePool(state),rng);
 state.current={turn:state.done+1,isFinal,gameId,sides,refused:[[],[]]};return state.current;
}
export function redrawEdfStudent(state,side,rng=Math.random){
 if(!state.current||![0,1].includes(side))fail('Não há aluno sorteado nesse lado.');
 const current=state.current,refused=[...current.refused[side],current.sides[side].student],next=student(state,current.sides[side].teamId,rng,refused);
 current.refused[side]=refused;current.sides[side]={...current.sides[side],student:next};return current;
}
function checkTurn(state,current){
 if(!current||current.turn!==state.done+1||current.isFinal!==(state.done===state.rounds-1)||!gamePool(state).includes(current.gameId)||!Array.isArray(current.sides)||current.sides.length!==2)fail('Rodada EDF salva inválida.');
 const ids=current.sides.map(s=>s.teamId);if(new Set(ids).size!==2)fail('Uma equipe não pode enfrentar a si mesma.');
 const allowed=current.isFinal?[edfStandings(state).slice(0,2).map(t=>t.id)]:pairs(state);if(!allowed.some(p=>pairKey(p)===pairKey(ids)))fail('Confronto incompatível com o equilíbrio das equipes ou com a final.');
 if(!Array.isArray(current.refused)||current.refused.length!==2)fail('Recusas de alunos inválidas.');
 current.sides.forEach((s,i)=>{const team=state.teams.find(t=>t.id===s.teamId),refused=current.refused[i];if(!team||!team.students.includes(s.student)||state.used[team.id].includes(s.student)||!Array.isArray(refused)||new Set(refused).size!==refused.length||refused.includes(s.student)||refused.some(n=>!team.students.includes(n)||state.used[team.id].includes(n)))fail('A rodada contém aluno inválido ou repetido.');});
}
export function commitEdfTurn(state,{scores,winnerSide}){
 if(state.done>=state.rounds)fail('O campeonato já terminou.');checkTurn(state,state.current);
 if(![0,1].includes(winnerSide)||!Array.isArray(scores)||scores.length!==2||scores.some(n=>!Number.isSafeInteger(n)||n<0))fail('Resultado EDF inválido.');
 const round=clone(state.current);round.scores=[...scores];round.winnerSide=winnerSide;
 round.sides.forEach((s,i)=>{state.used[s.teamId].push(s.student);const stats=state.stats[s.teamId];stats.played++;stats.points+=scores[i];if(i===winnerSide)stats.wins++});
 if(state.usedGames.length===state.games.length)state.usedGames=[];state.usedGames.push(round.gameId);state.lastGame=round.gameId;state.lastPair=pairKey(round.sides.map(s=>s.teamId));state.history.push(round);state.done++;state.current=null;if(round.isFinal)state.champion=round.sides[winnerSide].teamId;return state;
}
export function addEdfStudents(state,id,names){const team=state.teams.find(t=>t.id===id);if(!team)fail('Equipe inválida.');team.students=namesOf([...team.students,...names]);return state}
export function validateEdfDuel(value){
 if(!value||value.version!==1||!Array.isArray(value.history)||value.history.length>40)fail('Campeonato EDF salvo inválido.');
 if(value.grade===undefined)value={...value,grade:DEFAULT_GRADE};
 const rebuilt=createEdfDuel({teams:value.teams,rounds:value.rounds,games:value.games,topics:value.topics,difficulty:value.difficulty,grade:value.grade});
 if(!same(rebuilt.teams,value.teams)||!Number.isFinite(value.createdAt))fail('Cadastro EDF salvo inválido.');rebuilt.createdAt=value.createdAt;
 for(const round of value.history){rebuilt.current=clone(round);delete rebuilt.current.scores;delete rebuilt.current.winnerSide;commitEdfTurn(rebuilt,round)}
 if(value.current){checkTurn(rebuilt,value.current);rebuilt.current=clone(value.current)}
 if(!same(rebuilt,value))fail('Dados do campeonato EDF estão inconsistentes. O arquivo original foi preservado.');return clone(rebuilt);
}
export function saveEdfDuel(state,storage=localStorage){const clean=validateEdfDuel(state);storage.setItem(EDF_DUEL_KEY,JSON.stringify(clean));return clean}
export function loadEdfDuel(storage=localStorage){const text=storage.getItem(EDF_DUEL_KEY);return text?validateEdfDuel(JSON.parse(text)):null}
