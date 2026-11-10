import test from 'node:test';
import assert from 'node:assert/strict';
import {EDF_GRADES,DEFAULT_GRADE,getGrade,isGrade,normalizeGrade} from '../edf-anos.js';
import {EDF_CARDS,edfCardsOf,edfSequencesOf,edfSequencePool,edfPool,edfRecordId,edfImage,normalizeEdfTopics} from '../edf-content.js';
import {createEdfTheme,edfWordsOf,edfMistakesOf,makeEdfGame} from '../edf-theme.js';
import {buildWordSearch,seededRandom} from '../games.js';

const normalize=text=>text.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
const shuffle=(values,rng)=>{const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};

test('o registro lista os anos 6 a 9 e cai no 7º ano quando o valor é inválido',()=>{
 assert.deepEqual(EDF_GRADES.map(info=>info.grade),[6,7,8,9]);
 assert.equal(DEFAULT_GRADE,7);
 assert.ok(isGrade(8)&&isGrade('9'));assert.ok(!isGrade(5)&&!isGrade('x')&&!isGrade(null)&&!isGrade(undefined));
 assert.equal(normalizeGrade('8'),8);assert.equal(normalizeGrade(99),7);assert.equal(getGrade(undefined).grade,7);assert.equal(getGrade(9).grade,9);
 for(const info of EDF_GRADES){assert.ok(info.tagline&&info.heroImage&&info.imageDir&&info.source.title&&info.source.file);assert.ok(info.imageSizes[info.heroImage],`${info.grade}º: heroImage sem tamanho`)}
});

test('cartas: cada unidade tem 3 cartas por nível (2 no complemento), alternativas válidas e páginas do caderno',()=>{
 const ids=new Set();
 for(const info of EDF_GRADES){
  const cards=edfCardsOf(info.grade),topicIds=info.topics.map(topic=>topic.id);
  for(const card of cards){
   assert.ok(!ids.has(card.id),`id repetido ${card.id}`);ids.add(card.id);
   assert.ok(topicIds.includes(card.topic));assert.equal(card.options.length,4);assert.equal(new Set(card.options).size,4);
   assert.equal(card.answer,0);assert.ok(card.explain.length>20);
   if(card.page===null)assert.equal(card.topic,'tabuleiro');else assert.ok(card.page>=5&&card.page<=25,`${card.id}: página ${card.page}`);
   assert.ok(card.image===null||info.imageSizes[card.image],`${card.id}: imagem ${card.image}`);
  }
  for(const topic of info.topics)for(const level of [1,2,3])assert.equal(cards.filter(card=>card.topic===topic.id&&card.level===level).length,topic.supplement?2:3,`${info.grade}º ${topic.id} nível ${level}`);
 }
});

test('palavras: 16 por unidade, sílabas que remontam a palavra, tamanhos para o Caça-Palavras e todos os níveis de sílabas',()=>{
 for(const info of EDF_GRADES)for(const topic of info.topics){
  const words=edfWordsOf(info.grade).filter(word=>word.topic===topic.id);
  if(!topic.supplement)assert.equal(words.length,16,`${info.grade}º ${topic.id}`);
  assert.equal(new Set(words.map(word=>word.word)).size,words.length);
  for(const word of words){assert.equal(normalize(word.syllables.join('')),word.word,word.display);assert.equal(word.grade,info.grade);assert.ok(word.hint.length>10);assert.ok(info.imageSizes[word.image],`${word.display}: imagem ${word.image}`)}
  assert.ok(words.filter(word=>word.word.length<=7).length>=5);assert.ok(words.filter(word=>word.word.length<=8).length>=8);
  for(const level of [1,2,3])assert.ok(words.some(word=>level===1?word.syllables.length===2:level===2?word.syllables.length===3:word.syllables.length>=4),`${info.grade}º ${topic.id} sílabas nível ${level}`);
 }
});

test('Caça-Erro e Rota dos Saberes: uma palavra errada por frase, 3 por nível e categorias completas',()=>{
 for(const info of EDF_GRADES){
  const mistakes=edfMistakesOf(info.grade);
  for(const item of mistakes){assert.equal(item.tokens.filter(token=>token.wrong).length,1);assert.notEqual(item.tokens.find(token=>token.wrong).text.replace(/[.,]$/,''),item.right)}
  for(const topic of info.topics){
   for(const level of [1,2,3])assert.equal(mistakes.filter(item=>item.topic===topic.id&&item.level===level).length,3,`${info.grade}º ${topic.id} nível ${level}`);
   const category=info.categories[topic.id];assert.equal(category.names.length,3);assert.equal(category.examples.length,6);
   for(let index=0;index<3;index++)assert.equal(category.examples.filter(example=>example[1]===index).length,2);
   assert.equal(info.cross[topic.id].length,3);
  }
 }
});

