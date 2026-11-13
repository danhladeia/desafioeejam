import {EDF_ORDEM_GAME,edfCardsOf,edfImage,edfRecordId,edfSequencePool,normalizeEdfTopics} from './edf-content.js';
import {getGrade,DEFAULT_GRADE} from './edf-anos.js';
export const EDF_BOARD_ATLAS='assets/visual/edf/board-pieces-atlas-v1.png';
export function edfWordArt(word){const index=({REI:0,PEAO:1,TORRE:2,BISPO:3,CAVALO:4,DAMA:5,DAMAS:6,XADREZ:7,COLUNA:7,LINHA:7})[word.word]??8;return word.topic==='tabuleiro'?{image:EDF_BOARD_ATLAS,size:'300% 300%',position:`${index%3*50}% ${Math.floor(index/3)*50}%`}:{image:edfImage(word.image,word.grade),size:'contain',position:'center'}}

const strip=text=>text.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
const wordCache=new Map(),mistakeCache=new Map();
export function edfWordsOf(grade=DEFAULT_GRADE){
 const info=getGrade(grade);
 if(!wordCache.has(info.grade))wordCache.set(info.grade,Object.entries(info.words).flatMap(([topic,items])=>items.map(([display,split,hint,image])=>({topic,grade:info.grade,display,word:strip(display),syllables:split.split('-'),hint,image}))));
 return wordCache.get(info.grade);
}
export function edfMistakesOf(grade=DEFAULT_GRADE){
 const info=getGrade(grade);
 if(!mistakeCache.has(info.grade))mistakeCache.set(info.grade,Object.entries(info.mistakes).flatMap(([topic,rows])=>rows.map(([level,raw])=>{let right;const tokens=raw.split(/\s+/).map(text=>{const match=text.match(/^\[([^|]+)\|([^\]]+)\](.*)$/);if(!match)return{text,wrong:false};right=match[2];return{text:match[1]+match[3],wrong:true}});return{topic,level,tokens,right}})));
 return mistakeCache.get(info.grade);
}
export const EDF_WORDS=edfWordsOf(DEFAULT_GRADE);
export const EDF_MISTAKES=edfMistakesOf(DEFAULT_GRADE);

export const EDF_VARIANTS={
 volei2:{title:'Vôlei Duplo EDF',rule:'Os dois alunos disputam a mesma bola de vôlei. Rebata com o dedo, mire e vença a troca.'},disco:{title:'Futebol de Disco EDF',rule:'Empurre a bola para o gol do adversário com o seu disco. Primeiro a cinco gols vence.'},bike:{title:'Mountain Bike EDF',rule:'Acelere, salte e pegue itens de segurança e saúde durante o percurso.'},archery:{title:'Arco e Flecha EDF',rule:'Mire com calma, considere o vento e acerte o centro dos alvos.'},slice:{title:'Corte Certo EDF',rule:'Corte somente os itens ligados aos temas de Educação Física escolhidos. Evite descuidos e perigos.'},
 hoops:{title:'Cesta do Saber EDF',rule:'Arremesse a bola na cesta da alternativa correta sobre Educação Física.'},
 penalty:{title:'Chute a Gol EDF',rule:'Chute para o gol que traz a alternativa correta sobre Educação Física.'},
 skate:{title:'Corrida Urbana EDF',rule:'Desvie, pule, abaixe e pegue itens de segurança ligados aos temas selecionados.'},
 rio:{title:'Descida do Rio EDF',rule:'Navegue pelas três pistas, evitando riscos e coletando itens de segurança.'},
 capoeira:{title:'Roda de Capoeira EDF',rule:'Toque no ritmo e responda às perguntas sobre a cultura corporal com respeito.'},
 pose:{title:'Pose por Pose EDF',rule:'Acompanhe as poses no compasso e responda aos desafios de Educação Física.'},
 rally:{title:'Rally na Rede EDF',rule:'Escolha o gesto de vôlei no tempo certo e responda às perguntas do tema.'},
 edf:{title:'Trilha de Cartas EDF'},turbo:{title:'Toque Turbo EDF',rule:'Toque nas atitudes positivas ligadas aos temas estudados. Evite as cartas de descuido.'},rota:{title:'Rota dos Saberes EDF',rule:'Leia cada situação e classifique no grupo correto do conteúdo de Educação Física.'},memory:{title:'Memória em Movimento',rule:'Encontre pares de conceitos e ilustrações dos temas de Educação Física selecionados.'},puzzle:{title:'Monte a Cena EDF',rule:'Monte a ilustração do caderno encaixando as peças no lugar certo.'},secret:{title:'Palavra Secreta EDF'},forca:{title:'Forca EDF'},scramble:{title:'Desembaralha EDF'},search:{title:'Caça-Palavras EDF'},rope:{title:'Cabo de Guerra EDF',rule:'Responda perguntas dos temas de Educação Física. Cada acerto puxa a corda.'},silabas:{title:'Sílabas em Movimento',rule:'Forme palavras dos temas de Educação Física com as sílabas da bandeja.'},erro:{title:'Caça-Erro EDF',rule:'Encontre o erro de escrita em frases sobre o conteúdo de Educação Física.'},balanca:{title:'Circuito em Equilíbrio',rule:'Combine blocos de tempo para planejar o circuito. A soma dos minutos deve igualar o objetivo.'},
 ordem:{title:EDF_ORDEM_GAME.title,rule:EDF_ORDEM_GAME.rule},
};
export function makeEdfGame(base,topics,grade=DEFAULT_GRADE){
 const info=getGrade(grade),ids=normalizeEdfTopics(topics,info.grade);
 return{...base,...EDF_VARIANTS[base.id],subject:'edf',edfTopics:ids,edfGrade:info.grade,subtitle:`Educação Física • ${info.grade}º ano`,recordId:edfRecordId(ids,info.grade)+(base.id==='edf'?'':':'+base.id)};
}
export function createEdfTheme(topics,grade=DEFAULT_GRADE){
 const info=getGrade(grade),ids=normalizeEdfTopics(topics,info.grade),words=edfWordsOf(info.grade).filter(word=>ids.includes(word.topic)),seen=new Set();
 const unique=words.filter(word=>!seen.has(word.word)&&seen.add(word.word));
 const single=ids.length===1?info.categories[ids[0]]:null;
 const classification=single?{categories:single.names,activities:single.examples.map(([text,category])=>({text,category}))}:{categories:ids.map(id=>info.topics.find(topic=>topic.id===id).title),activities:ids.flatMap((id,index)=>info.cross[id].map(text=>({text,category:index})))};
 const pictures=words.filter(word=>word.image&&word.topic!=='tabuleiro').map(word=>word.image).filter((value,index,all)=>all.indexOf(value)===index).map(image=>({src:edfImage(image,info.grade),...info.imageSizes[image],background:'#f0e8ff'}));
 if(ids.includes('tabuleiro'))pictures.push({src:EDF_BOARD_ATLAS,w:1254,h:1254,background:'#f0e8ff'});
 return{topics:ids,grade:info.grade,key:ids.join('+'),words:unique,pictures,classification,mistakes:edfMistakesOf(info.grade).filter(item=>ids.includes(item.topic)),syllables:unique,
 questions:level=>edfCardsOf(info.grade).filter(card=>ids.includes(card.topic)&&card.level===level).map(card=>({question:card.q,options:card.options,answer:card.answer,explanation:card.explain})),
 sequences:level=>edfSequencePool(ids,level,info.grade),
 targets:unique.filter(word=>word.word.length<=8).map(word=>({label:word.display,...edfWordArt(word)})),
 };
}
