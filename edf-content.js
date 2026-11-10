import {getGrade,DEFAULT_GRADE} from './edf-anos.js';

// As exportações abaixo (EDF_SOURCE, EDF_TOPICS, EDF_DEFAULT_TOPICS, EDF_CARDS) continuam descrevendo o 7º ano.
const seven=getGrade(DEFAULT_GRADE);
export const EDF_SOURCE=seven.source;
export const EDF_TOPICS=seven.topics;
export const EDF_DEFAULT_TOPICS=[...seven.defaultTopics];
export const EDF_GAME={id:'edf',title:'Trilha de Cartas EDF',subtitle:'Educação Física • 7º ano',icon:'book',duration:120,rule:'Leia a carta e escolha uma resposta. Cada acerto avança uma casa na sua trilha. Complete oito casas ou termine com mais acertos; a rapidez desempata.'};
export const EDF_ORDEM_GAME={id:'ordem',title:'Ordene a Sequência',subtitle:'Educação Física',icon:'drag',duration:90,rule:'Coloque os cartões na ordem correta: arraste um cartão sobre outro para trocá-los de lugar e toque em Conferir. Cada sequência certa vale ponto; a rapidez desempata.'};

const cardCache=new Map(),sequenceCache=new Map();
export function edfCardsOf(grade=DEFAULT_GRADE){
 const info=getGrade(grade);
 if(!cardCache.has(info.grade))cardCache.set(info.grade,info.cards.map(([id,topic,level,page,image,q,options,answer,explain])=>({id,topic,level,page,image,q,options,answer,explain,source:page?'pdf':'complemento'})));
 return cardCache.get(info.grade);
}
export function edfSequencesOf(grade=DEFAULT_GRADE){
 const info=getGrade(grade);
 if(!sequenceCache.has(info.grade))sequenceCache.set(info.grade,info.sequences.map(([id,topic,level,page,prompt,steps,explain])=>({id,topic,level,page,prompt,steps,explain})));
 return sequenceCache.get(info.grade);
}
export const EDF_CARDS=edfCardsOf(DEFAULT_GRADE);
export const edfImage=(name,grade=DEFAULT_GRADE)=>name?`${getGrade(grade).imageDir}/${name}.png`:null;
export function normalizeEdfTopics(ids,grade=DEFAULT_GRADE){
 const selected=getGrade(grade).topics.filter(topic=>Array.isArray(ids)&&ids.includes(topic.id)).map(topic=>topic.id);
 if(!selected.length)throw Error('Selecione ao menos um tema para as cartas.');return selected;
}
export function edfRecordId(ids,grade=DEFAULT_GRADE){const year=getGrade(grade).grade;return(year===DEFAULT_GRADE?'edf:':`edf${year}:`)+normalizeEdfTopics(ids,year).join('+')}
export function edfPool(ids,level,grade=DEFAULT_GRADE){const topics=normalizeEdfTopics(ids,grade);return edfCardsOf(grade).filter(card=>topics.includes(card.topic)&&card.level===Math.max(1,Math.min(3,level)))}
export function edfSequencePool(ids,level,grade=DEFAULT_GRADE){const topics=normalizeEdfTopics(ids,grade);return edfSequencesOf(grade).filter(item=>topics.includes(item.topic)&&item.level===Math.max(1,Math.min(3,level)))}