test('sequências: 2 por nível por unidade (1 no complemento), com 3, 4 e 5 passos distintos',()=>{
 for(const info of EDF_GRADES){
  const sequences=edfSequencesOf(info.grade),ids=info.topics.map(topic=>topic.id);
  for(const item of sequences){
   assert.ok(ids.includes(item.topic));assert.equal(item.steps.length,item.level+2,`${item.id}`);assert.equal(new Set(item.steps).size,item.steps.length);
   assert.ok(item.prompt.length>5&&item.explain.length>20);assert.ok(item.steps.every(step=>step.length>5&&step.length<=110),`${item.id}: passo longo demais`);
   if(item.page===null)assert.equal(item.topic,'tabuleiro');else assert.ok(item.page>=5&&item.page<=25);
  }
  for(const topic of info.topics)for(const level of [1,2,3])assert.equal(edfSequencePool([topic.id],level,info.grade).length,topic.supplement?1:2,`${info.grade}º ${topic.id} nível ${level}`);
 }
});

test('compatibilidade do 7º ano: exportações antigas, ids e chaves de recorde não mudam',()=>{
 assert.equal(EDF_CARDS.length,33);assert.equal(EDF_CARDS[0].id,'g1');
 assert.equal(edfRecordId(['lutas','ginastica']),'edf:ginastica+lutas');
 assert.equal(edfRecordId(['lutas'],7),edfRecordId(['lutas']));
 assert.equal(edfRecordId(['e8-rede','e8-invasao'],8),'edf8:e8-rede+e8-invasao');
 assert.equal(edfRecordId(['e6-corpo'],6),'edf6:e6-corpo');
 assert.equal(edfImage('skate'),'assets/visual/edf/skate.png');assert.equal(edfImage('epi',6),'assets/visual/edf/ano6/epi.png');assert.equal(edfImage(null,6),null);
 assert.equal(edfPool(['tabuleiro'],3).length,2);
});

test('temas de cada ano ficam isolados: unidades de outro ano são recusadas',()=>{
 assert.throws(()=>normalizeEdfTopics(['ginastica'],8),/ao menos um tema/);
 assert.throws(()=>normalizeEdfTopics(['e9-lutas'],7),/ao menos um tema/);
 assert.throws(()=>normalizeEdfTopics([],6));
 assert.deepEqual(normalizeEdfTopics(['e6-lutas','e6-corpo','e6-corpo'],6),['e6-corpo','e6-lutas']);
});

test('createEdfTheme entrega palavras, figuras, perguntas, erros e sequências do ano escolhido',()=>{
 for(const info of EDF_GRADES)for(const topic of info.topics){
  const theme=createEdfTheme([topic.id],info.grade);
  assert.equal(theme.grade,info.grade);assert.ok(theme.words.length>=8);assert.ok(theme.words.every(word=>word.topic===topic.id));
  assert.ok(theme.pictures.length>=1&&theme.pictures.every(picture=>picture.src.startsWith(topic.id==='tabuleiro'?'assets/visual/edf/':info.imageDir+'/')));
  assert.equal(theme.classification.categories.length,3);assert.ok(theme.targets.length>=4);
  for(const level of [1,2,3]){assert.ok(theme.questions(level).length>=2);assert.ok(theme.mistakes.filter(item=>item.level===level).length>=2);assert.equal(theme.sequences(level).length,topic.supplement?1:2)}
 }
 const several=createEdfTheme(['e8-rede','e8-sociedade'],8);
 assert.deepEqual(several.classification.categories,['Rede/parede e campo e taco','Esporte e sociedade']);
 assert.equal(several.classification.activities.length,6);
});

test('makeEdfGame identifica ano, unidades e chave de recorde',()=>{
 const game=makeEdfGame({id:'forca',title:'Forca das Palavras'},['e9-lutas'],9);
 assert.equal(game.subject,'edf');assert.equal(game.edfGrade,9);assert.deepEqual(game.edfTopics,['e9-lutas']);assert.equal(game.recordId,'edf9:e9-lutas:forca');assert.match(game.subtitle,/9º ano/);assert.equal(game.title,'Forca EDF');
 const legacy=makeEdfGame({id:'forca',title:'Forca das Palavras'},['lutas','ginastica']);
 assert.equal(legacy.edfGrade,7);assert.equal(legacy.recordId,'edf:ginastica+lutas:forca');
});

test('o Caça-Palavras monta grades válidas com cada unidade sozinha e com todas, em vários sorteios',()=>{
 for(const info of EDF_GRADES)for(const ids of [...info.topics.map(topic=>[topic.id]),info.defaultTopics]){
  const bank=createEdfTheme(ids,info.grade).words;
  for(let seed=0;seed<25;seed++)for(const level of [1,2,3]){
   const size=level===3?8:7,rng=seededRandom(`${seed}:search:challenges:${level}`);
   const entries=shuffle(bank.filter(word=>word.word.length<=size),rng).slice(0,level===1?4:level===3?6:5);
   assert.doesNotThrow(()=>buildWordSearch(entries,seededRandom(`${seed}:search:board:${level}`),{size}),`${info.grade}º ${ids.join('+')} semente ${seed} nível ${level}`);
  }
 }
});
