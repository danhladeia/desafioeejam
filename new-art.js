// Sprite views over the original PNG sheets: keep every source image intact.
export const NEW_ART_FILES = [
 'assets/visual/new-games/new-games-seals-3d-v1.png',
 'assets/visual/new-games/balanca-dos-numeros-assets-v1.png',
 'assets/visual/new-games/silabas-soltas-assets-v1.png',
 'assets/visual/new-games/caca-erro-assets-v1.png'
];
const sheets={balance:[NEW_ART_FILES[1],1536,1024],syllables:[NEW_ART_FILES[2],1448,1086],mistake:[NEW_ART_FILES[3],1448,1086]};
const sprites={
 'balance-post':['balance',475,35,255,315],
 'balance-beam':['balance',770,140,375,90],
 'balance-pan':['balance',1200,30,300,310],
 'weight-blue':['balance',40,375,320,295],
 'weight-orange':['balance',420,375,320,295],
 'weight-purple':['balance',800,375,320,295],
 'weight-green':['balance',1180,375,320,295],
 'balance-tray':['balance',8,775,377,155],
 'balance-target':['balance',400,730,370,215],
 'balance-success':['balance',800,725,325,265],
 'syllable-blue':['syllables',18,38,345,195],
 'syllable-orange':['syllables',378,38,345,195],
 'syllable-purple':['syllables',738,38,345,195],
 'syllable-green':['syllables',1095,38,345,195],
 'syllable-slot':['syllables',20,290,345,205],
 'clue-book':['syllables',377,280,345,230],
 'clue-school':['syllables',18,520,350,275],
 'clue-notebook':['syllables',380,530,335,265],
 'clue-backpack':['syllables',740,520,330,275],
 'clue-computer':['syllables',1090,525,350,265],
 'clue-library':['syllables',32,812,330,265],
 'clue-calculator':['syllables',430,810,250,270],
 'mistake-loupe':['mistake',30,5,310,340],
 'word-normal':['mistake',0,380,365,180],
 'word-selected':['mistake',365,380,360,180],
 'word-correct':['mistake',725,380,365,180],
 'word-wrong':['mistake',1090,380,358,180],
 'mistake-correct':['mistake',765,815,285,265]
};
export function applySprite(element,id){
 const item=sprites[id];if(!item)throw new Error(`Arte desconhecida: ${id}`);
 const [sheet,x,y,width,height]=item,[url,sw,sh]=sheets[sheet];
 element.classList.add('asset-sprite');element.dataset.sprite=id;
 element.style.setProperty('--sprite-image',`url("${url}")`);
 element.style.setProperty('--sprite-size',`${sw/width*100}% ${sh/height*100}%`);
 element.style.setProperty('--sprite-position',`${x/(sw-width)*100}% ${y/(sh-height)*100}%`);
 return element;
}
export function spriteNode(doc,id,className='clue-icon'){
 const el=doc.createElement('span');el.className=className;el.setAttribute('aria-hidden','true');return applySprite(el,id);
}
export function newSeal(id){
 const index=['balanca','silabas','erro'].indexOf(id);
 return index<0?null:`<span class="new-game-seal" data-seal="${id}" style="--seal-index:${index}" aria-hidden="true"></span>`;
}
const arcadeIds=['slice','hoops','penalty','skate','rio','capoeira','pose','rally'];
export function arcadeSeal(id){
 const index=arcadeIds.indexOf(id);
 return index<0?null:`<span class="arcade-game-seal" style="--arcade-x:${index%4*33.3333}%;--arcade-y:${Math.floor(index/4)*100}%" aria-hidden="true"></span>`;
}
export function syllableClue(word){return ({ESCOLA:'clue-school',CADERNO:'clue-notebook',MOCHILA:'clue-backpack',COMPUTADOR:'clue-computer',BIBLIOTECA:'clue-library',CALCULADORA:'clue-calculator'})[word]||'clue-book'}
