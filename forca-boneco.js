// Forca tradicional: estrutura de madeira sempre visível e boneco que aparece em seis etapas.
export const HANGMAN_PARTS=['head','torso','arm-left','arm-right','leg-left','leg-right'];
export const MAX_MISTAKES=HANGMAN_PARTS.length;
const clamp=value=>Math.max(0,Math.min(MAX_MISTAKES,Math.trunc(Number(value))||0));
export const visibleParts=mistakes=>HANGMAN_PARTS.slice(0,clamp(mistakes));
export const hangmanLabel=mistakes=>`Erros: ${clamp(mistakes)} de ${MAX_MISTAKES}`;

const WOOD=[['line',{x1:20,y1:205,x2:120,y2:205}],['line',{x1:50,y1:205,x2:50,y2:20}],['line',{x1:50,y1:20,x2:130,y2:20}],['line',{x1:50,y1:55,x2:85,y2:20}],['line',{x1:130,y1:20,x2:130,y2:50}]];
const SHAPES={
 head:['circle',{cx:130,cy:70,r:20}],
 torso:['line',{x1:130,y1:90,x2:130,y2:150}],
 'arm-left':['line',{x1:130,y1:105,x2:105,y2:135}],
 'arm-right':['line',{x1:130,y1:105,x2:155,y2:135}],
 'leg-left':['line',{x1:130,y1:150,x2:108,y2:190}],
 'leg-right':['line',{x1:130,y1:150,x2:152,y2:190}],
};

export function createHangman(doc){
 const NS='http://www.w3.org/2000/svg';
 const make=(tag,attrs,className)=>{const el=doc.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));if(className)el.setAttribute('class',className);return el};
 const wrap=doc.createElement('div');wrap.className='hangman';
 const svg=make('svg',{viewBox:'0 0 200 220',focusable:'false'});svg.setAttribute('role','img');
 for(const [tag,attrs] of WOOD)svg.append(make(tag,attrs,'hangman-wood'));
 const parts=new Map();
 for(const name of HANGMAN_PARTS){const [tag,attrs]=SHAPES[name],el=make(tag,attrs,'hangman-part');el.dataset.part=name;svg.append(el);parts.set(name,el)}
 wrap.append(svg);
 function setMistakes(value){
  const shown=visibleParts(value);
  for(const [name,el] of parts)el.classList.toggle('on',shown.includes(name));
  svg.setAttribute('aria-label',`Boneco da forca: ${shown.length} de ${MAX_MISTAKES} erros`);
 }
 setMistakes(0);
 return{el:wrap,setMistakes};
}
