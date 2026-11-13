import {EDF_GRADES,DEFAULT_GRADE,getGrade,normalizeGrade} from './edf-anos.js';
import {edfCardsOf,edfImage,normalizeEdfTopics} from './edf-content.js';
import {uiIcon} from './ui-art.js';
import {makeEdfGame} from './edf-theme.js';
import {arcadeSeal} from './new-art.js';

const KEY='eejam-edf-v1';
const DEFAULT_NAMES=['Faísca','Pipo'];

// Lê a configuração salva. Salvamentos antigos (sem ano) valem para o 7º ano.
export function parseEdfConfig(value){
 if(!value||!Array.isArray(value.names)||value.names.length!==2)return{grade:DEFAULT_GRADE,topics:[...getGrade(DEFAULT_GRADE).defaultTopics],topicsByGrade:{},solo:false,names:[...DEFAULT_NAMES],gameId:'edf'};
 const grade=normalizeGrade(value.grade),topicsByGrade={};
 for(const info of EDF_GRADES){
  const saved=value.topicsByGrade&&typeof value.topicsByGrade==='object'?value.topicsByGrade[info.grade]:undefined;
  try{topicsByGrade[info.grade]=normalizeEdfTopics(saved??(info.grade===grade?value.topics:undefined),info.grade)}catch{}
 }
 return{grade,topics:topicsByGrade[grade]??[...getGrade(grade).defaultTopics],topicsByGrade,solo:!!value.solo,gameId:typeof value.gameId==='string'?value.gameId:'edf',names:value.names.map((name,i)=>String(name).trim().slice(0,40)||DEFAULT_NAMES[i])};
}
export function loadEdfConfig(storage=globalThis.localStorage){
 try{return parseEdfConfig(JSON.parse(storage.getItem(KEY)||'null'))}catch{return parseEdfConfig(null)}
}

