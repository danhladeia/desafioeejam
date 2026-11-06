import {uiIcon} from './ui-art.js';
// Decorative scoreboard animation. Only the main game engine awards points.
export function createRopeScene(container){
 const stage=document.createElement('section');stage.className='shared-rope tug-stage';stage.dataset.state='ready';stage.setAttribute('aria-label','Cabo de guerra: Faísca contra Pipo');
 stage.innerHTML='<div class="tug-lane"><div class="tug-rope"></div><b id="rope-marker" style="left:50%" role="meter" aria-label="Vantagem do jogador azul" aria-valuemin="-60" aria-valuemax="60" aria-valuenow="0"><span></span></b></div><div class="tug-avatar tug-left"><div class="tug-sprite tug-faisca" role="img" aria-label="Faísca puxando a corda"></div><small>AZUL</small></div><div class="tug-avatar tug-right"><div class="tug-sprite tug-pipo" role="img" aria-label="Pipo puxando a corda"></div><small>LARANJA</small></div><p class="tug-status" role="status" aria-live="polite">Acerte para puxar!</p>';
 stage.querySelector('#rope-marker').innerHTML=uiIcon('flag');
 container.before(stage);let pulseTimer=null;let destroyed=false;
 return {
  start(){if(!destroyed)stage.dataset.state='playing'},
  pause(){if(!destroyed)stage.dataset.state='paused'},
  resume(){if(!destroyed)stage.dataset.state='playing'},
  update(scores,side,correct){
   if(destroyed)return;const difference=scores[0]-scores[1],value=Math.max(-60,Math.min(60,difference));
   const marker=stage.querySelector('#rope-marker');marker.style.left=(50-value/60*45)+'%';marker.setAttribute('aria-valuenow',String(value));stage.style.setProperty('--rope-shift',`${-value/60*9}%`);
   stage.querySelector('.tug-status').textContent=value===0?'Disputa equilibrada!':`${value>0?'Azul':'Laranja'} à frente • ${Math.abs(value)/10} acerto${Math.abs(value)===10?'':'s'} de vantagem`;
   clearTimeout(pulseTimer);stage.querySelectorAll('.tug-avatar').forEach(el=>el.classList.remove('pulling','slip'));const avatar=stage.querySelector(side===0?'.tug-left':'.tug-right');
   avatar.classList.add(correct?'pulling':'slip');stage.classList.toggle('is-pulling',correct);
   pulseTimer=setTimeout(()=>{avatar.classList.remove('pulling','slip');stage.classList.remove('is-pulling')},750);
  },
  destroy(){if(destroyed)return;destroyed=true;clearTimeout(pulseTimer);stage.remove()}
 };
}
