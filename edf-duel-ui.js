import {normalizeEdfTopics} from './edf-content.js';
import {getGrade,DEFAULT_GRADE,EDF_GRADES} from './edf-anos.js';
import {makeEdfGame} from './edf-theme.js';
import {createEdfDuel,drawEdfTurn,redrawEdfStudent,redrawEdfGame,commitEdfTurn,edfStandings,loadEdfDuel,saveEdfDuel,addEdfStudents,EDF_DUEL_KEY} from './edf-duel.js';
import {uiIcon} from './ui-art.js';

export function createEdfDuelUI(api){
 const {esc,button,prefs,toast,ask}=api,$=s=>document.querySelector(s);let state=null,requested=null,timers=[],busy=false;
 let animations=[];
 const stop=()=>{timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];busy=false};
 const rand=list=>list[Math.floor(Math.random()*list.length)];
 const reduced=()=>prefs.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const delay=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const show=(name,html)=>{stop();api.dispose();api.show(name,html,'edf-competition')};
 const team=id=>state.teams.find(t=>t.id===id);
 const game=id=>state.mode==='normal'?api.normalGames.find(g=>g.id===id):makeEdfGame(api.games.find(g=>g.id===id),state.topics,state.grade);
 const tag=()=>state?.mode==='normal'?'MODO DUELO':`MODO DUELO • EDF ${state.grade}º ANO`;
 const persist=draft=>{const saved=saveEdfDuel(draft);state=saved};
 const attempt=fn=>{try{return fn()}catch(error){toast(error.message)}};
 function table(){return `<ol class="edf-ranking">${edfStandings(state).map((t,i)=>`<li style="--rank:${i}"><b>${i+1}. ${esc(t.name)}</b><span>${t.wins} vitórias • ${t.played} jogos • ${t.points} pontos</span></li>`).join('')}</ol>`}
 function open(topics,grade=DEFAULT_GRADE){requested={topics,grade};
  try{state=loadEdfDuel()}catch(error){show('edf-save-error',`<h1>Não foi possível ler o campeonato EDF.</h1><p>${esc(error.message)}</p><p>Os dados originais foram preservados neste aparelho.</p><div class="actions">${button('Configurar novo duelo','edf-match-new')}${button('Voltar ao menu','home')}</div>`);return}
  if(state)return ready();setup();
 }
 function openDuelo(){requested=null;
  try{state=loadEdfDuel()}catch(error){show('edf-save-error',`<h1>Não foi possível ler o duelo salvo.</h1><p>${esc(error.message)}</p><p>Os dados originais foram preservados neste aparelho.</p><div class="actions">${button('Configurar novo duelo','edf-match-new')}${button('Voltar','home')}</div>`);return}
  if(state)return ready();setup();
 }
 function setup(topics=requested?.topics??state?.topics,grade=requested?.grade??state?.grade??DEFAULT_GRADE){
  const cfg={mode:requested?'edf':(state?.mode??'normal'),grade:Number(grade),topics:topics??null};
  const levelOf=v=>v==='normal'?'medium':(v||'medium');
  show('edf-competition-setup',`<div class="page-heading"><span class="eyebrow">MODO DUELO • EQUIPES E PARTICIPANTES</span><h1>Monte as equipes. Prepare o duelo.</h1><p>Escolha o conteúdo e os jogos, cadastre as equipes e os nomes. Classificatórias equilibradas, sorteio de alunos inéditos e final entre as duas melhores equipes.</p></div><form id="edf-competition-form" class="edf-setup"><fieldset class="duelo-modos"><legend>Conteúdo do duelo</legend><label class="duelo-modo"><input type="radio" name="duelo-mode" value="normal"><span><b>Normal</b><small>Os jogos do Duelo do Futuro: palavras, números, atenção e ação.</small></span></label><label class="duelo-modo"><input type="radio" name="duelo-mode" value="edf"><span><b>Educação Física (EDF)</b><small>Os mesmos jogos com o conteúdo dos cadernos do 6º ao 9º ano.</small></span></label></fieldset><div id="duelo-dyn"></div><div class="edf-options"><div class="rounds-pick" role="group" aria-label="Total de rodadas, incluindo a final"><span>Total de rodadas, incluindo a final</span><div class="rounds-ctl"><button type="button" class="secondary" id="rounds-minus" aria-label="Menos uma rodada">−</button><input id="edf-rounds" type="number" inputmode="numeric" min="1" max="40" value="5" required><button type="button" class="secondary" id="rounds-plus" aria-label="Mais uma rodada">+</button></div><div class="rounds-presets">${[3,5,8,10,15].map(n=>`<button type="button" class="secondary small" data-rounds="${n}">${n}</button>`).join('')}</div></div><label>Dificuldade inicial<select id="edf-competition-level"><option value="easy">Fácil</option><option value="medium">Médio</option><option value="hard">Difícil</option></select></label></div><div id="edf-team-editor" class="team-editor"></div><div class="actions"><button type="button" id="edf-add-team" class="secondary">${uiIcon('teams')} Adicionar equipe</button></div><p class="edf-note">De 2 a 8 equipes, com até 60 participantes em cada uma. Um nome ou apelido por linha. Quem já jogou não entra de novo no sorteio. Você poderá adicionar mais participantes durante o duelo.</p><div class="actions">${button('Voltar','home','secondary','type="button"')}<button type="submit" class="primary">${uiIcon('confirm')} Criar duelo</button></div></form>`);
  const selected=()=>[...document.querySelectorAll('[name="edf-comp-game"]:checked')].map(el=>el.value);
  function dyn(){
   const keepGames=new Set(selected());const info=getGrade(cfg.grade),ids=normalizeEdfTopics(cfg.topics??info.defaultTopics,info.grade);
   const list=cfg.mode==='normal'?api.normalGames.map(g=>({id:g.id,title:g.title})):api.games.map(g=>({id:g.id,title:makeEdfGame(g,ids,info.grade).title}));
   const grades=cfg.mode==='edf'?`<fieldset class="edf-grades"><legend>Qual ano vai jogar?</legend>${EDF_GRADES.map(g=>`<label class="edf-grade"><input type="radio" name="duelo-grade" value="${g.grade}" ${g.grade===info.grade?'checked':''}><span><b>${g.grade}º ano</b><small>${esc(g.tagline)}</small></span></label>`).join('')}</fieldset><fieldset class="edf-topics"><legend>Conteúdos do duelo</legend>${info.topics.map(t=>`<label class="edf-topic"><input type="checkbox" name="edf-comp-topic" value="${t.id}" ${ids.includes(t.id)?'checked':''}><span><b>${esc(t.title)}</b><small>${t.supplement?'Complemento':t.description}</small></span></label>`).join('')}</fieldset>`:'';
   $('#duelo-dyn').innerHTML=`${grades}<fieldset class="edf-game-options"><legend>Jogos que entram no sorteio <span class="duelo-count" id="duelo-count"></span></legend><div class="actions"><button type="button" class="secondary small" id="duelo-all">Marcar todos</button><button type="button" class="secondary small" id="duelo-none">Desmarcar todos</button></div>${list.map(g=>`<label><input type="checkbox" name="edf-comp-game" value="${g.id}" ${keepGames.size?(keepGames.has(g.id)?'checked':''):'checked'}> ${esc(g.title)}</label>`).join('')}</fieldset>`;
   const count=()=>{$('#duelo-count').textContent=`(${selected().length} de ${list.length})`};count();
   document.querySelectorAll('[name="edf-comp-game"]').forEach(el=>el.onchange=count);
   $('#duelo-all').onclick=()=>{document.querySelectorAll('[name="edf-comp-game"]').forEach(el=>el.checked=true);count()};$('#duelo-none').onclick=()=>{document.querySelectorAll('[name="edf-comp-game"]').forEach(el=>el.checked=false);count()};
   document.querySelectorAll('[name="duelo-grade"]').forEach(el=>el.onchange=()=>{cfg.grade=Number(el.value);cfg.topics=null;dyn()});
   document.querySelectorAll('[name="edf-comp-topic"]').forEach(el=>el.onchange=()=>{cfg.topics=[...document.querySelectorAll('[name="edf-comp-topic"]:checked')].map(x=>x.value)});
  }
  document.querySelectorAll('[name="duelo-mode"]').forEach(el=>{el.checked=el.value===cfg.mode;el.onchange=()=>{cfg.mode=el.value;cfg.topics=null;document.querySelectorAll('[name="edf-comp-game"]').forEach(x=>x.checked=true);$('#duelo-dyn').innerHTML='';dyn()}});
  dyn();
  function row(name='',students=[]){const host=$('#edf-team-editor');if(host.children.length>=8)return toast('Limite de oito equipes.');const el=document.createElement('section');el.className='team-row';el.innerHTML=`<label>Nome da equipe<input class="edf-team-name" maxlength="40" value="${esc(name)}" required></label><label>Alunos — um por linha<textarea class="edf-team-students" rows="4" required>${students.map(esc).join('\n')}</textarea></label><button type="button" class="secondary edf-remove-team">${uiIcon('trash')} Remover equipe</button>`;el.querySelector('button').onclick=()=>{if(host.children.length<=2)return toast('Mantenha ao menos duas equipes.');el.remove()};host.append(el)}
  {const inp=$('#edf-rounds'),setR=n=>{inp.value=Math.max(1,Math.min(40,Math.round(n)||1))};$('#rounds-minus').onclick=()=>setR(Number(inp.value)-1);$('#rounds-plus').onclick=()=>setR(Number(inp.value)+1);document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>setR(Number(b.dataset.rounds)))}
  row();row();$('#edf-add-team').onclick=()=>row();$('#edf-competition-level').value=levelOf(prefs.difficulty);
  $('#edf-competition-form').onsubmit=async e=>{e.preventDefault();try{
   const mode=document.querySelector('[name="duelo-mode"]:checked')?.value??'normal',draft=createEdfDuel({teams:[...$('#edf-team-editor').children].map(el=>({name:el.querySelector('input').value,students:el.querySelector('textarea').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean)})),rounds:Number($('#edf-rounds').value),topics:mode==='edf'?[...document.querySelectorAll('[name="edf-comp-topic"]:checked')].map(el=>el.value):[],grade:mode==='edf'?cfg.grade:DEFAULT_GRADE,games:selected(),difficulty:$('#edf-competition-level').value,mode});
   if((state||localStorage.getItem(EDF_DUEL_KEY))&&!await ask('Criar outro duelo?','O duelo atual será substituído. O campeonato por chaveamento não muda.'))return;
   persist(draft);ready();
  }catch(error){toast(error.message)}};
 }
 function ready(){
  if(state.done>=state.rounds)return champion();
  show('edf-competition-ready',`<div class="page-heading"><span class="eyebrow">${tag()} • ${state.done} DE ${state.rounds} RODADAS</span><h1>${state.current?'Sorteio já preparado.':'Quem entra no próximo duelo?'}</h1><p>A última rodada é a final. Classificação por aproveitamento, vitórias e pontos.</p></div>${table()}<div class="actions">${button(state.current?'Ver sorteio pendente':state.done===state.rounds-1?'Sortear a FINAL':`Sortear rodada ${state.done+1}`,'edf-match-draw','primary')}${button('Adicionar participantes','edf-match-add')}${button('Novo duelo','edf-match-new')}${button('Voltar ao menu','home')}</div>`);
 }

 const strip=cells=>`<div class="strip">${cells.join('')}</div>`;
 const textCells=(list,winner,F)=>{const cells=[];for(let i=0;i<F;i++){const opts=list.filter(t=>t!==cells.at(-1));cells.push(rand(opts.length?opts:list))}return [...cells,winner].map(t=>`<div class="cell">${esc(t)}</div>`)};
 const gameCells=(winnerId,F)=>{const ids=state.games,cells=[];for(let i=0;i<F;i++){const opts=ids.filter(id=>id!==cells.at(-1));cells.push(rand(opts.length?opts:ids))}const other=rand(ids.filter(id=>id!==winnerId))??winnerId;return [...cells,winnerId,other].map(id=>`<div class="cell">${api.seal(id)}</div>`)};
 /** Sorteio animado (5 s): jogo, equipes e participantes giram em faixas e travam um a um. Trocas individuais animam só o lado trocado. */
 function draw(mode='full'){
  const d=state.current;if(!d)return ready();
  const F={game:48,cls:44,stu:50},teamNames=state.teams.map(t=>t.name);
  const pips=Array.from({length:state.rounds},(_,i)=>`<i class="${i<state.done?'done':i===state.done?'now':''}"></i>`).join('');
  const side=(s,i)=>{const t=team(s.teamId),students=t.students.filter(n=>!state.used[t.id].includes(n)&&!d.refused[i].includes(n));return `<section class="dd-side ${i?'orange':'blue'}" data-i="${i}"><small>Equipe • lado ${i?'laranja':'azul'}</small><div class="reel reel-v reel-class" data-reel="c${i}">${strip(textCells(teamNames,t.name,F.cls))}</div><small>Participante</small><div class="reel reel-v reel-student" data-reel="s${i}">${strip(textCells(students,s.student,F.stu))}</div><button class="secondary small dd-redraw" data-action="edf-match-redraw" data-side-index="${i}" disabled>${uiIcon('shuffle')} Trocar participante do lado ${i?'laranja':'azul'}</button></section>`};
  show('edf-competition-draw',`<div class="duel-draw"><div class="dd-head"><div class="dd-round">${d.isFinal?`<span class="final-tag">${uiIcon('trophy')} GRANDE FINAL</span>`:`Rodada <b>${d.turn}</b> de ${state.rounds}`}</div><div class="pips" aria-hidden="true">${pips}</div><span class="dd-status" id="dd-status" role="status">${mode==='full'?'Sorteando por 5 segundos...':tag()}</span></div><div class="reel reel-h reel-game" data-reel="game" role="img" aria-label="Sorteio do jogo">${strip(gameCells(d.gameId,F.game))}</div><h2 class="dd-game" id="dd-game" aria-live="polite">${esc(game(d.gameId).title)}</h2><div class="dd-sides">${side(d.sides[0],0)}<b class="dd-vs" id="dd-vs" aria-label="versus">${uiIcon('versus')}</b>${side(d.sides[1],1)}</div><div class="dd-actions" id="dd-actions">${button('Adicionar participantes','edf-match-add')}${button(`${uiIcon('shuffle')} Sortear outro jogo`,'edf-match-redraw-game')}${button('Voltar ao placar','edf-match-back')}${button(`${d.isFinal?'Começar final':'Começar partida'} ${uiIcon('next')}`,'edf-match-start','primary')}</div></div>`);
  const root=$('.duel-draw'),R=key=>root.querySelector(`[data-reel="${key}"]`),at=(ms,fn)=>timers.push(setTimeout(()=>{if(root.isConnected)fn()},ms));
  // posição final em % do comprimento da faixa, para não depender do tamanho da tela
  const stops={game:((F.game-1)/(F.game+2))*100,c0:(F.cls/(F.cls+1))*100,c1:(F.cls/(F.cls+1))*100,s0:(F.stu/(F.stu+1))*100,s1:(F.stu/(F.stu+1))*100};
  const place=(key,ms)=>{const el=R(key),st=el.querySelector('.strip'),pos=stops[key],move=key==='game'?`translate3d(${-pos}%,0,0)`:`translate3d(0,${-pos}%,0)`;st.style.transition='none';st.style.transform=move;
   if(ms){el.classList.add('spin');const middle=key==='game'?`translate3d(${-pos*.7}%,0,0)`:`translate3d(0,${-pos*.7}%,0)`;animations.push(st.animate([{transform:'translate3d(0,0,0)',offset:0,easing:'linear'},{transform:middle,offset:.44,easing:'cubic-bezier(0,.65,.25,1)'},{transform:move,offset:1}],{duration:ms,easing:'linear'}))}};
  const lock=(key,celebrate=true)=>{const el=R(key);el.classList.remove('spin');el.classList.add('locked');if(celebrate){api.sound(true);const r=el.getBoundingClientRect();api.burst?.(r.x+r.width/2,r.y+r.height/2,true,14)}};
  const showGame=()=>$('#dd-game').classList.add('on');
  const finishUp=animated=>{$('#dd-vs').classList.add('on');$('#dd-actions').classList.add('show');root.ready=true;busy=false;root.querySelectorAll('.dd-redraw').forEach(b=>{b.disabled=false});$('#dd-status').textContent=d.isFinal?'Final: a vitória decide a equipe campeã.':'Participantes revelados. Tudo pronto!';if(animated)api.sound('start')};
  const settle=keys=>keys.forEach(k=>{place(k,0);lock(k,false)});
  const keys=['game','c0','c1','s0','s1'];
  if(mode==='static'){settle(keys);showGame();finishUp(false);return}
  const moving=/^s[01]$/.test(mode)?[mode]:mode==='game'?['game']:keys;
  settle(keys.filter(k=>!moving.includes(k)));if(mode!=='full')showGame();
  busy=true;api.sound('shuffle');const duration=mode==='full'?5000:800;moving.forEach(k=>place(k,duration));
  at(duration,()=>{moving.forEach(k=>lock(k,false));showGame();finishUp(true)});
 }
 const reveal=()=>draw('static');
 function spin(side){
  if(busy)return;let draft=structuredClone(state);try{if(side===undefined)drawEdfTurn(draft);else if(side==='game')redrawEdfGame(draft);else redrawEdfStudent(draft,side);persist(draft)}catch(error){toast(error.message);return}
  draw(side===undefined?'full':side==='game'?'game':`s${side}`);
 }
 function start(){if(busy||!state.current)return;const cur=state.current;api.startMatch({kind:'edf',mode:state.mode,gameId:cur.gameId,topics:[...state.topics],grade:state.grade,difficulty:state.difficulty,turn:cur.turn,total:state.rounds,isFinal:cur.isFinal,names:cur.sides.map(s=>s.student),labels:cur.sides.map(s=>team(s.teamId).name)})}
 function result(session){
  const current=state.current;if(!current)return ready();
  show('edf-competition-result',`<div class="result"><span class="eyebrow">RESULTADO DA RODADA</span><div class="trophy">${uiIcon('trophy')}</div><h1>${esc(session.names[session.winner])}<br><span>venceu pela ${esc(team(current.sides[session.winner].teamId).name)}!</span></h1><p class="accuracy-result">${session.correctCounts[0]} × ${session.correctCounts[1]} acertos</p><div class="result-scores"><span>AZUL <b>${session.scores[0]}</b></span><em>×</em><span>LARANJA <b>${session.scores[1]}</b></span></div><div class="actions"><button class="primary" id="edf-confirm-result">Confirmar resultado e ver ranking</button>${button('Repetir partida','edf-match-start')}${button('Voltar ao sorteio','edf-match-reveal')}</div></div>`);
  $('#edf-confirm-result').onclick=()=>{try{const draft=structuredClone(state);commitEdfTurn(draft,{scores:session.scores,winnerSide:session.winner});persist(draft);ranking()}catch(error){toast(error.message)}};
 }
 function ranking(){
  show('edf-competition-ranking',`<div class="page-heading"><span class="eyebrow">RODADA ${state.done} CONFIRMADA</span><h1>Como ficou a classificação?</h1><p id="edf-ranking-status" role="status">Calculando o placar...</p></div><div class="edf-ranking-reveal">${table()}</div><div class="actions">${button(state.done>=state.rounds?'Ver equipe campeã':'Próximo sorteio','edf-match-back','primary','disabled id="edf-ranking-next"')}${button('Pausar duelo','edf')}</div>`);
  const done=()=>{$('#edf-ranking-status').textContent=state.done>=state.rounds?'A final definiu a equipe campeã!':state.done===state.rounds-1?'As duas melhores equipes vão disputar a FINAL!':'Classificação atualizada.';$('#edf-ranking-next').disabled=false;busy=false};
  if(prefs.reduced)return done();busy=true;delay(done,2000);
 }
 function champion(){
  show('edf-competition-champion',`<div class="result"><div class="trophy">${uiIcon('trophy')}</div><span class="eyebrow">DUELO CONCLUÍDO</span><h1>${esc(team(state.champion).name)}<br><span>equipe campeã!</span></h1>${table()}<div class="actions">${button('Novo duelo','edf-match-new','primary')}${button('Voltar ao menu','home')}</div></div>`);api.celebrate();
 }
 function add(){
  const modal=api.modal;modal.innerHTML=`<h2>Adicionar participantes ao duelo</h2><label>Equipe<select id="edf-add-team-id">${state.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label><label>Novos alunos — um por linha<textarea id="edf-add-students" rows="6"></textarea></label><p>Os resultados e os alunos que já jogaram serão preservados.</p><div class="actions"><button class="secondary" id="edf-add-cancel">Cancelar</button><button class="primary" id="edf-add-save">Salvar alunos</button></div>`;modal.showModal();$('#edf-add-cancel').onclick=()=>modal.close();$('#edf-add-save').onclick=()=>attempt(()=>{const names=$('#edf-add-students').value.split(/\r?\n/).map(n=>n.trim()).filter(Boolean);if(!names.length)throw Error('Informe ao menos um aluno novo.');const draft=structuredClone(state);addEdfStudents(draft,$('#edf-add-team-id').value,names);persist(draft);modal.close();toast('Alunos adicionados. O sorteio já pode continuar.');state.current?reveal():ready()});
 }
 function action(name,el){if(name==='edf-match-new')return setup();if(name==='edf-match-add')return add();if(name==='edf-match-back')return busy?null:ready();if(name==='edf-match-reveal')return reveal();if(name==='edf-match-draw')return state.current?reveal():spin();if(name==='edf-match-redraw-game')return spin('game');if(name==='edf-match-redraw')return spin(Number(el.dataset.sideIndex));if(name==='edf-match-start')return start()}
 return{open,openDuelo,action,result,back:()=>state?.current?reveal():ready(),stop};
}
