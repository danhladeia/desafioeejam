import {normalizeEdfTopics} from './edf-content.js';
import {getGrade,DEFAULT_GRADE} from './edf-anos.js';
import {makeEdfGame} from './edf-theme.js';
import {createEdfDuel,drawEdfTurn,redrawEdfStudent,commitEdfTurn,edfStandings,loadEdfDuel,saveEdfDuel,addEdfStudents,EDF_DUEL_KEY} from './edf-duel.js';
import {uiIcon} from './ui-art.js';

export function createEdfDuelUI(api){
 const {esc,button,prefs,toast,ask}=api,$=s=>document.querySelector(s);let state=null,requested=null,timers=[],busy=false;
 const stop=()=>{timers.forEach(clearTimeout);timers=[];busy=false};
 const delay=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const show=(name,html)=>{stop();api.dispose();api.show(name,html,'edf-competition')};
 const team=id=>state.teams.find(t=>t.id===id);
 const game=id=>makeEdfGame(api.games.find(g=>g.id===id),state.topics,state.grade);
 const persist=draft=>{const saved=saveEdfDuel(draft);state=saved};
 const attempt=fn=>{try{return fn()}catch(error){toast(error.message)}};
 function table(){return `<ol class="edf-ranking">${edfStandings(state).map((t,i)=>`<li style="--rank:${i}"><b>${i+1}. ${esc(t.name)}</b><span>${t.wins} vitórias • ${t.played} jogos • ${t.points} pontos</span></li>`).join('')}</ol>`}
 function open(topics,grade=DEFAULT_GRADE){requested={topics,grade};
  try{state=loadEdfDuel()}catch(error){show('edf-save-error',`<h1>Não foi possível ler o campeonato EDF.</h1><p>${esc(error.message)}</p><p>Os dados originais foram preservados neste aparelho.</p><div class="actions">${button('Configurar novo campeonato EDF','edf-match-new')}${button('Voltar ao EDF','edf')}</div>`);return}
  if(state)return ready();setup();
 }
 function setup(topics=requested?.topics??state?.topics,grade=requested?.grade??state?.grade??DEFAULT_GRADE){
  const info=getGrade(grade),ids=normalizeEdfTopics(topics??info.defaultTopics,info.grade);
  show('edf-competition-setup',`<div class="page-heading"><span class="eyebrow">CAMPEONATO EDF • ${info.grade}º ANO • EQUIPES E ALUNOS</span><h1>Monte as equipes. Prepare o duelo.</h1><p>Classificatórias equilibradas, sorteio de alunos inéditos e final entre as duas melhores equipes.</p></div><form id="edf-competition-form" class="edf-setup"><div class="edf-options"><label>Total de rodadas, incluindo a final<input id="edf-rounds" type="number" min="1" max="40" value="5" required></label><label>Dificuldade inicial<select id="edf-competition-level"><option value="normal">Desafio • ${info.grade}º ano</option><option value="hard">Avançado</option></select></label></div><fieldset class="edf-topics"><legend>Conteúdos do campeonato</legend>${info.topics.map(t=>`<label class="edf-topic"><input type="checkbox" name="edf-comp-topic" value="${t.id}" ${ids.includes(t.id)?'checked':''}><span><b>${esc(t.title)}</b><small>${t.supplement?'Complemento':t.description}</small></span></label>`).join('')}</fieldset><fieldset class="edf-game-options"><legend>Jogos que entram no sorteio</legend>${api.games.map(g=>`<label><input type="checkbox" name="edf-comp-game" value="${g.id}" checked> ${esc(makeEdfGame(g,ids,info.grade).title)}</label>`).join('')}</fieldset><div id="edf-team-editor" class="team-editor"></div><div class="actions"><button type="button" id="edf-add-team" class="secondary">${uiIcon('teams')} Adicionar equipe</button>${api.getTeams().length>=2?'<button type="button" id="edf-import-teams" class="secondary">Usar equipes cadastradas</button>':''}</div><p class="edf-note">De 2 a 8 equipes, com até 60 alunos em cada uma. Um nome ou apelido por linha. Alunos que já jogaram não entram novamente no sorteio. Você poderá adicionar mais alunos durante o campeonato.</p><div class="actions">${button('Voltar','edf')}<button type="submit" class="primary">${uiIcon('confirm')} Criar campeonato EDF</button></div></form>`);
  function row(name='',students=[]){const host=$('#edf-team-editor');if(host.children.length>=8)return toast('Limite de oito equipes.');const el=document.createElement('section');el.className='team-row';el.innerHTML=`<label>Nome da equipe<input class="edf-team-name" maxlength="40" value="${esc(name)}" required></label><label>Alunos — um por linha<textarea class="edf-team-students" rows="4" required>${students.map(esc).join('\n')}</textarea></label><button type="button" class="secondary edf-remove-team">${uiIcon('trash')} Remover equipe</button>`;el.querySelector('button').onclick=()=>{if(host.children.length<=2)return toast('Mantenha ao menos duas equipes.');el.remove()};host.append(el)}
  row();row();$('#edf-add-team').onclick=()=>row();$('#edf-competition-level').value=prefs.difficulty;
  if($('#edf-import-teams'))$('#edf-import-teams').onclick=()=>{$('#edf-team-editor').replaceChildren();api.getTeams().slice(0,8).forEach(t=>row(t.name,t.members))};
  $('#edf-competition-form').onsubmit=async e=>{e.preventDefault();try{
   const draft=createEdfDuel({teams:[...$('#edf-team-editor').children].map(el=>({name:el.querySelector('input').value,students:el.querySelector('textarea').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean)})),rounds:Number($('#edf-rounds').value),topics:[...document.querySelectorAll('[name="edf-comp-topic"]:checked')].map(el=>el.value),grade:info.grade,games:[...document.querySelectorAll('[name="edf-comp-game"]:checked')].map(el=>el.value),difficulty:$('#edf-competition-level').value});
   if((state||localStorage.getItem(EDF_DUEL_KEY))&&!await ask('Criar outro campeonato EDF?','O campeonato EDF atual será substituído. O campeonato normal não muda.'))return;
   persist(draft);ready();
  }catch(error){toast(error.message)}};
 }
 function ready(){
  if(state.done>=state.rounds)return champion();
  show('edf-competition-ready',`<div class="page-heading"><span class="eyebrow">CAMPEONATO EDF • ${state.grade}º ANO • ${state.done} DE ${state.rounds} RODADAS</span><h1>${state.current?'Sorteio já preparado.':'Quem entra no próximo duelo?'}</h1><p>A última rodada é a final. Classificação por aproveitamento, vitórias e pontos.</p></div>${table()}<div class="actions">${button(state.current?'Ver sorteio pendente':state.done===state.rounds-1?'Sortear a FINAL':`Sortear rodada ${state.done+1}`,'edf-match-draw','primary')}${button('Adicionar alunos','edf-match-add')}${button('Novo campeonato EDF','edf-match-new')}${button('Voltar ao EDF','edf')}</div>`);
 }
 function reveal(){
  const current=state.current;if(!current)return ready();
  show('edf-competition-reveal',`<div class="page-heading"><span class="eyebrow">${current.isFinal?'GRANDE FINAL':`RODADA ${current.turn} DE ${state.rounds}`}</span><h1>${esc(game(current.gameId).title)}</h1></div><div class="edf-versus">${current.sides.map((s,i)=>`${i===1?uiIcon('versus'):''}<section class="edf-player ${i?'orange':'blue'}"><small>${esc(team(s.teamId).name)}</small><h2>${esc(s.student)}</h2>${button('Sortear outro aluno','edf-match-redraw','secondary',`data-side-index="${i}"`)}</section>`).join('')}</div><p class="edf-note">Se alguém não puder participar, troque apenas o aluno desse lado. Quem já jogou não será sorteado novamente.</p><div class="actions">${button('Começar partida EDF','edf-match-start','primary')}${button('Adicionar alunos','edf-match-add')}${button('Voltar ao placar','edf-match-back')}</div>`);
 }
 function spin(side){
  if(busy)return;let draft=structuredClone(state);try{if(side===undefined)drawEdfTurn(draft);else redrawEdfStudent(draft,side);persist(draft)}catch(error){toast(error.message);return}
  if(prefs.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)return reveal();
  const cur=state.current;
  show('edf-competition-spin',`<div class="page-heading"><span class="eyebrow">${cur.isFinal?'SORTEIO DA FINAL':'SORTEIO EDF'}</span><h1>O próximo duelo vem aí...</h1></div><div class="edf-spin-game" id="edf-spin-game"></div><div class="edf-versus">${cur.sides.map((s,i)=>`${i?uiIcon('versus'):''}<section class="edf-player ${i?'orange':'blue'}"><small id="edf-spin-team-${i}">${esc(team(s.teamId).name)}</small><h2 id="edf-spin-name-${i}">${esc(s.student)}</h2></section>`).join('')}</div><p class="edf-spin-status" role="status">Sorteando... os nomes estão desacelerando.</p>`);
  busy=true;const started=performance.now();api.sound('shuffle');
  function frame(){const elapsed=performance.now()-started;if(elapsed>=5000){api.sound('start');return reveal()}
   $('#edf-spin-game').textContent=elapsed<2000?game(state.games[Math.floor(Math.random()*state.games.length)]).title:game(cur.gameId).title;
   cur.sides.forEach((s,i)=>{if(side!==undefined&&side!==i)return;const t=elapsed<1500?state.teams[Math.floor(Math.random()*state.teams.length)]:team(s.teamId);$('#edf-spin-team-'+i).textContent=t.name;$('#edf-spin-name-'+i).textContent=t.students[Math.floor(Math.random()*t.students.length)]});
   delay(frame,Math.min(5000-elapsed,30+Math.pow(elapsed/5000,3)*430));
  }frame();
 }
 function start(){if(busy||!state.current)return;const cur=state.current;api.startMatch({kind:'edf',gameId:cur.gameId,topics:[...state.topics],grade:state.grade,difficulty:state.difficulty,turn:cur.turn,total:state.rounds,isFinal:cur.isFinal,names:cur.sides.map(s=>s.student),labels:cur.sides.map(s=>team(s.teamId).name)})}
 function result(session){
  const current=state.current;if(!current)return ready();
  show('edf-competition-result',`<div class="result"><span class="eyebrow">RESULTADO DA RODADA EDF</span><div class="trophy">${uiIcon('trophy')}</div><h1>${esc(session.names[session.winner])}<br><span>venceu pela ${esc(team(current.sides[session.winner].teamId).name)}!</span></h1><p class="accuracy-result">${session.correctCounts[0]} × ${session.correctCounts[1]} acertos</p><div class="result-scores"><span>AZUL <b>${session.scores[0]}</b></span><em>×</em><span>LARANJA <b>${session.scores[1]}</b></span></div><div class="actions"><button class="primary" id="edf-confirm-result">Confirmar resultado e ver ranking</button>${button('Repetir partida','edf-match-start')}${button('Voltar ao sorteio','edf-match-reveal')}</div></div>`);
  $('#edf-confirm-result').onclick=()=>{try{const draft=structuredClone(state);commitEdfTurn(draft,{scores:session.scores,winnerSide:session.winner});persist(draft);ranking()}catch(error){toast(error.message)}};
 }
 function ranking(){
  show('edf-competition-ranking',`<div class="page-heading"><span class="eyebrow">RODADA ${state.done} CONFIRMADA</span><h1>Como ficou a classificação?</h1><p id="edf-ranking-status" role="status">Calculando o placar...</p></div><div class="edf-ranking-reveal">${table()}</div><div class="actions">${button(state.done>=state.rounds?'Ver equipe campeã':'Próximo sorteio','edf-match-back','primary','disabled id="edf-ranking-next"')}${button('Pausar campeonato','edf')}</div>`);
  const done=()=>{$('#edf-ranking-status').textContent=state.done>=state.rounds?'A final definiu a equipe campeã!':state.done===state.rounds-1?'As duas melhores equipes vão disputar a FINAL!':'Classificação atualizada.';$('#edf-ranking-next').disabled=false;busy=false};
  if(prefs.reduced)return done();busy=true;delay(done,2000);
 }
 function champion(){
  show('edf-competition-champion',`<div class="result"><div class="trophy">${uiIcon('trophy')}</div><span class="eyebrow">CAMPEONATO EDF CONCLUÍDO</span><h1>${esc(team(state.champion).name)}<br><span>equipe campeã!</span></h1>${table()}<div class="actions">${button('Novo campeonato EDF','edf-match-new','primary')}${button('Voltar ao EDF','edf')}</div></div>`);api.celebrate();
 }
 function add(){
  const modal=api.modal;modal.innerHTML=`<h2>Adicionar alunos ao campeonato EDF</h2><label>Equipe<select id="edf-add-team-id">${state.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label><label>Novos alunos — um por linha<textarea id="edf-add-students" rows="6"></textarea></label><p>Os resultados e os alunos que já jogaram serão preservados.</p><div class="actions"><button class="secondary" id="edf-add-cancel">Cancelar</button><button class="primary" id="edf-add-save">Salvar alunos</button></div>`;modal.showModal();$('#edf-add-cancel').onclick=()=>modal.close();$('#edf-add-save').onclick=()=>attempt(()=>{const names=$('#edf-add-students').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean);if(!names.length)throw Error('Informe ao menos um aluno novo.');const draft=structuredClone(state);addEdfStudents(draft,$('#edf-add-team-id').value,names);persist(draft);modal.close();toast('Alunos adicionados. O sorteio já pode continuar.');state.current?reveal():ready()});
 }
 function action(name,el){if(name==='edf-match-new')return setup();if(name==='edf-match-add')return add();if(name==='edf-match-back')return busy?null:ready();if(name==='edf-match-reveal')return reveal();if(name==='edf-match-draw')return state.current?reveal():spin();if(name==='edf-match-redraw')return spin(Number(el.dataset.sideIndex));if(name==='edf-match-start')return start()}
 return{open,action,result,back:()=>state?.current?reveal():ready(),stop};
}