export function showEdfMenu({shell,button,esc,prefs,config,teams=[],games=[],toast,onStart}){
 let grade=normalizeGrade(config.grade);const byGrade={...config.topicsByGrade};
 const chosenFor=year=>{const saved=byGrade[year];return saved?.length?saved:[...getGrade(year).defaultTopics]};
 const titleOf=base=>makeEdfGame(base,getGrade(grade).defaultTopics,grade).title;
 shell(`<section class="edf-heading"><div><span class="eyebrow" id="edf-eyebrow"></span><h1>Conhecimento em movimento.</h1><p>Os jogos do Duelo do Futuro com os conteúdos dos cadernos DED Express de Educação Física.</p></div><img id="edf-hero" alt=""></section><div class="actions edf-entry-actions"></div><form id="edf-form" class="edf-setup"><fieldset class="edf-grades"><legend>Qual ano vai jogar?</legend>${EDF_GRADES.map(info=>`<label class="edf-grade"><input type="radio" name="edf-grade" value="${info.grade}" ${info.grade===grade?'checked':''}><img src="${edfImage(info.heroImage,info.grade)}" alt=""><span><b>${info.grade}º ano</b><small>${esc(info.tagline)}</small></span></label>`).join('')}</fieldset><fieldset class="edf-topics" id="edf-topic-list"></fieldset><p id="edf-count" class="edf-count" role="status"></p><label class="edf-game-select-label">Qual jogo EDF?<select id="edf-game">${games.map(g=>`<option value="${g.id}">${esc(titleOf(g))}</option>`).join('')}</select></label><div class="edf-game-choices">${games.map(g=>`<button type="button" data-edf-pick="${g.id}">${g.id==='edf'?uiIcon('book'):g.id==='ordem'?uiIcon('drag'):arcadeSeal(g.id)||`<img src="assets/visual/menu/seal-${g.id}.webp" alt="">`}<span>${esc(titleOf(g))}</span></button>`).join('')}</div><div class="edf-options"><label>Como jogar<select id="edf-mode"><option value="duel">Duelo livre • dois lados</option><option value="solo">Solo • minha melhor marca</option></select></label><label>Dificuldade inicial<select id="edf-level"><option value="normal"></option><option value="hard">Avançado • análise de situações</option></select></label><label id="edf-first-label">Equipe ou participante azul<input id="edf-name-a" maxlength="40" value="${esc(config.names[0])}" required></label><label id="edf-second-label">Equipe ou participante laranja<input id="edf-name-b" maxlength="40" value="${esc(config.names[1])}" required></label></div>${teams.length>=2?'<button type="button" class="secondary" id="edf-use-teams">'+uiIcon('teams')+' Usar as duas primeiras equipes cadastradas</button>':''}<p class="edf-note">O duelo livre não altera seu campeonato. Escolha o ano, um jogo, os temas e o modo de jogar. Para cadastrar alunos e definir rodadas, use Equipes, alunos e sorteio.</p><div class="actions">${button('Voltar','home')}<button type="submit" class="primary">${uiIcon('play')} Preparar jogo EDF</button></div></form><details class="edf-study"><summary>${uiIcon('book')} Conferir cartas e fontes</summary><p id="edf-study-note"></p><div id="edf-study-cards"></div></details>`,'edf-menu');
 const $=selector=>document.querySelector(selector);
 const checked=()=>[...document.querySelectorAll('[name="edf-topic"]:checked')].map(input=>input.value);
 $('#edf-mode').value=config.solo?'solo':'duel';$('#edf-level').value=prefs.difficulty;
 $('#edf-game').value=games.some(g=>g.id===config.gameId)?config.gameId:'edf';
 const gameSync=()=>document.querySelectorAll('[data-edf-pick]').forEach(el=>el.classList.toggle('selected',el.dataset.edfPick===$('#edf-game').value));
 document.querySelectorAll('[data-edf-pick]').forEach(el=>el.onclick=()=>{$('#edf-game').value=el.dataset.edfPick;gameSync()});$('#edf-game').onchange=gameSync;gameSync();
 function sync(){
  const info=getGrade(grade),cards=edfCardsOf(grade).filter(card=>checked().includes(card.topic));
  $('#edf-count').textContent=`${cards.length} cartas selecionadas • as perguntas acompanham o nível da partida`;
  const solo=$('#edf-mode').value==='solo';$('#edf-second-label').hidden=solo;$('#edf-name-b').required=!solo;
  $('#edf-study-cards').innerHTML=cards.map(card=>`<article class="edf-study-card">${card.image?`<img src="${edfImage(card.image,grade)}" alt="">`:uiIcon('book')}<small>${esc(info.topics.find(topic=>topic.id===card.topic).title)} • ${card.page?`PDF, p. ${card.page}`:'Complemento'} • nível ${card.level}</small><h3>${esc(card.q)}</h3><details><summary>Ver resposta</summary><p>${esc(card.options[card.answer])}</p><p>${esc(card.explain)}</p></details></article>`).join('');
 }
 function renderGrade(){
  const info=getGrade(grade),chosen=chosenFor(grade);
  $('#edf-eyebrow').textContent=`NOVO TEMA • EDUCAÇÃO FÍSICA • ${info.grade}º ANO`;
  $('#edf-hero').src=edfImage(info.heroImage,info.grade);
  $('#edf-level').options[0].textContent=`Desafio • ${info.grade}º ano`;
  $('#edf-study-note').textContent=`As unidades foram adaptadas do ${info.source.title}, ${info.source.term}.${info.topics.some(topic=>topic.supplement)?' Jogos de tabuleiro é um complemento separado.':''}`;
  $('#edf-topic-list').innerHTML='<legend>Quais conteúdos entram no jogo?</legend>'+info.topics.map(topic=>`<label class="edf-topic"><input type="checkbox" name="edf-topic" value="${topic.id}" ${chosen.includes(topic.id)?'checked':''}>${topic.image?`<img src="${edfImage(topic.image,info.grade)}" alt="">`:uiIcon('book')}<span><b>${esc(topic.title)}</b><small>${topic.supplement?'Complemento • 6 cartas':esc(topic.description)}</small></span></label>`).join('');
  document.querySelectorAll('[name="edf-topic"]').forEach(input=>input.addEventListener('change',()=>{byGrade[grade]=checked();sync()}));
  sync();
 }
 document.querySelectorAll('[name="edf-grade"]').forEach(input=>input.addEventListener('change',()=>{byGrade[grade]=checked();grade=Number(input.value);renderGrade()}));
 $('#edf-mode').addEventListener('change',sync);
 if($('#edf-use-teams'))$('#edf-use-teams').onclick=()=>{$('#edf-name-a').value=teams[0].name;$('#edf-name-b').value=teams[1].name;$('#edf-mode').value='duel';sync()};
 $('#edf-form').onsubmit=e=>{e.preventDefault();try{
  const topics=normalizeEdfTopics(checked(),grade),solo=$('#edf-mode').value==='solo',names=[$('#edf-name-a').value.trim(),$('#edf-name-b').value.trim()||DEFAULT_NAMES[1]];
  if(!names[0]||(!solo&&!names[1]))return toast('Informe o nome de cada lado.');
  byGrade[grade]=topics;
  const next={grade,topics,topicsByGrade:{...byGrade},solo,names,gameId:$('#edf-game').value};try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
  onStart(next,$('#edf-level').value);
 }catch(error){toast(error.message)}};
 renderGrade();
}
