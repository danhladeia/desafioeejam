import {edfPool,normalizeEdfTopics,EDF_TOPICS,edfImage} from './edf-content.js';
import {appendUiIcon} from './ui-art.js';

export function setupEdfCards(ctx,topicIds){
 const topics=normalizeEdfTopics(topicIds),readers=new Map(),goal=8;
 const {node,button,stage,prompt,progress,helper,active,feedback,awardSolved,awardWrong,finish}=ctx;
 let current,solved=0;
 const trail=node('ol','edf-trail');trail.setAttribute('aria-label','Trilha de oito acertos');
 const answers=node('div','answers edf-answers');stage.append(trail,answers);
 for(let i=0;i<goal;i++){
  const square=node('li','edf-house',String(i+1));
  if(i===goal-1)appendUiIcon(square,'flag');trail.append(square);
 }
 function nextCard(){
  const level=ctx.level;
  if(!readers.has(level)){
   const rng=ctx.seededRandom(`${ctx.seed}:edf:${topics.join('+')}:${level}`);let deck=[],cursor=0,last;
   readers.set(level,()=>{if(cursor>=deck.length){deck=ctx.shuffle(edfPool(topics,level),rng);cursor=0;if(deck.length>1&&deck[0].id===last)deck.push(deck.shift())}const value=deck[cursor++];last=value.id;return value});
  }
  return readers.get(level)();
 }
 function render(){
  ctx.nextChallenge();current=nextCard();ctx.root.dataset.cardId=current.id;ctx.root.dataset.edfTopic=current.topic;
  prompt.replaceChildren();const copy=node('div','edf-question-copy');
  const topic=EDF_TOPICS.find(t=>t.id===current.topic);
  copy.append(node('small','edf-card-meta',`${topic.title} • ${current.page?`PDF, p. ${current.page}`:'Complemento de tabuleiro'}`),node('h3','edf-question',current.q));
  if(current.image){const image=node('img','edf-question-image');image.src=edfImage(current.image);image.alt=`Ilustração do caderno: ${topic.title}`;prompt.append(image)}
  else{const picture=node('span','edf-question-image edf-book');appendUiIcon(picture,'book');prompt.append(picture)}
  prompt.append(copy);answers.replaceChildren();
  ctx.shuffle(current.options.map((text,index)=>({text,index})),ctx.seededRandom(`${ctx.seed}:${current.id}:options`)).forEach(option=>answers.append(button(option.text,'edf-answer',option.index,'answer')));
  [...trail.children].forEach((house,index)=>{house.classList.toggle('visited',index<solved);house.classList.toggle('current',index===solved);house.setAttribute('aria-label',`Casa ${index+1}${index<solved?', concluída':index===solved?', próximo acerto':''}`)});
  progress.textContent=`${solved} / ${goal} casas • cada acerto avança uma casa`;
  helper.textContent=ctx.solo?'Leia a carta, avance na trilha e tente superar sua marca.':'Leia a carta e escolha uma alternativa. Os dois lados têm trilhas independentes.';
 }
 ctx.setAct((action,value,target)=>{
  if(action!=='edf-answer')return;
  const good=Number(value)===current.answer;
  if(good){solved++;awardSolved(1000,target)}else awardWrong(0,target);
  if(!active())return;
  [...trail.children].forEach((house,index)=>house.classList.toggle('visited',index<solved));
  progress.textContent=`${solved} / ${goal} casas • cada acerto avança uma casa`;
  const explanation=good?`Acertou! ${current.explain}`:`Resposta: ${current.options[current.answer]}. ${current.explain}`;
  feedback(good,explanation,solved===goal?finish:render,good?1500:2400);
 });
 render();
}
