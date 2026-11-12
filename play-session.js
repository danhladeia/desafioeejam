import {createGame} from './games.js';
import {createRopeScene} from './rope-scene.js';
import {uiIcon} from './ui-art.js';
import {edfPool} from './edf-content.js';

export function createPlaySession({g,demo,duel,solo,match,names,prefs,esc,shell,sound,burst,onResult,onPause,bot=null}){
 const seed=crypto.getRandomValues(new Uint32Array(1))[0];
 const s={g,demo,duel,solo,match,names,seed,scores:[0,0],correctCounts:[0,0],speedBonuses:[0,0],rawScores:[0,0],games:[],paused:false,ended:false,started:false,left:(g.duration||60)*1000,tie:false,winner:null,guard:[[],[]],lock:[0,0],countLeft:2550,last:performance.now(),notices:[]};
 const $=selector=>document.querySelector(selector);
 shell(`<div class="game-top"><div><h2>${esc(g.title)}${solo?'<small>Treino solo • supere sua melhor marca</small>':duel?`<small class="round-tag">${duel.isFinal?'GRANDE FINAL':`Rodada ${duel.turn} de ${duel.total}`}</small>`:''}</h2></div><div class="timer" id="clock">${g.duration||60}</div><button id="presenter" class="secondary">Segure para pausar ${uiIcon('pause')}</button></div><div class="arenas">${names.map((name,i)=>`<section class="arena ${i?'orange':'blue'}" data-side="${i}"><div class="scoreboard"><div><small>${solo?'MODO SOLO':duel?esc(duel.labels[i]):bot?(i?`ROBÔ • NÍVEL ${bot.level}`:'VOCÊ'):`JOGADOR ${i+1} • ${i?'LARANJA':'AZUL'}`}</small><h2>${esc(name)}</h2><span class="accuracy" id="accuracy-${i}">0 acertos • bônus de velocidade: 0</span></div><div><div class="points-title">PONTOS</div><strong id="score-${i}">0</strong></div></div><div class="guard-message" id="guard-${i}" role="status"></div><div id="board-${i}" class="board"></div></section>`).join('')}</div><div class="play-footer"><span>${uiIcon('hand')} Um dedo, toque leve.</span><span>Acertos primeiro • velocidade desempata</span><span id="play-state">Prepare-se</span></div><div class="countdown" id="countdown">3</div>`,solo?'play solo-play':'play');
 function notify(i,good,points,bonus=0){
  const arena=$(`[data-side="${i}"]`);if(!arena)return;
  arena.classList.remove('feedback-good','feedback-bad');void arena.offsetWidth;arena.classList.add(good?'feedback-good':'feedback-bad');
  const text=document.createElement('span');text.className='score-float'+(good?'':' bad');text.innerHTML=uiIcon(good?'check':'error');text.append(document.createTextNode(good?` +${points}${bonus?` • velocidade +${bonus}`:''}`:' Tente de novo'));arena.append(text);
  s.notices.push(setTimeout(()=>{text.remove();arena.classList.remove('feedback-good','feedback-bad')},850));
  const rect=arena.getBoundingClientRect();burst(rect.x+rect.width/2,rect.y+80,good);sound(good?(bonus?'bonus':'correct'):'error');
 }
 function complete(winner,reason='tempo'){
  if(s.ended)return;s.ended=true;s.winner=winner;s.reason=reason;clearInterval(s.timer);s.games.forEach(game=>game.destroy());s.rope?.destroy();s.wake?.release().catch(()=>{});onResult(s);
 }
 function tieBreak(){
  if(s.tie||s.ended)return;s.tie=true;s.rope?.pause();s.games.forEach(game=>game.destroy());sound('tie');$('#clock').textContent='EMPATE';$('#play-state').textContent='Desempate: primeiro acerto válido';
  const a=7+seed%13,b=3+seed%7,bank=g.subject==='edf'||g.id==='edf'?edfPool(g.edfTopics,3,g.edfGrade):[],card=bank.length?bank[seed%bank.length]:null,right=card?card.answer:a*b+12;
  const question=card?card.q:`(${a} × ${b}) + 12 = ?`,options=card?card.options.map((label,value)=>({label,value})):[right-7,right,right+6,right+11].sort((x,y)=>(x*seed)%31-(y*seed)%31).map(value=>({label:String(value),value}));
  if(card)for(let turn=0;turn<seed%4;turn++)options.push(options.shift());
  if(bot)s.notices.push(setTimeout(()=>{if(!s.ended){const botWins=botRng()<(BOT[bot.level]||BOT[2]).hit-.1;complete(botWins?1:0,'desempate')}},3500+botRng()*3000));
  names.forEach((_,i)=>{if(bot&&i===1)return;const board=$('#board-'+i);board.innerHTML=`<div class="prompt"><small>DESEMPATE${card?' EDF':''}</small><h2>${esc(question)}</h2><p>Toque uma vez na resposta correta.</p></div><div class="answers">${options.map(option=>`<button class="answer" data-value="${option.value}">${esc(option.label)}</button>`).join('')}</div>`;let blockedUntil=0;
   board.querySelectorAll('button').forEach(button=>button.onpointerdown=()=>{if(s.ended||s.paused||performance.now()<blockedUntil)return;if(+button.dataset.value===right){s.correctCounts[i]++;s.scores[i]+=1000;notify(i,true,1000);complete(i,'desempate')}else{blockedUntil=performance.now()+1000;notify(i,false,0)}});
  });
 }
 function end(finishedSide){
  if(s.ended)return;
  if(solo)return complete(0,finishedSide===undefined?'tempo':'conclusão');
  if(finishedSide!==undefined)return complete(finishedSide,'conclusão');
  if(s.correctCounts[0]!==s.correctCounts[1])return complete(s.correctCounts[0]>s.correctCounts[1]?0:1);
  if(s.scores[0]!==s.scores[1])return complete(s.scores[0]>s.scores[1]?0:1);
  tieBreak();
 }
 // Robô: oponente simulado. Ele marca pontos ao longo da partida, com chance e ritmo que dependem do nível.
 const BOT={1:{every:4600,hit:.5},2:{every:3200,hit:.65},3:{every:2200,hit:.8}};
 const botRng=bot?(()=>{let x=seed||1;return()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296}})():null;
 let botWait=0,botFace;
 function botPose(id,ms=900){const img=$('#bot-face');if(!img)return;img.src=`assets/visual/arcade/sprites/solo/${id}.webp`;clearTimeout(botFace);botFace=setTimeout(()=>{if(img.isConnected)img.src='assets/visual/arcade/sprites/solo/bot-02.webp'},ms);s.notices.push(botFace)}
 function mountBot(){const board=$('#board-1');board.innerHTML='<div class="bot-board"><img id="bot-face" alt="Robô Bot" src="assets/visual/arcade/sprites/solo/bot-02.webp"><p>O robô joga ao mesmo tempo. Marque mais pontos que ele!</p></div>'}
 function botStep(delta){
  if(!bot||s.paused||s.ended||s.tie)return;botWait-=delta;if(botWait>0)return;
  const cfg=BOT[bot.level]||BOT[2];botWait=cfg.every*(.6+botRng()*.8);
  if(botRng()<cfg.hit){const bonus=Math.round(botRng()*(bot.level*4));s.correctCounts[1]++;s.speedBonuses[1]=Math.min(999,s.speedBonuses[1]+bonus);s.scores[1]=s.correctCounts[1]*1000+s.speedBonuses[1];$('#score-1').textContent=s.scores[1];$('#accuracy-1').textContent=`${s.correctCounts[1]} acertos • bônus de velocidade: ${s.speedBonuses[1]}`;botPose('bot-04');notify(1,true,1000+bonus,bonus)}
  else{botPose('bot-07');notify(1,false,0)}
 }
 for(let i=0;i<names.length;i++){
  const arena=$(`[data-side="${i}"]`);
  arena.addEventListener('pointerdown',e=>{
   if(!s.started||s.paused||s.ended){e.stopImmediatePropagation();return}const now=performance.now();s.guard[i]=s.guard[i].filter(t=>now-t<700);s.guard[i].push(now);if(s.guard[i].length>7)s.lock[i]=now+1000;
   if(now<s.lock[i]){e.stopImmediatePropagation();$('#guard-'+i).innerHTML=uiIcon('hand')+' Toque leve. Aguarde um instante.';s.notices.push(setTimeout(()=>{if(!s.ended&&$('#guard-'+i))$('#guard-'+i).textContent=''},1100))}
  },true);
  if(bot&&i===1){mountBot();continue}
  s.games.push(createGame({id:g.id,el:$('#board-'+i),side:i,seed,solo,subject:g.subject,edfTopics:g.edfTopics,edfGrade:g.edfGrade,difficulty:prefs.difficulty,onScore:(delta,meta={})=>{
   if(s.ended||s.paused||!s.started)return;
   const correct=meta.correct??delta>0,count=Number.isFinite(meta.correctDelta)?meta.correctDelta:correct?1:0,bonus=correct?Math.max(0,Math.min(20,Math.round(meta.bonus||0))):0;
   s.rawScores[i]=Math.max(0,s.rawScores[i]+delta);s.correctCounts[i]+=count;s.speedBonuses[i]=Math.min(999,s.speedBonuses[i]+bonus);s.scores[i]=s.correctCounts[i]*1000+s.speedBonuses[i];
   $('#score-'+i).textContent=s.scores[i];$('#accuracy-'+i).textContent=`${s.correctCounts[i]} acertos • bônus de velocidade: ${s.speedBonuses[i]}`;notify(i,correct,correct?1000*count+bonus:0,bonus);
   if(g.id==='rope'){
    const tug=s.correctCounts.map(n=>n*10);s.rope?.update(tug,i,correct);
    if(solo&&s.correctCounts[0]>=6)return complete(0,'missão solo');
    if(!solo&&Math.abs(tug[0]-tug[1])>=60)return complete(tug[0]>tug[1]?0:1,'corda');
   }
  },onEffect:()=>{},onFinish:()=>{if(!s.ended&&s.started)end(i)}}));
 }
 if(g.id==='rope'&&!solo)s.rope=createRopeScene($('.arenas'));
 let held;const presenter=$('#presenter');presenter.onpointerdown=e=>{try{presenter.setPointerCapture(e.pointerId)}catch{}held=setTimeout(onPause,650)};presenter.onpointerup=presenter.onpointercancel=()=>clearTimeout(held);
 s.timer=setInterval(()=>{
  if(s.paused||s.ended)return;const now=performance.now(),delta=now-s.last;s.last=now;
  if(!s.started){s.countLeft-=delta;const n=Math.max(0,Math.ceil(s.countLeft/850));if(n>0){if($('#countdown').textContent!==String(n)){sound('countdown');$('#countdown').textContent=n}}else{$('#countdown').remove();s.started=true;s.rope?.start();s.games.forEach(game=>game.start());sound('start');$('#play-state').textContent=solo?'Treino em andamento':'Duelo em andamento'}return}
  if(s.tie)return;botStep(delta);s.left-=delta;const seconds=Math.max(0,Math.ceil(s.left/1000));$('#clock').textContent=seconds;$('#clock').classList.toggle('urgent',seconds<=10);if(seconds<=5&&seconds>0&&s.lastWarning!==seconds){s.lastWarning=seconds;sound('warning')}if(s.left<=0)end();
 },60);
 s.pause=()=>{if(s.paused||s.ended)return;s.paused=true;s.games.forEach(game=>game.pause());s.rope?.pause()};
 s.resume=()=>{if(!s.paused||s.ended)return;s.paused=false;s.last=performance.now();s.games.forEach(game=>game.resume());s.rope?.resume()};
 s.destroy=()=>{clearInterval(s.timer);clearTimeout(held);s.notices.forEach(clearTimeout);s.games.forEach(game=>game.destroy());s.rope?.destroy();s.wake?.release().catch(()=>{});s.ended=true};
 if('wakeLock'in navigator)navigator.wakeLock.request('screen').then(wake=>{if(s.ended)wake.release().catch(()=>{});else s.wake=wake}).catch(()=>{});
 return s;
}
