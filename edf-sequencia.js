import {attachDrag} from './drag.js';
import {getGrade} from './edf-anos.js';

// Ordene a Sequência: troque os cartões de lugar até formar a ordem correta do caderno.
export function setupSequence(ctx){
 const {node,button,stage,prompt,progress,helper,active,awardSolved,awardWrong,feedback,shuffle,seededRandom}=ctx;
 const topics=getGrade(ctx.theme.grade).topics,readers=new Map();
 let current,order=[],selected=null,solved=0,busy=false,list;
 // Mesma sequência, na mesma ordem, para os dois lados do duelo (semente da partida).
 function reader(level){
  if(!readers.has(level)){
   const rng=seededRandom(`${ctx.seed}:ordem:${ctx.theme.key}:${level}`);let deck=[],cursor=0,last;
   readers.set(level,()=>{if(cursor>=deck.length){deck=shuffle(ctx.theme.sequences(level),rng);cursor=0;if(deck.length>1&&deck[0].id===last)deck.push(deck.shift())}const item=deck[cursor++];last=item.id;return item});
  }
  return readers.get(level);
 }
 // Posição i guarda o índice (na ordem correta) do cartão que está nela; nunca começa resolvido.
 function startOrder(item){
  let ids=shuffle(item.steps.map((_,index)=>index),seededRandom(`${ctx.seed}:ordem:${item.id}:order`));
  if(ids.every((id,index)=>id===index))ids=[...ids.slice(1),ids[0]];
  return ids;
 }
 function paint(reveal=false){
  list.replaceChildren();
  order.forEach((cardId,position)=>{
   const row=node('li','seq-row');row.dataset.row=String(position);
   row.append(node('span','seq-num',position+1));
   const card=node('div','seq-card',current.steps[cardId]);
   card.dataset.position=String(position);card.tabIndex=0;card.setAttribute('role','button');
   card.setAttribute('aria-label',`Posição ${position+1}: ${current.steps[cardId]}`);
   if(!reveal&&selected===position)card.classList.add('selected');
   row.append(card);list.append(row);
  });
  progress.textContent=`${solved} sequências ordenadas`;
 }
 function swap(a,b){
  if(busy||!active()||a===b)return;
  [order[a],order[b]]=[order[b],order[a]];selected=null;paint();
 }
 function render(){
  ctx.nextChallenge();current=reader(ctx.level)();order=startOrder(current);selected=null;busy=false;
  const topic=topics.find(item=>item.id===current.topic);
  prompt.replaceChildren(node('small','edf-card-meta',`${topic.title} • ${current.page?`PDF, p. ${current.page}`:'Complemento'} • ${current.steps.length} cartões`),node('h3','edf-question',`Coloque em ordem: ${current.prompt}`));
  helper.textContent='Arraste um cartão sobre outro para trocá-los de lugar, ou toque em dois cartões. Depois toque em Conferir ordem.';
  stage.replaceChildren();list=node('ol','seq-list');list.setAttribute('aria-label','Cartões da sequência');
  stage.append(list,button('Conferir ordem','check'));paint();
 }
 ctx.setAct((action,value,target)=>{
  if(action!=='check'||busy)return;
  busy=true;selected=null;
  const good=order.every((cardId,position)=>cardId===position);
  if(good){solved++;list.classList.add('ok');paint();awardSolved(1000,target)}
  else{awardWrong(0,target);list.classList.add('bad');order=order.map((_,position)=>position);paint(true)}
  if(!active())return;
  feedback(good,good?`Acertou! ${current.explain}`:`A ordem correta está na tela. ${current.explain}`,render,good?1500:3200);
 });
 attachDrag(ctx,{
  items:'.seq-card',targets:'.seq-row',
  onTap:card=>{
   if(busy||!active())return;
   const position=Number(card.dataset.position);
   if(selected===null){selected=position;paint();return}
   if(selected===position){selected=null;paint();return}
   swap(selected,position);
  },
  onDrop:(card,row)=>{if(busy||!active()||!row)return;swap(Number(card.dataset.position),Number(row.dataset.row))},
 });
 render();
}
