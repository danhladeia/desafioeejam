import {EDF_TOPICS,EDF_CARDS,EDF_DEFAULT_TOPICS,edfImage,normalizeEdfTopics} from './edf-content.js';
import {uiIcon} from './ui-art.js';
import {makeEdfGame} from './edf-theme.js';

const KEY='eejam-edf-v1';
export function loadEdfConfig(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(value&&Array.isArray(value.names)&&value.names.length===2)return {topics:normalizeEdfTopics(value.topics),solo:!!value.solo,gameId:typeof value.gameId==='string'?value.gameId:'edf',names:value.names.map((name,i)=>String(name).trim().slice(0,40)||['Faísca','Pipo'][i])}}catch{}
 return {topics:[...EDF_DEFAULT_TOPICS],solo:false,names:['Faísca','Pipo'],gameId:'edf'};
}
export function showEdfMenu({shell,button,esc,prefs,config,teams=[],games=[],toast,onStart}){
 shell(`<section class="edf-heading"><div><span class="eyebrow">NOVO TEMA • EDUCAÇÃO FÍSICA • 7º ANO</span><h1>Conhecimento em movimento.</h1><p>Os jogos do Duelo do Futuro com os conteúdos do caderno DED Express.</p></div><img src="${edfImage('capoeira')}" alt="Roda de capoeira ilustrada no caderno"></section><div class="actions edf-entry-actions">${button(uiIcon('shuffle')+' Equipes, alunos e sorteio','edf-tournament','primary')}</div><form id="edf-form" class="edf-setup"><fieldset class="edf-topics"><legend>Quais conteúdos entram no jogo?</legend>${EDF_TOPICS.map(t=>`<label class="edf-topic"><input type="checkbox" name="edf-topic" value="${t.id}" ${config.topics.includes(t.id)?'checked':''}>${t.image?`<img src="${edfImage(t.image)}" alt="">`:uiIcon('book')}<span><b>${t.title}</b><small>${t.supplement?'Complemento • 6 cartas':t.description}</small></span></label>`).join('')}</fieldset><p id="edf-count" class="edf-count" role="status"></p><label class="edf-game-select-label">Qual jogo EDF?<select id="edf-game">${games.map(g=>`<option value="${g.id}">${esc(makeEdfGame(g,config.topics).title)}</option>`).join('')}</select></label><div class="edf-game-choices">${games.map(g=>`<button type="button" data-edf-pick="${g.id}">${g.id==='edf'?uiIcon('book'):`<img src="assets/visual/menu/seal-${g.id}.webp" alt="">`}<span>${esc(makeEdfGame(g,config.topics).title)}</span></button>`).join('')}</div><div class="edf-options"><label>Como jogar<select id="edf-mode"><option value="duel">Duelo livre • dois lados</option><option value="solo">Solo • minha melhor marca</option></select></label><label>Dificuldade inicial<select id="edf-level"><option value="normal">Desafio • 7º ano</option><option value="hard">Avançado • análise de situações</option></select></label><label id="edf-first-label">Equipe ou participante azul<input id="edf-name-a" maxlength="40" value="${esc(config.names[0])}" required></label><label id="edf-second-label">Equipe ou participante laranja<input id="edf-name-b" maxlength="40" value="${esc(config.names[1])}" required></label></div>${teams.length>=2?'<button type="button" class="secondary" id="edf-use-teams">'+uiIcon('teams')+' Usar as duas primeiras equipes cadastradas</button>':''}<p class="edf-note">O duelo livre não altera seu campeonato. Escolha um jogo, os temas e o modo de jogar. Para cadastrar alunos e definir rodadas, use Equipes, alunos e sorteio.</p><div class="actions">${button('Voltar','home')}<button type="submit" class="primary">${uiIcon('play')} Preparar jogo EDF</button></div></form><details class="edf-study"><summary>${uiIcon('book')} Conferir cartas e fontes</summary><p>As três unidades principais foram adaptadas do caderno de Educação Física do 7º ano, 3º trimestre de 2026. Jogos de tabuleiro é um complemento separado.</p><div id="edf-study-cards"></div></details>`,'edf-menu');
 const $=selector=>document.querySelector(selector);
 $('#edf-mode').value=config.solo?'solo':'duel';$('#edf-level').value=prefs.difficulty;
 $('#edf-game').value=games.some(g=>g.id===config.gameId)?config.gameId:'edf';
 const gameSync=()=>document.querySelectorAll('[data-edf-pick]').forEach(el=>el.classList.toggle('selected',el.dataset.edfPick===$('#edf-game').value));
 document.querySelectorAll('[data-edf-pick]').forEach(el=>el.onclick=()=>{$('#edf-game').value=el.dataset.edfPick;gameSync()});$('#edf-game').onchange=gameSync;gameSync();
 const ids=()=>[...document.querySelectorAll('[name="edf-topic"]:checked')].map(input=>input.value);
 function sync(){
  const cards=EDF_CARDS.filter(card=>ids().includes(card.topic));$('#edf-count').textContent=`${cards.length} cartas selecionadas • as perguntas acompanham o nível da partida`;
  const solo=$('#edf-mode').value==='solo';$('#edf-second-label').hidden=solo;$('#edf-name-b').required=!solo;
  $('#edf-study-cards').innerHTML=cards.map(card=>`<article class="edf-study-card">${card.image?`<img src="${edfImage(card.image)}" alt="">`:uiIcon('book')}<small>${esc(EDF_TOPICS.find(t=>t.id===card.topic).title)} • ${card.page?`PDF, p. ${card.page}`:'Complemento'} • nível ${card.level}</small><h3>${esc(card.q)}</h3><details><summary>Ver resposta</summary><p>${esc(card.options[card.answer])}</p><p>${esc(card.explain)}</p></details></article>`).join('');
 }
 document.querySelectorAll('[name="edf-topic"],#edf-mode').forEach(input=>input.addEventListener('change',sync));
 if($('#edf-use-teams'))$('#edf-use-teams').onclick=()=>{$('#edf-name-a').value=teams[0].name;$('#edf-name-b').value=teams[1].name;$('#edf-mode').value='duel';sync()};
 $('#edf-form').onsubmit=e=>{e.preventDefault();try{
  const topics=normalizeEdfTopics(ids()),solo=$('#edf-mode').value==='solo',names=[$('#edf-name-a').value.trim(),$('#edf-name-b').value.trim()||'Pipo'];
  if(!names[0]||(!solo&&!names[1]))return toast('Informe o nome de cada lado.');
  const next={topics,solo,names,gameId:$('#edf-game').value};try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
  onStart(next,$('#edf-level').value);
 }catch(error){toast(error.message)}};
 sync();
}
