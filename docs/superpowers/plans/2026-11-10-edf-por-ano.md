# Modo EDF por ano, Forca com boneco e Ordene a Sequência — Plano de Implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Levar o Modo EDF do 7º ano para os quatro anos (6º ao 9º), com seletor de ano no menu, trocar o foguete da Forca por um boneco tradicional e criar o jogo Ordene a Sequência.

**Arquitetura:** Um módulo de conteúdo por ano (`edf-ano6.js` … `edf-ano9.js`) e um registro (`edf-anos.js`). As funções existentes (`createEdfTheme`, `edfPool`, `makeEdfGame`, `createEdfDuel`…) ganham o parâmetro `ano`, com padrão 7, então o 7º ano continua idêntico. A Forca ganha um componente SVG próprio (`forca-boneco.js`) e o jogo novo vive em `edf-sequencia.js`.

**Tecnologias:** JavaScript puro (módulos ES, sem bibliotecas), `node:test` para regras e conteúdo, Playwright para o navegador, Python (`pymupdf`, `Pillow`) só para extrair figuras dos PDFs.

**Especificação:** `docs/superpowers/specs/2026-11-10-edf-por-ano-design.md`

## Restrições Globais

- Anos: 6º, 7º, 8º e 9º, cada um com o conteúdo do seu caderno em `Conteudos EDF/Caderno_DED_Express_EF{6,7,8,9}_leve.pdf`.
- O 7º ano não muda: ids (`ginastica`, `aventura`, `lutas`, `tabuleiro`, `g1`…) e chaves de recorde (`edf:ginastica+aventura+lutas:forca`) continuam iguais. Os outros anos usam ids de unidade com prefixo `e6-`, `e8-`, `e9-` e chaves `edf6:`, `edf8:`, `edf9:`.
- Cada unidade tem 9 cartas (3 por nível), 16 palavras, 9 frases de Caça-Erro, 6 situações de classificação e 6 sequências (2 por nível). O complemento de tabuleiro do 7º ano tem 1 sequência por nível.
- Forca: boneco tradicional (forca de madeira e boneco em 6 etapas: cabeça, tronco, braço esquerdo, braço direito, perna esquerda e perna direita), no modo normal e no EDF. A Palavra Secreta continua com o foguete.
- Ordene a Sequência: só no EDF, 90 segundos, 3, 4 e 5 cartões nos níveis 1, 2 e 3, 1.000 pontos por acerto mais o bônus de rapidez (igual aos outros jogos EDF).
- Offline: todo arquivo novo entra no cache de `sw.js`, e a versão do cache sobe de `eejam-v15-avatar` para `eejam-v16-edf-anos` em `sw.js` e `app.js`.
- Sem fontes, bibliotecas nem arquivos externos novos. Todo texto da interface em português do Brasil.
- Cada tarefa termina com os testes passando e um commit. Nenhum commit inclui as alterações do Codex que já estavam pendentes na árvore (ver Tarefa 0) nem as pastas `Conteudos EDF/` e `Fotos do Evento/`.
- Comandos no Git Bash (Windows). Mensagens de commit terminam com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `edf-anos.js` | criar | Registro dos anos: `EDF_GRADES`, `DEFAULT_GRADE`, `isGrade`, `normalizeGrade`, `getGrade` |
| `edf-ano6.js` `edf-ano7.js` `edf-ano8.js` `edf-ano9.js` | criar | Dados de conteúdo de cada ano (cartas, palavras, erros, classificação, figuras, sequências). Copiados de `docs/superpowers/plans/content/` |
| `edf-content.js` | reescrever | API de cartas e sequências por ano; exportações antigas continuam descrevendo o 7º ano |
| `edf-theme.js` | reescrever | Tema dos jogos por ano (`createEdfTheme`, `makeEdfGame`, palavras e erros) |
| `edf-game.js` | modificar | Trilha de Cartas conhece o ano |
| `edf-menu.js` | reescrever | Seletor de ano e configuração salva por ano |
| `edf-duel.js` `edf-duel-ui.js` | modificar | Campeonato EDF guarda e usa o ano |
| `play-session.js` `app.js` | modificar | Repassam o ano; textos sem "7º ano"; jogo novo na lista |
| `games.js` | modificar | `createGame` recebe `edfGrade`; Forca com boneco; registro de `ordem` |
| `forca-boneco.js` | criar | Componente SVG do boneco da forca |
| `edf-sequencia.js` | criar | Jogo Ordene a Sequência |
| `edf.css` `play.css` | modificar | Estilos do seletor de ano, do boneco e do novo jogo |
| `scripts/extrair-glossario.py` | criar | Extrai as 12 figuras do glossário de cada caderno |
| `assets/visual/edf/ano6/` `ano8/` `ano9/` | criar | 12 PNG com transparência + `proveniencia.json` cada |
| `sw.js` | modificar | Cache offline dos arquivos novos e nova versão |
| `tests/edf-anos.test.js` | criar | Regras e conteúdo dos quatro anos |
| `tests/edf-imagens.test.js` | criar | Figuras: existência, transparência, tamanho e cache |
| `tests/edf-config.test.js` | criar | Configuração salva e campeonato com ano |
| `tests/forca-boneco.test.js` | criar | Lógica do boneco |
| `tests/edf-sequencia.test.js` | criar | Conteúdo e registro do jogo novo |
| `tests/browser/edf-anos.spec.js` | criar | Seletor de ano, jogos por ano, campeonato com ano |
| `tests/browser/forca-boneco.spec.js` | criar | Boneco na Forca (normal e EDF) |
| `tests/browser/edf-sequencia.spec.js` | criar | Ordene a Sequência (trocar por toque e por arrasto, acerto, erro) |
| `tests/edf-expanded.test.js` | modificar | Contagem de jogos EDF (13 → 14) |
| `MODO_EDF_7_ANO.md` `README.md` | modificar | Documentação |

---

### Tarefa 0: Linha de base e ramo de trabalho

**Arquivos:** nenhum alterado (só Git).

O repositório está em `main` com edições do Codex ainda não commitadas nos mesmos arquivos que este plano altera (`app.js`, `games.js`, `edf-theme.js`, `wordgames.js`, `sw.js` e outros). Sem uma linha de base, nenhum commit deste plano ficaria limpo.

- [ ] **Passo 1: Conferir o estado**

Run: `git status --short`
Expected: lista de arquivos ` M` (modificados: `MODO_EDF_7_ANO.md`, `README.md`, `app.js`, `edf-theme.js`, `games.js`, `sw.js`, `wordgames.js` e dois testes) e `??` (não rastreados: `Conteudos EDF/`, `Fotos do Evento/`, `provador.html`, `assets/visual/avatar/` etc.).

- [ ] **Passo 2: Rodar os testes atuais para registrar a linha de base**

Run: `npm test`
Expected: todos os testes passam (o README cita 79). Anote o total.

Run (em segundo plano, pode demorar alguns minutos): `npx playwright test --reporter=line`
Expected: anote quantos testes passam e quais falham, se houver. Falhas que já existem aqui não são deste plano.

- [ ] **Passo 3: Pedir ao professor autorização para o commit de linha de base**

Pergunte ao usuário (não execute o commit antes do sim): "Há alterações do Codex ainda sem commit nos mesmos arquivos que este trabalho vai mexer. Posso commitá-las como linha de base num ramo novo?" Mostre a lista do Passo 1. Recomende incluir só as alterações rastreadas e os arquivos novos que o `sw.js` já cita (`provador.html`, `assets/visual/avatar/`, `assets/visual/edf/board-pieces-generation-v1.json`, `PROMPTS_AVATAR_PRANCHAS.md`). Nunca adicione `Conteudos EDF/` (75 MB de PDFs) nem `Fotos do Evento/` sem pedir.

- [ ] **Passo 4: Criar o ramo e a linha de base (após o sim)**

```bash
git switch -c feature/edf-por-ano
git add -u
git add provador.html assets/visual/avatar assets/visual/edf/board-pieces-generation-v1.json PROMPTS_AVATAR_PRANCHAS.md
git commit -m "chore: linha de base das edições do Codex antes do EDF por ano

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected: o `git status` mostra apenas `?? "Conteudos EDF/"`, `?? "Fotos do Evento/"` e `?? docs/` (a especificação e este plano).

- [ ] **Passo 5: Commit da especificação e do plano**

```bash
git add docs/superpowers
git commit -m "docs: especificação e plano do EDF por ano, com o conteúdo dos quatro anos

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

Se o professor recusar o commit, crie só o ramo (`git switch -c feature/edf-por-ano`) e, nos commits seguintes, use `git add -p` para incluir apenas os trechos desta tarefa. Avise que o histórico ficará misturado.

---

### Tarefa 1: Registro de anos e conteúdo dos quatro anos

**Arquivos:**
- Criar: `edf-anos.js`, `edf-ano6.js`, `edf-ano7.js`, `edf-ano8.js`, `edf-ano9.js`
- Reescrever: `edf-content.js`, `edf-theme.js`
- Testar: `tests/edf-anos.test.js` (novo); `tests/edf.test.js` e `tests/edf-expanded.test.js` continuam passando sem edição

**Interfaces:**
- Produz (`edf-anos.js`):
  - `EDF_GRADES: object[]` (um por ano, na ordem 6, 7, 8, 9)
  - `DEFAULT_GRADE = 7`
  - `isGrade(value): boolean`
  - `normalizeGrade(value): number`
  - `getGrade(value): object`
- Cada objeto de ano tem: `grade`, `tagline`, `heroImage`, `imageDir`, `source {title,term,file}`, `topics [{id,title,image,description,supplement?}]`, `defaultTopics`, `cards`, `words`, `mistakes`, `categories`, `cross`, `imageSizes`, `sequences`.
- Produz (`edf-content.js`): `EDF_SOURCE`, `EDF_TOPICS`, `EDF_DEFAULT_TOPICS`, `EDF_GAME`, `EDF_ORDEM_GAME`, `EDF_CARDS` (todos do 7º ano), `edfCardsOf(grade=7)`, `edfSequencesOf(grade=7)`, `edfImage(name, grade=7)`, `normalizeEdfTopics(ids, grade=7)`, `edfRecordId(ids, grade=7)`, `edfPool(ids, level, grade=7)`, `edfSequencePool(ids, level, grade=7)`.
- Produz (`edf-theme.js`): `EDF_BOARD_ATLAS`, `edfWordArt(word)`, `edfWordsOf(grade=7)`, `edfMistakesOf(grade=7)`, `EDF_WORDS`, `EDF_MISTAKES` (7º ano), `EDF_VARIANTS`, `makeEdfGame(base, topics, grade=7)`, `createEdfTheme(topics, grade=7)`. O tema ganha `grade` e `sequences(level)`.

- [ ] **Passo 1: Escrever o teste que falha**

Crie `tests/edf-anos.test.js`:

```js
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
```

- [ ] **Passo 2: Rodar o teste e ver falhar**

Run: `node --test tests/edf-anos.test.js`
Expected: FAIL com `Cannot find module '.../edf-anos.js'`.

- [ ] **Passo 3: Copiar os módulos de conteúdo**

Os quatro módulos de conteúdo já estão prontos e validados em `docs/superpowers/plans/content/`.

```bash
cp docs/superpowers/plans/content/edf-ano6.js edf-ano6.js
cp docs/superpowers/plans/content/edf-ano7.js edf-ano7.js
cp docs/superpowers/plans/content/edf-ano8.js edf-ano8.js
cp docs/superpowers/plans/content/edf-ano9.js edf-ano9.js
```
O `edf-ano7.js` é o conteúdo atual do 7º ano movido sem alteração (mais as sequências novas). Antes de seguir, confirme que não houve mudança no conteúdo de `edf-content.js` e `edf-theme.js` desde que o plano foi escrito: `git diff --stat edf-content.js edf-theme.js` deve estar vazio depois do commit da Tarefa 0; se não estiver, compare o diff com `edf-ano7.js` antes de reescrever os dois arquivos.

- [ ] **Passo 4: Criar o registro de anos**

Crie `edf-anos.js`:

```js
import {GRADE_6} from './edf-ano6.js';
import {GRADE_7} from './edf-ano7.js';
import {GRADE_8} from './edf-ano8.js';
import {GRADE_9} from './edf-ano9.js';

export const EDF_GRADES=[GRADE_6,GRADE_7,GRADE_8,GRADE_9];
export const DEFAULT_GRADE=7;
export const isGrade=value=>EDF_GRADES.some(info=>info.grade===Number(value));
export const normalizeGrade=value=>isGrade(value)?Number(value):DEFAULT_GRADE;
export const getGrade=value=>EDF_GRADES.find(info=>info.grade===normalizeGrade(value));
```

- [ ] **Passo 5: Reescrever `edf-content.js`**

Substitua o arquivo inteiro por:

```js
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
```

- [ ] **Passo 6: Reescrever `edf-theme.js`**

Substitua o arquivo inteiro por:

```js
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
 edf:{title:'Trilha de Cartas EDF'},turbo:{title:'Toque Turbo EDF',rule:'Toque nas atitudes positivas ligadas aos temas estudados. Evite as cartas de descuido.'},rota:{title:'Rota dos Saberes EDF',rule:'Leia cada situação e classifique no grupo correto do conteúdo de Educação Física.'},memory:{title:'Memória em Movimento',rule:'Encontre pares de conceitos e ilustrações dos temas de Educação Física selecionados.'},puzzle:{title:'Monte a Cena EDF',rule:'Monte a ilustração do caderno encaixando as peças no lugar certo.'},secret:{title:'Palavra Secreta EDF'},forca:{title:'Forca EDF'},scramble:{title:'Desembaralha EDF'},search:{title:'Caça-Palavras EDF'},rope:{title:'Cabo de Guerra EDF',rule:'Responda perguntas dos temas de Educação Física. Cada acerto puxa a corda.'},silabas:{title:'Sílabas em Movimento',rule:'Forme palavras dos temas de Educação Física com as sílabas da bandeja.'},erro:{title:'Caça-Erro EDF',rule:'Encontre o erro de escrita em frases sobre o conteúdo de Educação Física.'},balanca:{title:'Circuito em Equilíbrio',rule:'Combine blocos de tempo para planejar o circuito. A soma dos minutos deve igualar o objetivo.'},
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
```
(`EDF_ORDEM_GAME` é importado aqui mas só passa a ser usado na Tarefa 5; mantenha a importação, porque ela deixa a ordem dos módulos estável.)

- [ ] **Passo 7: Rodar os testes**

Run: `node --test tests/edf-anos.test.js`
Expected: PASS em todos os 10 testes.

Run: `npm test`
Expected: todos os testes antigos continuam passando (em especial `tests/edf.test.js` e `tests/edf-expanded.test.js`, que usam as exportações do 7º ano). Se algum falhar, a causa mais provável é diferença entre o conteúdo movido e o original; compare o 7º ano em `edf-ano7.js` com `git show HEAD:edf-content.js` e `git show HEAD:edf-theme.js`.

- [ ] **Passo 8: Registrar os módulos no cache offline**

Em `sw.js`, antes da linha `self.addEventListener('install',`, insira:

```js
FILES.push('./edf-anos.js','./edf-ano6.js','./edf-ano7.js','./edf-ano8.js','./edf-ano9.js');
```

- [ ] **Passo 9: Commit**

```bash
git add edf-anos.js edf-ano6.js edf-ano7.js edf-ano8.js edf-ano9.js edf-content.js edf-theme.js sw.js tests/edf-anos.test.js
git commit -m "feat(edf): registro de anos e conteúdo dos cadernos do 6º ao 9º ano

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Tarefa 2: Figuras dos glossários do 6º, 8º e 9º anos

**Arquivos:**
- Criar: `scripts/extrair-glossario.py`, `assets/visual/edf/ano6/*.png`, `assets/visual/edf/ano8/*.png`, `assets/visual/edf/ano9/*.png` e um `proveniencia.json` em cada pasta
- Modificar: `sw.js`
- Testar: `tests/edf-imagens.test.js` (novo)

**Interfaces:**
- Consome: `EDF_GRADES[n].imageDir` e `EDF_GRADES[n].imageSizes` (Tarefa 1)
- Produz: 12 PNG RGBA por ano, em `assets/visual/edf/ano{6,8,9}/<nome>.png`, cujos nomes e tamanhos são exatamente as chaves de `imageSizes` do ano

Pré-requisito: Python com `pymupdf` e `Pillow` (`python -c "import pymupdf, PIL"`). Os PDFs estão em `Conteudos EDF/`.

- [ ] **Passo 1: Escrever o teste que falha**

Crie `tests/edf-imagens.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {EDF_GRADES} from '../edf-anos.js';

const file=path=>readFileSync(new URL('../'+path,import.meta.url));
const sw=file('sw.js').toString('utf8');

test('cada ano tem as 12 figuras do glossário, com transparência real e o tamanho registrado',()=>{
 for(const info of EDF_GRADES){
  const names=Object.keys(info.imageSizes);assert.equal(names.length,12,`${info.grade}º`);
  for(const name of names){
   const png=file(`${info.imageDir}/${name}.png`);
   assert.equal(png.readUInt8(25),6,`${info.grade}º ${name}: não é RGBA`);
   assert.equal(png.readUInt32BE(16),info.imageSizes[name].w,`${info.grade}º ${name}: largura`);
   assert.equal(png.readUInt32BE(20),info.imageSizes[name].h,`${info.grade}º ${name}: altura`);
  }
 }
});

test('as figuras dos anos novos têm procedência registrada com a soma de verificação de cada arquivo',()=>{
 for(const info of EDF_GRADES.filter(item=>item.grade!==7)){
  const manifest=JSON.parse(file(`${info.imageDir}/proveniencia.json`).toString('utf8'));
  assert.match(manifest.source,new RegExp(`${info.grade}º ano`));assert.equal(manifest.images.length,12);
  for(const entry of manifest.images){
   assert.equal(entry.page,25);assert.ok(Object.hasOwn(info.imageSizes,entry.file.replace('.png','')));
   assert.equal(createHash('sha256').update(file(`${info.imageDir}/${entry.file}`)).digest('hex'),entry.sha256,entry.file);
  }
 }
});

test('as figuras dos anos novos entram no cache offline',()=>{
 for(const info of EDF_GRADES.filter(item=>item.grade!==7)){
  const folder=info.imageDir.split('/').pop();
  for(const name of Object.keys(info.imageSizes))assert.match(sw,new RegExp(`${folder}:\\[[^\\]]*'${name}'`),`${info.grade}º ${name} fora do sw.js`);
 }
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/edf-imagens.test.js`
Expected: FAIL com `ENOENT` (arquivos de figura inexistentes).

- [ ] **Passo 3: Instalar o script de extração**

```bash
mkdir -p scripts
cp docs/superpowers/plans/content/extrair-glossario.py scripts/extrair-glossario.py
```

- [ ] **Passo 4: Extrair as figuras dos três cadernos**

A ordem dos nomes é a ordem em que as figuras aparecem na página 25 (linha a linha, esquerda e depois direita). No 6º ano a mão no pulso aparece antes da flexão, por isso `frequencia` vem antes de `capacidades`.

```bash
python -W ignore -I scripts/extrair-glossario.py "Conteudos EDF/Caderno_DED_Express_EF6_leve.pdf" assets/visual/edf/ano6 "Caderno de Atividades DED Express — Educação Física 6º ano" atividade,exercicio,frequencia,capacidades,circuito,epi,risco,parkour,patrimonio,capoeira,ginga,estereotipo
python -W ignore -I scripts/extrair-glossario.py "Conteudos EDF/Caderno_DED_Express_EF8_leve.pdf" assets/visual/edf/ano8 "Caderno de Atividades DED Express — Educação Física 8º ano" rede,taco,invasao,combate,manchete,tatica,sistema,superioridade,fairplay,adaptado,doping,lazer
python -W ignore -I scripts/extrair-glossario.py "Conteudos EDF/Caderno_DED_Express_EF9_leve.pdf" assets/visual/edf/ano9 "Caderno de Atividades DED Express — Educação Física 9º ano" programa,intensidade,consciencia,taichi,beleza,anabolizante,trekking,arvorismo,rapel,rastro,ukemi,esportivizacao
```
Expected: três linhas `12 ilustracoes gravadas em assets/visual/edf/anoN`.

- [ ] **Passo 5: Conferir visualmente que cada nome combina com a figura**

Monte uma folha de conferência fora do projeto e abra a imagem:

```bash
python -I -c "
import os,sys,tempfile
from PIL import Image,ImageDraw
out=os.path.join(tempfile.gettempdir(),'folha-edf')
os.makedirs(out,exist_ok=True)
for n in (6,8,9):
    d=f'assets/visual/edf/ano{n}'; files=sorted(f for f in os.listdir(d) if f.endswith('.png'))
    sheet=Image.new('RGB',(800,3*224),(240,232,255)); dr=ImageDraw.Draw(sheet)
    for k,f in enumerate(files):
        im=Image.open(f'{d}/{f}').convert('RGBA'); im.thumbnail((190,190)); x=(k%4)*200; y=(k//4)*224
        sheet.paste(im,(x+5,y+5),im); dr.text((x+5,y+200),f,fill=(0,0,0))
    sheet.save(f'{out}/ano{n}.png'); print(f'{out}/ano{n}.png')
"
```
Abra cada PNG impresso e confirme esta correspondência (se algum nome não bater, troque a ordem dos nomes no Passo 4 e extraia de novo):

| Ano | Nome → o que a figura mostra |
|---|---|
| 6º | `atividade` menina varrendo; `exercicio` menina correndo entre cones, com treinador; `frequencia` mão com dois dedos no pulso; `capacidades` menina fazendo flexão; `circuito` quadra azul com cones, corda, escada e colchonete; `epi` capacete e protetores roxos; `risco` praça com buraco no piso e poça; `parkour` menino saltando um muro; `patrimonio` praça com skatistas, idosos e carrinho de bebê; `capoeira` roda de capoeira; `ginga` homem na posição de ginga; `estereotipo` balão de fala com um X vermelho |
| 8º | `rede` jogadora de vôlei atacando junto à rede; `taco` crianças com tacos e latas empilhadas; `invasao` futsal com gol; `combate` judô no tatame; `manchete` jogadora de vôlei fazendo manchete; `tatica` jogador de badminton em quadra; `sistema` técnico com quadro tático; `superioridade` três jogadores disputando a bola; `fairplay` jogador ajudando o adversário a se levantar; `adaptado` vôlei sentado; `doping` coleta de exame antidoping; `lazer` academia ao ar livre com idosos |
| 9º | `programa` calendário com cronômetro; `intensidade` jovem com halter e treinador; `consciencia` pessoa em pé sobre tapete; `taichi` grupo de tai chi; `beleza` grupo diverso de pessoas (uma em cadeira de rodas); `anabolizante` frasco e cápsulas com sinal de alerta; `trekking` dois caminhantes na trilha; `arvorismo` percurso suspenso entre árvores; `rapel` descida em parede de rocha; `rastro` grupo diante de uma cachoeira; `ukemi` judô no tatame; `esportivizacao` medalha |

- [ ] **Passo 6: Registrar as figuras no cache offline**

Em `sw.js`, antes da linha `self.addEventListener('install',`, insira:

```js
FILES.push(...Object.entries({ano6:['atividade','exercicio','frequencia','capacidades','circuito','epi','risco','parkour','patrimonio','capoeira','ginga','estereotipo'],ano8:['rede','taco','invasao','combate','manchete','tatica','sistema','superioridade','fairplay','adaptado','doping','lazer'],ano9:['programa','intensidade','consciencia','taichi','beleza','anabolizante','trekking','arvorismo','rapel','rastro','ukemi','esportivizacao']}).flatMap(([folder,names])=>names.map(name=>`./assets/visual/edf/${folder}/${name}.png`)),'./assets/visual/edf/ano6/proveniencia.json','./assets/visual/edf/ano8/proveniencia.json','./assets/visual/edf/ano9/proveniencia.json');
```

- [ ] **Passo 7: Rodar os testes**

Run: `node --test tests/edf-imagens.test.js`
Expected: PASS nos 3 testes. Se a largura/altura de algum arquivo do 7º ano divergir de `imageSizes`, corrija o valor em `edf-ano7.js` pelo tamanho real do PNG (o conteúdo antigo trazia essa tabela fixa no código).

Run: `npm test`
Expected: todos passam.

- [ ] **Passo 8: Commit**

```bash
git add scripts/extrair-glossario.py assets/visual/edf/ano6 assets/visual/edf/ano8 assets/visual/edf/ano9 sw.js tests/edf-imagens.test.js
git commit -m "feat(edf): figuras dos glossários do 6º, 8º e 9º anos, com procedência

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Tarefa 3: Seletor de ano, configuração salva e campeonato por ano

**Arquivos:**
- Reescrever: `edf-menu.js`, `edf-game.js`
- Modificar: `edf-duel.js`, `edf-duel-ui.js`, `play-session.js`, `games.js`, `app.js`, `edf.css`
- Testar: `tests/edf-config.test.js` (novo, regras), `tests/browser/edf-anos.spec.js` (novo, navegador)

**Interfaces:**
- Consome (Tarefa 1): `EDF_GRADES`, `DEFAULT_GRADE`, `getGrade`, `normalizeGrade`, `isGrade`; `edfCardsOf`, `edfImage`, `edfPool`, `normalizeEdfTopics`; `makeEdfGame(base, topics, grade)`, `createEdfTheme(topics, grade)`.
- Produz:
  - `parseEdfConfig(value): {grade, topics, topicsByGrade, solo, names, gameId}` e `loadEdfConfig(storage?)` em `edf-menu.js`
  - `showEdfMenu({..., config, onStart})`: `onStart(config, level)` recebe `config.grade` e `config.topics`
  - `createEdfDuel({..., grade})` (padrão 7; o estado guarda `grade` como **última chave**) e `validateEdfDuel` aceitando salvamento sem `grade`
  - `edfDuelUI.open(topics, grade)`; `api.startMatch(ctx)` recebe `ctx.grade`
  - `createGame({..., edfGrade})` e `setupEdfCards(ctx, topics, grade)`

- [ ] **Passo 1: Escrever os testes de regras que falham**

Crie `tests/edf-config.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEdfConfig} from '../edf-menu.js';
import {createEdfDuel,drawEdfTurn,commitEdfTurn,validateEdfDuel,saveEdfDuel,loadEdfDuel} from '../edf-duel.js';

const teams=(count=2,names=4)=>Array.from({length:count},(_,i)=>({name:'Equipe '+i,students:Array.from({length:names},(_,j)=>'Aluno '+i+'-'+j)}));

test('configuração do menu EDF: padrão, salvamento antigo sem ano e salvamento por ano',()=>{
 const fresh=parseEdfConfig(null);
 assert.equal(fresh.grade,7);assert.deepEqual(fresh.topics,['ginastica','aventura','lutas']);assert.deepEqual(fresh.names,['Faísca','Pipo']);assert.equal(fresh.gameId,'edf');assert.equal(fresh.solo,false);
 const legacy=parseEdfConfig({topics:['lutas'],solo:true,gameId:'forca',names:[' Ana ','']});
 assert.equal(legacy.grade,7);assert.deepEqual(legacy.topics,['lutas']);assert.deepEqual(legacy.topicsByGrade[7],['lutas']);assert.equal(legacy.solo,true);assert.equal(legacy.gameId,'forca');assert.deepEqual(legacy.names,['Ana','Pipo']);
 const nine=parseEdfConfig({grade:9,topics:['e9-lutas'],topicsByGrade:{9:['e9-lutas'],8:['e8-rede'],6:['ginastica']},names:['A','B']});
 assert.equal(nine.grade,9);assert.deepEqual(nine.topics,['e9-lutas']);assert.deepEqual(nine.topicsByGrade[8],['e8-rede']);assert.equal(nine.topicsByGrade[6],undefined,'unidade de outro ano é ignorada');
 const mixed=parseEdfConfig({grade:6,topics:['ginastica'],names:['A','B']});
 assert.deepEqual(mixed.topics,['e6-corpo','e6-aventura','e6-lutas'],'unidades inválidas voltam ao padrão do ano');
 assert.equal(parseEdfConfig({grade:99,topics:['lutas'],names:['A','B']}).grade,7);
 assert.equal(parseEdfConfig({topics:['lutas'],names:['só um']}).grade,7);
});

test('campeonato EDF: ano padrão 7, ano guardado como última chave, ano inválido e unidades de outro ano são recusados',()=>{
 const old=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas']});
 assert.equal(old.grade,7);assert.equal(Object.keys(old).at(-1),'grade');
 const eight=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['e8-rede'],grade:8});
 assert.equal(eight.grade,8);assert.deepEqual(eight.topics,['e8-rede']);
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['e8-rede'],grade:5}),/Ano inválido/);
 assert.throws(()=>createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas'],grade:8}),/ao menos um tema/);
});

test('campeonato EDF salvo sem ano (versão anterior) continua válido e vira 7º ano; com ano percorre a validação inteira',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
 const state=createEdfDuel({teams:teams(),rounds:3,games:['forca'],topics:['lutas','ginastica']});drawEdfTurn(state,()=>0);
 const legacy=JSON.parse(JSON.stringify(state));delete legacy.grade;
 const migrated=validateEdfDuel(legacy);assert.equal(migrated.grade,7);assert.deepEqual(migrated.topics,['ginastica','lutas']);
 const six=createEdfDuel({teams:teams(3),rounds:3,games:['forca','search'],topics:['e6-lutas'],grade:6});
 drawEdfTurn(six,()=>0);commitEdfTurn(six,{scores:[1000,0],winnerSide:0});drawEdfTurn(six,()=>0);
 saveEdfDuel(six,storage);const loaded=loadEdfDuel(storage);assert.equal(loaded.grade,6);assert.deepEqual(loaded,six);
 const forged=structuredClone(six);forged.grade=8;assert.throws(()=>validateEdfDuel(forged));
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/edf-config.test.js`
Expected: FAIL (`parseEdfConfig` não existe; `createEdfDuel` ignora `grade`).

- [ ] **Passo 3: Campeonato EDF com ano (`edf-duel.js`)**

Faça cinco edições em `edf-duel.js` (cada trecho de `old_string` é único no arquivo):

1. Importações. Troque
`import {normalizeEdfTopics} from './edf-content.js';`
por
```js
import {normalizeEdfTopics} from './edf-content.js';
import {isGrade,DEFAULT_GRADE} from './edf-anos.js';
```
2. Assinatura. Troque `export function createEdfDuel({teams,rounds,games,topics,difficulty='normal'}){` por `export function createEdfDuel({teams,rounds,games,topics,difficulty='normal',grade=DEFAULT_GRADE}){`
3. Validação. Troque ` if(!['normal','hard'].includes(difficulty))fail('Dificuldade inválida.');` por
```js
 if(!['normal','hard'].includes(difficulty))fail('Dificuldade inválida.');
 if(!isGrade(grade))fail('Ano inválido.');
```
4. Objeto retornado. Troque `topics:normalizeEdfTopics(topics),difficulty,done:0,` por `topics:normalizeEdfTopics(topics,Number(grade)),difficulty,done:0,`. Depois troque o final `stats:Object.fromEntries(clean.map(t=>[t.id,{played:0,wins:0,points:0}]))};` por `stats:Object.fromEntries(clean.map(t=>[t.id,{played:0,wins:0,points:0}])),grade:Number(grade)};`. O `grade` precisa ser a última chave: `validateEdfDuel` compara os objetos pelo texto JSON, que depende da ordem.
5. Validação de salvamento. Troque
```js
 const rebuilt=createEdfDuel({teams:value.teams,rounds:value.rounds,games:value.games,topics:value.topics,difficulty:value.difficulty});
```
por
```js
 if(value.grade===undefined)value={...value,grade:DEFAULT_GRADE};
 const rebuilt=createEdfDuel({teams:value.teams,rounds:value.rounds,games:value.games,topics:value.topics,difficulty:value.difficulty,grade:value.grade});
```

- [ ] **Passo 4: Reescrever `edf-menu.js` (configuração e seletor de ano)**

Substitua o arquivo inteiro por:

```js
import {EDF_GRADES,DEFAULT_GRADE,getGrade,normalizeGrade} from './edf-anos.js';
import {edfCardsOf,edfImage,normalizeEdfTopics} from './edf-content.js';
import {uiIcon} from './ui-art.js';
import {makeEdfGame} from './edf-theme.js';

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
 shell(`<section class="edf-heading"><div><span class="eyebrow" id="edf-eyebrow"></span><h1>Conhecimento em movimento.</h1><p>Os jogos do Duelo do Futuro com os conteúdos dos cadernos DED Express de Educação Física.</p></div><img id="edf-hero" alt=""></section><div class="actions edf-entry-actions">${button(uiIcon('shuffle')+' Equipes, alunos e sorteio','edf-tournament','primary')}</div><form id="edf-form" class="edf-setup"><fieldset class="edf-grades"><legend>Qual ano vai jogar?</legend>${EDF_GRADES.map(info=>`<label class="edf-grade"><input type="radio" name="edf-grade" value="${info.grade}" ${info.grade===grade?'checked':''}><img src="${edfImage(info.heroImage,info.grade)}" alt=""><span><b>${info.grade}º ano</b><small>${esc(info.tagline)}</small></span></label>`).join('')}</fieldset><fieldset class="edf-topics" id="edf-topic-list"></fieldset><p id="edf-count" class="edf-count" role="status"></p><label class="edf-game-select-label">Qual jogo EDF?<select id="edf-game">${games.map(g=>`<option value="${g.id}">${esc(titleOf(g))}</option>`).join('')}</select></label><div class="edf-game-choices">${games.map(g=>`<button type="button" data-edf-pick="${g.id}">${g.id==='edf'?uiIcon('book'):g.id==='ordem'?uiIcon('drag'):`<img src="assets/visual/menu/seal-${g.id}.webp" alt="">`}<span>${esc(titleOf(g))}</span></button>`).join('')}</div><div class="edf-options"><label>Como jogar<select id="edf-mode"><option value="duel">Duelo livre • dois lados</option><option value="solo">Solo • minha melhor marca</option></select></label><label>Dificuldade inicial<select id="edf-level"><option value="normal"></option><option value="hard">Avançado • análise de situações</option></select></label><label id="edf-first-label">Equipe ou participante azul<input id="edf-name-a" maxlength="40" value="${esc(config.names[0])}" required></label><label id="edf-second-label">Equipe ou participante laranja<input id="edf-name-b" maxlength="40" value="${esc(config.names[1])}" required></label></div>${teams.length>=2?'<button type="button" class="secondary" id="edf-use-teams">'+uiIcon('teams')+' Usar as duas primeiras equipes cadastradas</button>':''}<p class="edf-note">O duelo livre não altera seu campeonato. Escolha o ano, um jogo, os temas e o modo de jogar. Para cadastrar alunos e definir rodadas, use Equipes, alunos e sorteio.</p><div class="actions">${button('Voltar','home')}<button type="submit" class="primary">${uiIcon('play')} Preparar jogo EDF</button></div></form><details class="edf-study"><summary>${uiIcon('book')} Conferir cartas e fontes</summary><p id="edf-study-note"></p><div id="edf-study-cards"></div></details>`,'edf-menu');
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
```

- [ ] **Passo 5: Trilha de Cartas conhece o ano (`edf-game.js`)**

Substitua o arquivo inteiro por:

```js
import {edfPool,normalizeEdfTopics,edfImage} from './edf-content.js';
import {getGrade,DEFAULT_GRADE} from './edf-anos.js';
import {appendUiIcon} from './ui-art.js';

export function setupEdfCards(ctx,topicIds,grade=DEFAULT_GRADE){
 const info=getGrade(grade),topics=normalizeEdfTopics(topicIds,info.grade),readers=new Map(),goal=8;
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
   readers.set(level,()=>{if(cursor>=deck.length){deck=ctx.shuffle(edfPool(topics,level,info.grade),rng);cursor=0;if(deck.length>1&&deck[0].id===last)deck.push(deck.shift())}const value=deck[cursor++];last=value.id;return value});
  }
  return readers.get(level)();
 }
 function render(){
  ctx.nextChallenge();current=nextCard();ctx.root.dataset.cardId=current.id;ctx.root.dataset.edfTopic=current.topic;
  prompt.replaceChildren();const copy=node('div','edf-question-copy');
  const topic=info.topics.find(t=>t.id===current.topic);
  copy.append(node('small','edf-card-meta',`${topic.title} • ${current.page?`PDF, p. ${current.page}`:'Complemento de tabuleiro'}`),node('h3','edf-question',current.q));
  if(current.image){const image=node('img','edf-question-image');image.src=edfImage(current.image,info.grade);image.alt=`Ilustração do caderno: ${topic.title}`;prompt.append(image)}
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
```

- [ ] **Passo 6: Passar o ano por `games.js` e `play-session.js`**

Em `games.js`, três edições:
1. Na assinatura de `createGame`, troque `solo = false, edfTopics, subject,` por `solo = false, edfTopics, edfGrade, subject,`.
2. Troque `createEdfTheme(edfTopics) : null;` por `createEdfTheme(edfTopics, edfGrade) : null;`.
3. Troque `case 'edf': setupEdfCards(ctx, edfTopics); break;` por `case 'edf': setupEdfCards(ctx, edfTopics, edfGrade); break;`.

Em `play-session.js`, duas edições:
1. Troque `edfPool(g.edfTopics,3)` por `edfPool(g.edfTopics,3,g.edfGrade)`.
2. Troque `edfTopics:g.edfTopics,difficulty:prefs.difficulty,` por `edfTopics:g.edfTopics,edfGrade:g.edfGrade,difficulty:prefs.difficulty,`.

- [ ] **Passo 7: Campeonato EDF na interface (`edf-duel-ui.js`)**

Edições em `edf-duel-ui.js` (todos os `old_string` abaixo são únicos no arquivo):

1. Linha 1: troque
`import {EDF_TOPICS,EDF_DEFAULT_TOPICS,normalizeEdfTopics} from './edf-content.js';`
por
```js
import {normalizeEdfTopics} from './edf-content.js';
import {getGrade,DEFAULT_GRADE} from './edf-anos.js';
```
2. Troque `let state=null,timers=[],busy=false;` por `let state=null,requested=null,timers=[],busy=false;`.
3. Troque `makeEdfGame(api.games.find(g=>g.id===id),state.topics);` por `makeEdfGame(api.games.find(g=>g.id===id),state.topics,state.grade);`.
4. Troque ` function open(topics){` por ` function open(topics,grade=DEFAULT_GRADE){requested={topics,grade};`.
5. Troque `if(state)return ready();setup(topics);` por `if(state)return ready();setup();`.
6. Troque
```js
 function setup(topics=state?.topics||EDF_DEFAULT_TOPICS){
  const ids=normalizeEdfTopics(topics);
```
por
```js
 function setup(topics=requested?.topics??state?.topics,grade=requested?.grade??state?.grade??DEFAULT_GRADE){
  const info=getGrade(grade),ids=normalizeEdfTopics(topics??info.defaultTopics,info.grade);
```
7. Troque `CAMPEONATO EDF • EQUIPES E ALUNOS</span>` por `CAMPEONATO EDF • ${info.grade}º ANO • EQUIPES E ALUNOS</span>`.
8. Troque `<option value="normal">Desafio • 7º ano</option>` por `<option value="normal">Desafio • ${info.grade}º ano</option>`.
9. Troque `${EDF_TOPICS.map(t=>` por `${info.topics.map(t=>`.
10. Troque `esc(makeEdfGame(g,ids).title)` por `esc(makeEdfGame(g,ids,info.grade).title)`.
11. Troque `.map(el=>el.value),games:` por `.map(el=>el.value),grade:info.grade,games:`.
12. Troque `CAMPEONATO EDF • ${state.done} DE ${state.rounds} RODADAS` por `CAMPEONATO EDF • ${state.grade}º ANO • ${state.done} DE ${state.rounds} RODADAS`.
13. Troque `topics:[...state.topics],difficulty:state.difficulty,` por `topics:[...state.topics],grade:state.grade,difficulty:state.difficulty,`.

- [ ] **Passo 8: `app.js`**

Edições em `app.js`:

1. Importação (linha 2): troque `import {EDF_GAME,edfRecordId} from './edf-content.js';` por
```js
import {EDF_GAME,edfRecordId} from './edf-content.js';
import {getGrade,normalizeGrade} from './edf-anos.js';
```
2. Em `selectedGame()`: troque `return edfActive?makeEdfGame(base,edfConfig.topics):base` por `return edfActive?makeEdfGame(base,edfConfig.topics,edfConfig.grade):base`.
3. Troque a função `edfCompetition` inteira
`function edfCompetition(){try{const controls=[...document.querySelectorAll('[name="edf-topic"]:checked')];edfActive=true;edfDuelUI.open(controls.length?controls.map(el=>el.value):edfConfig.topics)}catch(error){toast(error.message)}}`
por
`function edfCompetition(){try{const controls=[...document.querySelectorAll('[name="edf-topic"]:checked')],grade=normalizeGrade(document.querySelector('[name="edf-grade"]:checked')?.value??edfConfig.grade);edfActive=true;edfDuelUI.open(controls.length?controls.map(el=>el.value):getGrade(grade).defaultTopics,grade)}catch(error){toast(error.message)}}`
4. Botão da tela inicial: troque `button(uiIcon('book')+' EDF • 7º ano','edf','secondary')` por `button(uiIcon('book')+' EDF','edf','secondary')`.
5. Tela de preparação: troque `g.subject==='edf'?'Desafio • 7º ano':'Desafio 14–15 anos'` por ``g.subject==='edf'?`Desafio • ${g.edfGrade}º ano`:'Desafio 14–15 anos'``.
6. Início de partida do campeonato: troque `edfConfig={...edfConfig,topics:ctx.topics};prefs.difficulty=ctx.difficulty;` por `edfConfig={...edfConfig,topics:ctx.topics,grade:ctx.grade};prefs.difficulty=ctx.difficulty;`.

- [ ] **Passo 9: Estilos do seletor de ano (`edf.css`)**

Acrescente ao final de `edf.css`:

```css
.edf-grades{border:0;margin:0 0 1.2rem;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}
.edf-grades legend{font-size:1.8rem;font-weight:700;margin-bottom:1rem}
.edf-grade{position:relative;display:flex;align-items:center;gap:.8rem;min-height:6.6rem;padding:.8rem 1rem;border:.25rem solid #ffffff35;border-radius:1.4rem;background:#0d1650;cursor:pointer}
.edf-grade input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.edf-grade img{width:5rem;height:5rem;flex:none;object-fit:contain}
.edf-grade b{display:block;font-size:2rem}
.edf-grade small{display:block;font-size:1.15rem;line-height:1.15;opacity:.85}
.edf-grade:has(input:checked){border-color:#ffd63d;background:#1b2a8a;box-shadow:0 0 0 .2rem #ffd63d66}
.edf-grade:has(input:focus-visible){outline:.3rem solid #fff;outline-offset:.2rem}
@media(max-aspect-ratio:14/10){.edf-grades{grid-template-columns:repeat(2,minmax(0,1fr))}}
```

- [ ] **Passo 10: Rodar os testes de regras**

Run: `npm test`
Expected: PASS em tudo, incluindo `tests/edf-config.test.js`. O teste "campeonato EDF salvo sem ano" falha se `grade` não for a última chave do objeto retornado por `createEdfDuel`; confira o Passo 3.4.

- [ ] **Passo 11: Escrever o teste de navegador**

Crie `tests/browser/edf-anos.spec.js`:

```js
import {test,expect} from '@playwright/test';

async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}
const openMenu=async page=>{await page.locator('[data-action="edf"]').click();await expect(page.locator('#edf-form')).toBeVisible()};
const pickGrade=(page,grade)=>page.locator(`.edf-grade:has([value="${grade}"])`).click();

test('menu EDF: escolher o ano troca unidades, contagem de cartas e cartas de estudo',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await openMenu(page);
 await expect(page.locator('[name="edf-grade"]')).toHaveCount(4);await expect(page.locator('[name="edf-grade"][value="7"]')).toBeChecked();
 await expect(page.locator('[name="edf-topic"]')).toHaveCount(4);await expect(page.locator('#edf-count')).toContainText('27 cartas');
 await pickGrade(page,8);
 await expect(page.locator('[name="edf-topic"]')).toHaveCount(3);await expect(page.locator('[name="edf-topic"]').first()).toHaveAttribute('value','e8-rede');
 await expect(page.locator('#edf-count')).toContainText('27 cartas');await expect(page.locator('#edf-eyebrow')).toContainText('8º ANO');
 await expect(page.locator('#edf-level option').first()).toHaveText('Desafio • 8º ano');
 await expect(page.locator('#edf-hero')).toHaveAttribute('src',/ano8\/manchete\.png/);
 await page.locator('.edf-study>summary').click();await expect(page.locator('.edf-study-card')).toHaveCount(27);await expect(page.locator('#edf-study-note')).toContainText('8º ano');
 await page.locator('[name="edf-topic"][value="e8-invasao"]').uncheck();await expect(page.locator('#edf-count')).toContainText('18 cartas');
 await page.screenshot({path:'art-check-results/edf-anos/menu-8ano.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 await page.locator('[name="edf-topic"]').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false}));
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await expect(page.locator('#toast')).toHaveText('Selecione ao menos um tema para as cartas.');
 expect(errors).toEqual([]);
});

test('o ano e as unidades ficam salvos por ano, e um salvamento antigo abre no 7º ano',async({page})=>{
 await home(page);
 await page.evaluate(()=>localStorage.setItem('eejam-edf-v1',JSON.stringify({topics:['lutas'],solo:false,names:['Ana','Beto'],gameId:'forca'})));
 await page.reload();await page.clock.runFor(2300);await openMenu(page);
 await expect(page.locator('[name="edf-grade"][value="7"]')).toBeChecked();await expect(page.locator('[name="edf-topic"]:checked')).toHaveCount(1);
 await expect(page.locator('[name="edf-topic"][value="lutas"]')).toBeChecked();await expect(page.locator('#edf-name-a')).toHaveValue('Ana');await expect(page.locator('#edf-game')).toHaveValue('forca');
 await pickGrade(page,9);await expect(page.locator('[name="edf-topic"]:checked')).toHaveCount(3);
 await page.locator('[name="edf-topic"][value="e9-natureza"]').uncheck();
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await expect(page.locator('[data-action="start"]')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('eejam-edf-v1')));
 expect(saved.grade).toBe(9);expect(saved.topics).toEqual(['e9-corpo','e9-lutas']);expect(saved.topicsByGrade['7']).toEqual(['lutas']);
 await page.reload();await page.clock.runFor(2300);await openMenu(page);
 await expect(page.locator('[name="edf-grade"][value="9"]')).toBeChecked();await expect(page.locator('[name="edf-topic"]:checked')).toHaveCount(2);
});

test('Trilha de Cartas usa as cartas do ano escolhido e o resumo mostra o ano',async({page})=>{
 await home(page);await openMenu(page);await pickGrade(page,9);
 await page.locator('#edf-game').selectOption('edf');await page.locator('#edf-form').evaluate(form=>form.requestSubmit());
 await expect(page.locator('.level-tag')).toContainText('Desafio • 9º ano');
 await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .game-edf')).toHaveAttribute('data-card-id',/^9[abc][1-9]$/);
 await expect(page.locator('#board-0 .edf-card-meta')).toContainText(/Ginásticas e corpo|Aventura na natureza|Lutas do mundo/);
});

test('os 13 jogos EDF atuais abrem nos anos 6, 8 e 9 com o conteúdo do ano e cabem no tablet',async({page})=>{
 test.setTimeout(420000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await page.setViewportSize({width:1024,height:768});
 const ids=['edf','turbo','rota','memory','puzzle','secret','scramble','search','rope','forca','balanca','silabas','erro'],failures=[];
 for(const grade of [6,8,9])for(const id of ids){
  await page.goto('/');await page.clock.runFor(2300);await openMenu(page);await pickGrade(page,grade);
  await page.locator('#edf-game').selectOption(id);await page.locator('#edf-form').evaluate(form=>form.requestSubmit());
  await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
  await expect(page.locator('.game[data-subject="edf"]')).toHaveCount(2);
  await expect(page.locator('#board-0 .game')).toHaveAttribute('data-topics',new RegExp(`^e${grade}-`));
  await expect(page.locator('#board-0 .game')).not.toContainText(/marketing|campanha|slogan|público-alvo/i);
  const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));
  for(const b of bounds)if(b.v>1||b.h>1)failures.push({grade,id,...b});
 }
 expect(failures).toEqual([]);expect(errors).toEqual([]);
});

test('campeonato EDF: usa o ano escolhido no menu, guarda o ano e começa partidas com as unidades do ano',async({page})=>{
 await home(page);await openMenu(page);await pickGrade(page,6);
 await page.locator('[data-action="edf-tournament"]').click();
 await expect(page.locator('.page-heading .eyebrow')).toContainText('6º ANO');await expect(page.locator('[name="edf-comp-topic"]')).toHaveCount(3);
 await expect(page.locator('#edf-competition-level option').first()).toHaveText('Desafio • 6º ano');
 for(let i=0;i<2;i++){await page.locator('.edf-team-name').nth(i).fill('Equipe '+i);await page.locator('.edf-team-students').nth(i).fill('A'+i+'\nB'+i+'\nC'+i)}
 await page.locator('#edf-rounds').fill('3');
 await page.locator('#edf-competition-form').evaluate(form=>form.requestSubmit());await expect(page.locator('.edf-ranking li')).toHaveCount(2);
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('eejam-edf-competition-v1')));
 expect(state.grade).toBe(6);expect(state.topics.every(id=>id.startsWith('e6-'))).toBe(true);
 await expect(page.locator('.page-heading .eyebrow')).toContainText('6º ANO');
 await page.locator('[data-action="edf-match-draw"]').click();await page.clock.runFor(5000);
 await page.locator('[data-action="edf-match-start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .game')).toHaveAttribute('data-topics',/^e6-/);
});
```

- [ ] **Passo 12: Rodar os testes de navegador**

Run: `npx playwright test tests/browser/edf-anos.spec.js --reporter=line`
Expected: PASS nos 5 testes (o quarto demora alguns minutos). Se um jogo estourar a altura no tablet (`failures` não vazio), o `id` e o `grade` aparecem no resultado: reduza só o espaçamento do jogo afetado em `edf.css`, sem alterar o 7º ano.

Run: `npx playwright test tests/browser/edf.spec.js tests/browser/edf-expanded.spec.js --reporter=line`
Expected: os testes existentes do 7º ano continuam passando (o menu e o campeonato mantêm os mesmos ids e textos; só ganharam o seletor de ano).

- [ ] **Passo 13: Conferência visual do menu**

Run: `npm start` (em segundo plano) e abra `http://localhost:4173`, clique em **EDF**. Em 1024×768 e em 1920×1080, confira os quatro cartões de ano, a troca de unidades e que a tela rola sem cortes. Feche o servidor.

- [ ] **Passo 14: Commit**

```bash
git add edf-menu.js edf-game.js edf-duel.js edf-duel-ui.js play-session.js games.js app.js edf.css tests/edf-config.test.js tests/browser/edf-anos.spec.js
git commit -m "feat(edf): seletor de ano no menu, configuração por ano e campeonato com ano

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Tarefa 4: Forca com boneco tradicional

**Arquivos:**
- Criar: `forca-boneco.js`
- Modificar: `games.js` (entrada `forca` de `GAMES` e função `setupSecret`), `play.css`, `sw.js`
- Testar: `tests/forca-boneco.test.js` (novo, regras), `tests/browser/forca-boneco.spec.js` (novo, navegador)

**Interfaces:**
- Produz (`forca-boneco.js`):
  - `HANGMAN_PARTS: string[]` com `['head','torso','arm-left','arm-right','leg-left','leg-right']`
  - `MAX_MISTAKES = 6`
  - `visibleParts(mistakes): string[]` (as primeiras `n` partes, `n` limitado entre 0 e 6)
  - `hangmanLabel(mistakes): string` (`'Erros: n de 6'`)
  - `createHangman(doc): {el: HTMLElement, setMistakes(n): void}`
- O SVG tem `.hangman-wood` (5 traços fixos da forca) e `.hangman-part` (6 partes, com `data-part`; a classe `on` marca as visíveis).
- Só o jogo `forca` usa o boneco. A Palavra Secreta (`wordgames.js`) não muda.

- [ ] **Passo 1: Escrever o teste de regras que falha**

Crie `tests/forca-boneco.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {HANGMAN_PARTS,MAX_MISTAKES,visibleParts,hangmanLabel} from '../forca-boneco.js';

test('o boneco tem seis partes, na ordem tradicional',()=>{
 assert.deepEqual(HANGMAN_PARTS,['head','torso','arm-left','arm-right','leg-left','leg-right']);
 assert.equal(MAX_MISTAKES,6);
});

test('visibleParts mostra as primeiras n partes e limita n entre 0 e 6',()=>{
 assert.deepEqual(visibleParts(0),[]);assert.deepEqual(visibleParts(1),['head']);assert.deepEqual(visibleParts(3),['head','torso','arm-left']);
 assert.equal(visibleParts(6).length,6);assert.equal(visibleParts(9).length,6);assert.deepEqual(visibleParts(-2),[]);
 assert.deepEqual(visibleParts('2'),['head','torso']);assert.deepEqual(visibleParts(NaN),[]);assert.deepEqual(visibleParts(undefined),[]);
});

test('hangmanLabel escreve o contador de erros em português',()=>{
 assert.equal(hangmanLabel(0),'Erros: 0 de 6');assert.equal(hangmanLabel(4),'Erros: 4 de 6');assert.equal(hangmanLabel(10),'Erros: 6 de 6');
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/forca-boneco.test.js`
Expected: FAIL com `Cannot find module '.../forca-boneco.js'`.

- [ ] **Passo 3: Criar o componente**

Crie `forca-boneco.js`:

```js
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
```

- [ ] **Passo 4: Rodar o teste de regras**

Run: `node --test tests/forca-boneco.test.js`
Expected: PASS nos 3 testes.

- [ ] **Passo 5: Trocar o foguete pelo boneco em `games.js`**

1. Importação. Junto às outras importações do topo do arquivo, acrescente:
```js
import { createHangman, hangmanLabel } from './forca-boneco.js';
```
2. Texto do jogo no catálogo. Troque
```js
  { id: 'forca', title: 'Forca das Palavras', subtitle: 'Seis chances para decolar', icon: 'rocket', rule: 'Escolha letras para revelar a palavra antes que as seis unidades de combustível acabem.', duration: 60 },
```
por
```js
  { id: 'forca', title: 'Forca das Palavras', subtitle: 'Seis chances para salvar o boneco', icon: 'rocket', rule: 'Escolha letras para revelar a palavra antes que o boneco da forca fique completo. Você tem seis chances.', duration: 60 },
```
3. Função `setupSecret`. Ela vai de `  function setupSecret() {` até a linha anterior a `  function setupScramble() {`. Salve o bloco abaixo em um arquivo temporário `.tmp-setupSecret.js` na raiz do projeto e rode o comando que o troca:

```js
  function setupSecret() {
    const read = wordReader();
    let current, mistakes = 0, completed = 0;
    const guessed = new Set();
    let slots, figure, mistakesLabel;
    function paint() {
      slots.replaceChildren();
      for (const letter of current.word) slots.append(node('span', 'letter', guessed.has(letter) ? letter : '＿'));
      figure.setMistakes(mistakes);
      mistakesLabel.textContent = hangmanLabel(mistakes);
      progress.textContent = `${completed} palavras descobertas`;
    }
    function render() {
      nextChallenge();
      current = read(); mistakes = 0; guessed.clear();
      prompt.textContent = level === 3 ? `Descubra a palavra · ${current.word.length} letras` : current.hint;
      helper.textContent = level === 3 ? `Dica: ${current.hint}` : 'Acentos não mudam a tecla: A também vale para Ã.';
      stage.replaceChildren();
      figure = createHangman(doc); slots = node('div', 'word-slots'); mistakesLabel = node('div', 'helper');
      slots.style.display = 'flex'; slots.style.flexWrap = 'wrap'; slots.style.justifyContent = 'center';
      const row = node('div', 'hangman-row'); row.append(figure.el, slots);
      const keyboard = node('div', 'answers');
      Object.assign(keyboard.style, { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' });
      const letters = [...new Set(current.word)];
      const alphabet = shuffle([... 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(letter => !letters.includes(letter)), challengeRng);
      const keyCount = level === 1 ? 12 : level === 3 ? 16 : 14;
      letters.push(...alphabet.slice(0, keyCount - letters.length));
      shuffle(letters, layoutRng).forEach(letter => keyboard.append(button(letter, 'guess', letter, 'letter')));
      stage.append(mistakesLabel, row, keyboard); paint();
    }
    act = (action, value, target) => {
      if (action !== 'guess' || guessed.has(value)) return;
      guessed.add(value); target.disabled = true; target.classList.add('chosen');
      const good = current.word.includes(value);
      if (!good) mistakes++;
      paint();
      if ([...current.word].every(letter => guessed.has(letter))) {
        completed++; paint(); score(20 + (6 - mistakes) * 5, true, target);
        if (active()) feedback(true, `Muito bem! A palavra é ${current.word}.`, render, 1000);
      } else if (!good) {
        score(0, false, target);
        if (active()) feedback(false, mistakes === 6 ? `Acabaram as chances. A palavra era ${current.word}. Vamos tentar outra!` : 'Essa letra não aparece. Observe as letras reveladas.', mistakes === 6 ? render : null, mistakes === 6 ? 1700 : 1000);
      } else helper.textContent = 'Essa letra faz parte da palavra!';
    };
    render();
  }
```

```bash
node -e "const fs=require('fs');let s=fs.readFileSync('games.js','utf8');const a=s.indexOf('  function setupSecret() {'),b=s.indexOf('  function setupScramble() {');if(a<0||b<0||b<a)throw Error('marcadores não encontrados');s=s.slice(0,a)+fs.readFileSync('.tmp-setupSecret.js','utf8').replace(/\s+$/,'')+'\n\n'+s.slice(b);fs.writeFileSync('games.js',s)"
rm .tmp-setupSecret.js
git diff --stat games.js
```
Expected: o diff mostra só a troca de `setupSecret`, a importação e a entrada de `GAMES`.

4. Confirme que nada mais no arquivo usa a barra de combustível da Forca:
Run: `grep -n "fuel\|Combustível\|Decolou" games.js`
Expected: nenhuma linha (a Palavra Secreta mora em `wordgames.js`).

- [ ] **Passo 6: Estilos do boneco (`play.css`)**

Logo abaixo das regras `.game-forca .answers…` (comentário "Forca das Palavras (jogo antigo)…"), acrescente:

```css
/* Forca: boneco tradicional ao lado da palavra */
.hangman-row{display:flex;align-items:center;justify-content:center;gap:1.4rem;margin:.4rem 0}
.hangman{flex:none;width:9.5rem;height:10.5rem}
.hangman svg{display:block;width:100%;height:100%}
.hangman-wood{fill:none;stroke:#c18a4a;stroke-width:8;stroke-linecap:round}
.hangman-part{fill:none;stroke:#fff4d6;stroke-width:6;stroke-linecap:round;opacity:0;transition:opacity .25s ease}
.hangman-part.on{opacity:1}
body.reduced .hangman-part{transition:none}
.game-forca .hangman-row .word-slots{flex:1 1 auto;min-width:0;margin:0}
```

- [ ] **Passo 7: Cache offline**

Em `sw.js`, antes de `self.addEventListener('install',`, acrescente:
```js
FILES.push('./forca-boneco.js');
```

- [ ] **Passo 8: Escrever o teste de navegador**

Crie `tests/browser/forca-boneco.spec.js`:

```js
import {test,expect} from '@playwright/test';

const ORDER=['head','torso','arm-left','arm-right','leg-left','leg-right'];
async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}

// Aperta teclas e confere, a cada toque, que o contador e o desenho mostram o mesmo número de partes, na ordem.
async function playLetters(page,presses){
 let maxErrors=0;
 for(let i=0;i<presses;i++){
  await page.locator('#board-0 .answers .letter:not(.chosen)').first().dispatchEvent('pointerdown',{pointerId:1,button:0});
  await page.clock.runFor(1100);
  const label=await page.locator('#board-0 .game-stage > .helper').first().textContent();
  const count=Number(label.match(/Erros: (\d) de 6/)[1]);
  const shown=await page.locator('#board-0 .hangman-part.on').evaluateAll(parts=>parts.map(part=>part.dataset.part));
  expect(shown).toEqual(ORDER.slice(0,count));
  maxErrors=Math.max(maxErrors,count);
 }
 return maxErrors;
}

test('Forca (modo normal) mostra o boneco tradicional, sem foguete nem combustível',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await page.setViewportSize({width:1024,height:768});
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="forca"]').click();
 await expect(page.locator('.rule')).toContainText('boneco da forca');
 await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .hangman')).toBeVisible();await expect(page.locator('#board-0 .hangman-wood')).toHaveCount(5);
 await expect(page.locator('#board-0 .hangman-part.on')).toHaveCount(0);await expect(page.locator('#board-0 .game-stage > .helper').first()).toHaveText('Erros: 0 de 6');
 await expect(page.locator('#board-0 .fuel')).toHaveCount(0);await expect(page.locator('#board-0')).not.toContainText(/combust/i);
 expect(await playLetters(page,12)).toBeGreaterThan(0);
 const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));
 for(const b of bounds){expect(b.v).toBeLessThanOrEqual(1);expect(b.h).toBeLessThanOrEqual(1)}
 await page.screenshot({path:'art-check-results/forca-boneco/modo-normal.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 expect(errors).toEqual([]);
});

test('Forca EDF usa o mesmo boneco com palavras do ano escolhido',async({page})=>{
 await home(page);await page.setViewportSize({width:1024,height:768});
 await page.locator('[data-action="edf"]').click();await page.locator('.edf-grade:has([value="9"])').click();
 await page.locator('#edf-game').selectOption('forca');await page.locator('#edf-form').evaluate(form=>form.requestSubmit());
 await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0 .game')).toHaveAttribute('data-topics',/^e9-/);await expect(page.locator('#board-0 .hangman')).toBeVisible();
 expect(await playLetters(page,12)).toBeGreaterThan(0);
 await page.screenshot({path:'art-check-results/forca-boneco/modo-edf-9ano.png',animations:'disabled',style:'#wipe{visibility:hidden!important}'});
});

test('a Palavra Secreta continua com o foguete e o combustível',async({page})=>{
 await home(page);
 await page.locator('[data-action="catalog-demo"]').click();await page.locator('[data-id="secret"]').click();await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
 await expect(page.locator('#board-0')).toContainText('Combustível');await expect(page.locator('#board-0 .hangman')).toHaveCount(0);
});

test('o componente mostra de 0 a 6 partes, na ordem, e descreve o estado para leitores de tela',async({page})=>{
 await home(page);
 const states=await page.evaluate(async()=>{
  const {createHangman}=await import('/forca-boneco.js');const figure=createHangman(document);document.body.append(figure.el);
  const out=[];for(const n of [0,1,2,3,4,5,6,9]){figure.setMistakes(n);out.push({n,on:[...figure.el.querySelectorAll('.hangman-part.on')].map(el=>el.dataset.part),label:figure.el.querySelector('svg').getAttribute('aria-label'),wood:figure.el.querySelectorAll('.hangman-wood').length})}
  figure.el.remove();return out;
 });
 for(const state of states){const shown=Math.min(state.n,6);expect(state.on).toEqual(ORDER.slice(0,shown));expect(state.label).toContain(`${shown} de 6`);expect(state.wood).toBe(5)}
});
```

- [ ] **Passo 9: Rodar os testes de navegador**

Run: `npx playwright test tests/browser/forca-boneco.spec.js --reporter=line`
Expected: PASS nos 4 testes. Se a Forca estourar a altura (`b.v > 1`), reduza `.hangman` para `width:8rem;height:9rem` em `play.css` e rode de novo. Abra os dois PNG de `art-check-results/forca-boneco/` e confirme que o boneco e a forca de madeira aparecem inteiros e legíveis.

Run: `npx playwright test tests/browser/game-contracts.spec.js tests/browser/newgames.spec.js tests/browser/upgrade.spec.js --reporter=line`
Expected: continuam passando (eles testam a Palavra Secreta e o contrato dos jogos, não a barra da Forca).

- [ ] **Passo 10: Commit**

```bash
git add forca-boneco.js games.js play.css sw.js tests/forca-boneco.test.js tests/browser/forca-boneco.spec.js
git commit -m "feat(forca): boneco tradicional da forca no lugar do foguete, nos modos normal e EDF

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Tarefa 5: Ordene a Sequência

**Arquivos:**
- Criar: `edf-sequencia.js`
- Modificar: `edf-theme.js` (entrada `ordem` em `EDF_VARIANTS`), `games.js`, `app.js`, `edf.css`, `sw.js`, `tests/edf-expanded.test.js`
- Testar: `tests/edf-sequencia.test.js` (novo, regras), `tests/browser/edf-sequencia.spec.js` (novo, navegador)

**Interfaces:**
- Consome (Tarefas 1 e 3): `EDF_ORDEM_GAME`, `edfSequencePool`, `createEdfTheme(topics, grade).sequences(level)` e `.key`/`.grade`, `getGrade(grade).topics`, `attachDrag(ctx, {items, targets, onDrop, onTap})` de `drag.js`, e o contexto de `createGame` (`ctx.level`, `ctx.seed`, `ctx.theme`, `ctx.nextChallenge`, `ctx.awardSolved`, `ctx.awardWrong`, `ctx.feedback`, `ctx.setAct`, `ctx.shuffle`, `ctx.seededRandom`, `ctx.active`, `ctx.node`, `ctx.button`, `ctx.stage`, `ctx.prompt`, `ctx.progress`, `ctx.helper`).
- Produz: `setupSequence(ctx): void` em `edf-sequencia.js`; jogo com id `ordem` disponível em `createGame({id:'ordem', subject:'edf', edfTopics, edfGrade, ...})`.

**Como o jogo funciona:** os cartões aparecem embaralhados em linhas numeradas (1…n). Arrastar um cartão sobre outro, ou tocar em dois cartões, troca os dois de lugar. O botão **Conferir ordem** compara com a ordem correta. Cada sequência tem uma tentativa: acerto vale 1.000 pontos mais o bônus de rapidez; erro vale 0 e mostra a ordem correta por alguns segundos antes da próxima sequência. A ordem inicial é sorteada pela semente da partida (igual nos dois lados do duelo) e nunca começa certa.

- [ ] **Passo 1: Escrever o teste de regras que falha**

Crie `tests/edf-sequencia.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {EDF_VARIANTS,makeEdfGame} from '../edf-theme.js';
import {EDF_ORDEM_GAME} from '../edf-content.js';
import {UI_ICON_NAMES} from '../ui-art.js';
import {createEdfDuel} from '../edf-duel.js';

test('Ordene a Sequência é um jogo EDF com ícone existente, 90 segundos e regra própria',()=>{
 assert.equal(EDF_ORDEM_GAME.id,'ordem');assert.equal(EDF_ORDEM_GAME.duration,90);assert.ok(UI_ICON_NAMES.includes(EDF_ORDEM_GAME.icon));
 assert.ok(EDF_VARIANTS.ordem);assert.equal(EDF_VARIANTS.ordem.title,'Ordene a Sequência');assert.match(EDF_VARIANTS.ordem.rule,/Conferir/);
 assert.equal(Object.keys(EDF_VARIANTS).length,14);
});

test('a partida identifica o ano e guarda o recorde do Ordene a Sequência por ano e unidades',()=>{
 const game=makeEdfGame(EDF_ORDEM_GAME,['e8-sociedade'],8);
 assert.equal(game.subject,'edf');assert.equal(game.edfGrade,8);assert.equal(game.recordId,'edf8:e8-sociedade:ordem');assert.equal(game.duration,90);
 assert.equal(makeEdfGame(EDF_ORDEM_GAME,['lutas']).recordId,'edf:lutas:ordem');
});

test('o campeonato EDF aceita o Ordene a Sequência no sorteio',()=>{
 const teams=Array.from({length:2},(_,i)=>({name:'Equipe '+i,students:['A'+i,'B'+i]}));
 const state=createEdfDuel({teams,rounds:2,games:['ordem','forca'],topics:['e9-corpo'],grade:9});
 assert.deepEqual(state.games,['ordem','forca']);
});
```

Em `tests/edf-expanded.test.js`, atualize a contagem e o nome do primeiro teste: troque `assert.equal(Object.keys(EDF_VARIANTS).length,13);` por `assert.equal(Object.keys(EDF_VARIANTS).length,14);` e `all thirteen EDF games have usable isolated content` por `all fourteen EDF games have usable isolated content`.

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/edf-sequencia.test.js`
Expected: FAIL (`EDF_VARIANTS.ordem` não existe).

- [ ] **Passo 3: Registrar a variante `ordem` em `edf-theme.js`**

Dentro de `EDF_VARIANTS`, depois da entrada `balanca:{…},`, acrescente:
```js
 ordem:{title:EDF_ORDEM_GAME.title,rule:EDF_ORDEM_GAME.rule},
```
(`EDF_ORDEM_GAME` já é importado no topo do arquivo.)

- [ ] **Passo 4: Criar o jogo (`edf-sequencia.js`)**

```js
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
```

- [ ] **Passo 5: Registrar o jogo em `games.js`**

Cinco edições:
1. Troque `import { EDF_GAME } from './edf-content.js';` por `import { EDF_GAME, EDF_ORDEM_GAME } from './edf-content.js';`.
2. Depois de `import { setupEdfCards } from './edf-game.js';`, acrescente `import { setupSequence } from './edf-sequencia.js';`.
3. Troque `const definition = id === 'edf' ? EDF_GAME : GAMES.find(game => game.id === id);` por `const definition = id === 'edf' ? EDF_GAME : id === 'ordem' ? EDF_ORDEM_GAME : GAMES.find(game => game.id === id);`.
4. Troque `const theme = subject === 'edf' || id === 'edf' ? createEdfTheme(edfTopics, edfGrade) : null;` por `const theme = subject === 'edf' || id === 'edf' || id === 'ordem' ? createEdfTheme(edfTopics, edfGrade) : null;`.
5. No `switch (id)`, depois de `case 'edf': setupEdfCards(ctx, edfTopics, edfGrade); break;`, acrescente `case 'ordem': setupSequence(ctx); break;`.

- [ ] **Passo 6: Incluir o jogo nas listas do EDF (`app.js`)**

1. Troque `import {EDF_GAME,edfRecordId} from './edf-content.js';` por `import {EDF_GAME,EDF_ORDEM_GAME,edfRecordId} from './edf-content.js';`.
2. Troque `const edfGames=[EDF_GAME,...GAMES];` por `const edfGames=[EDF_GAME,...GAMES,EDF_ORDEM_GAME];`.
3. Em `selectedGame()`, troque `const base=selected==='edf'?EDF_GAME:GAMES.find(game=>game.id===selected);` por `const base=selected==='edf'?EDF_GAME:selected==='ordem'?EDF_ORDEM_GAME:GAMES.find(game=>game.id===selected);`.

(O menu `edf-menu.js` e o campeonato já listam `games` e já mostram o ícone `drag` para `ordem`.)

- [ ] **Passo 7: Estilos (`edf.css`) e cache offline**

Acrescente ao final de `edf.css`:

```css
/* Ordene a Sequência */
.game-ordem{display:flex;flex-direction:column;height:100%;min-height:0}
.game-ordem>.prompt{flex:none;min-height:0;margin:0 0 .3rem;padding:.4rem .8rem;text-align:left}
.game-ordem .edf-card-meta{display:block;font-size:1.1rem;opacity:.85}
.game-ordem .edf-question{margin:0;font-size:1.5rem;line-height:1.15}
.game-ordem .game-progression,.game-ordem .game-progress{margin:0;font-size:1.1rem;line-height:1.2}
.game-ordem .helper{margin:.2rem 0;font-size:1.15rem;line-height:1.2}
.game-ordem .game-stage{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.4rem}
.seq-list{display:grid;gap:.3rem;margin:0;padding:0;list-style:none}
.seq-row{display:grid;grid-template-columns:2.8rem 1fr;gap:.5rem;align-items:center;padding:.2rem .3rem;border:.18rem dashed #ffffff55;border-radius:1rem;background:#ffffff14}
.seq-num{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:#ffd63d;color:#101a5c;font-size:1.5rem;font-weight:700}
.seq-card{display:flex;align-items:center;min-height:3rem;padding:.25rem .8rem;border:.2rem solid #101a5c;border-radius:.9rem;background:#fff4d6;color:#101a5c;font-size:1.3rem;font-weight:600;line-height:1.12;cursor:grab;touch-action:none;user-select:none}
.seq-card.selected{outline:.28rem solid #30c48d;outline-offset:.1rem}
.seq-card.dragging{cursor:grabbing;box-shadow:0 1rem 1.2rem #0009}
.seq-list.ok .seq-row{border-color:#30c48d;background:#30c48d33}
.seq-list.bad{animation:nope .35s}
.game-ordem .answer{flex:none;min-height:3.8rem;padding:.3rem 1rem;font-size:1.6rem}
```

Em `sw.js`, antes de `self.addEventListener('install',`, acrescente:
```js
FILES.push('./edf-sequencia.js');
```

- [ ] **Passo 8: Rodar os testes de regras**

Run: `npm test`
Expected: PASS em tudo (inclui `tests/edf-expanded.test.js` com 14 variantes).

- [ ] **Passo 9: Escrever o teste de navegador**

Crie `tests/browser/edf-sequencia.spec.js`:

```js
import {test,expect} from '@playwright/test';

async function home(page){const time=new Date('2027-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);await page.goto('/');await page.clock.runFor(2300)}
async function start(page,{grade=6,solo=false,difficulty='normal'}={}){
 await page.locator('[data-action="edf"]').click();await page.locator(`.edf-grade:has([value="${grade}"])`).click();
 await page.locator('#edf-game').selectOption('ordem');await page.locator('#edf-mode').selectOption(solo?'solo':'duel');await page.locator('#edf-level').selectOption(difficulty);
 await page.locator('#edf-form').evaluate(form=>form.requestSubmit());await page.locator('[data-action="start"]').click();await page.clock.runFor(2800);
}
const cards=(page,board=0)=>page.locator(`#board-${board} .seq-card`).allTextContents();
async function sequence(page,grade,board=0){
 const text=await page.locator(`#board-${board} .edf-question`).textContent();
 return page.evaluate(async({text,grade})=>{const {edfSequencesOf}=await import('/edf-content.js');return edfSequencesOf(grade).find(item=>text===`Coloque em ordem: ${item.prompt}`)},{text,grade});
}
// Cada toque separado por um tempo de jogo, para não acionar a proteção contra toques em excesso.
async function tap(page,board,position){await page.locator(`#board-${board} .seq-card`).nth(position).click();await page.clock.runFor(800)}
async function solve(page,item,board=0){
 for(let i=0;i<item.steps.length;i++){
  const now=await cards(page,board),at=now.indexOf(item.steps[i]);
  if(at!==i){await tap(page,board,i);await tap(page,board,at)}
 }
}
const check=(page,board=0)=>page.locator(`#board-${board} [data-action="check"]`).dispatchEvent('pointerdown',{pointerId:1,button:0});

test('Ordene a Sequência está nas listas do EDF e do campeonato',async({page})=>{
 await home(page);await page.locator('[data-action="edf"]').click();
 await expect(page.locator('#edf-game option[value="ordem"]')).toHaveText('Ordene a Sequência');await expect(page.locator('[data-edf-pick="ordem"]')).toBeVisible();
 await page.locator('[data-action="edf-tournament"]').click();await expect(page.locator('[name="edf-comp-game"][value="ordem"]')).toBeChecked();
});

test('tocar em dois cartões troca os dois de lugar; a ordem certa vale 1000 pontos e os dois lados recebem a mesma sequência',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await home(page);await start(page,{grade:6});
 await expect(page.locator('#board-0 .seq-card')).toHaveCount(3);
 expect(await cards(page,0)).toEqual(await cards(page,1));
 await expect(page.locator('#board-1 .edf-question')).toHaveText(await page.locator('#board-0 .edf-question').textContent());
 const item=await sequence(page,6);expect(item.steps).toHaveLength(3);
 const before=await cards(page);expect(before).not.toEqual(item.steps);
 await tap(page,0,0);await expect(page.locator('#board-0 .seq-card.selected')).toHaveCount(1);await tap(page,0,1);
 const swapped=await cards(page);expect(swapped[0]).toBe(before[1]);expect(swapped[1]).toBe(before[0]);await expect(page.locator('#board-0 .seq-card.selected')).toHaveCount(0);
 await solve(page,item);expect(await cards(page)).toEqual(item.steps);
 await check(page);
 await expect(page.locator('#board-0 .seq-list')).toHaveClass(/ok/);await expect(page.locator('#accuracy-0')).toContainText('1 acertos');await expect(page.locator('#score-0')).toHaveText(/^10\d\d$/);
 await page.clock.runFor(1700);await expect(page.locator('#board-0 .edf-question')).not.toHaveText(`Coloque em ordem: ${item.prompt}`);
 expect(errors).toEqual([]);
});

test('ordem errada vale 0, mostra a ordem correta e segue para outra sequência',async({page})=>{
 await home(page);await start(page,{grade:8});
 const item=await sequence(page,8);expect(await cards(page)).not.toEqual(item.steps);
 await check(page);
 await expect(page.locator('#board-0 .seq-list')).toHaveClass(/bad/);await expect(page.locator('#score-0')).toHaveText('0');
 expect(await cards(page)).toEqual(item.steps);await expect(page.locator('#board-0 .game > .helper')).toContainText('ordem correta');
 await page.clock.runFor(3300);await expect(page.locator('#board-0 .edf-question')).not.toHaveText(`Coloque em ordem: ${item.prompt}`);
 await expect(page.locator('#accuracy-0')).toContainText('0 acertos');
});

test('arrastar um cartão sobre outro troca os dois de lugar',async({page})=>{
 await home(page);await start(page,{grade:9});
 const before=await cards(page);
 await page.locator('#board-0 .seq-card').nth(0).dragTo(page.locator('#board-0 .seq-row').nth(2));
 const after=await cards(page);expect(after[2]).toBe(before[0]);expect(after[0]).toBe(before[2]);expect(after[1]).toBe(before[1]);
});

test('os níveis pedem 3, 4 e 5 cartões e o jogo funciona em solo',async({page})=>{
 await home(page);await start(page,{grade:7,solo:true,difficulty:'hard'});
 await expect(page.locator('#board-0 .seq-card')).toHaveCount(5);await expect(page.locator('.game[data-subject="edf"]')).toHaveCount(1);
 const item=await sequence(page,7);expect(item.steps).toHaveLength(5);await solve(page,item);await check(page);await expect(page.locator('#accuracy-0')).toContainText('1 acertos');
});

test('cabe na arena com 5 cartões em 16:9 e em 4:3',async({page})=>{
 const failures=[];
 await home(page);
 for(const size of [{width:1280,height:720},{width:1024,height:768}]){
  await page.setViewportSize(size);await page.goto('/');await page.clock.runFor(2300);await start(page,{grade:8,difficulty:'hard'});
  await expect(page.locator('#board-0 .seq-card')).toHaveCount(5);
  const bounds=await page.locator('.board').evaluateAll(boards=>boards.map(el=>({v:el.scrollHeight-el.clientHeight,h:el.scrollWidth-el.clientWidth})));
  for(const b of bounds)if(b.v>1||b.h>1)failures.push({...size,...b});
  await page.screenshot({path:`art-check-results/edf-sequencia/${size.width}x${size.height}.png`,animations:'disabled',style:'#wipe{visibility:hidden!important}'});
 }
 expect(failures).toEqual([]);
});
```

- [ ] **Passo 10: Rodar e ajustar o encaixe**

Run: `npx playwright test tests/browser/edf-sequencia.spec.js --reporter=line`
Expected: PASS nos 6 testes. Se o último falhar (`failures` não vazio), a arena é pequena demais para 5 cartões. Ajuste `edf.css` nesta ordem, parando assim que passar: (1) reduza `.seq-card` para `min-height:2.6rem;font-size:1.2rem` e `.seq-row` para `padding:.1rem .25rem`; (2) reduza `.game-ordem .edf-question` para `font-size:1.3rem`; (3) esconda `.game-ordem .game-progression` com `display:none`. Mantenha o texto dos cartões com pelo menos `1.2rem` e rode também `npx playwright test tests/browser/edf-sequencia.spec.js -g "cabe"` depois de cada ajuste. Abra os PNG de `art-check-results/edf-sequencia/` e confirme que os cinco cartões, os números e o botão **Conferir ordem** aparecem inteiros.

- [ ] **Passo 11: Rodar a suíte do EDF e commit**

Run: `npx playwright test tests/browser/edf.spec.js tests/browser/edf-expanded.spec.js tests/browser/edf-anos.spec.js --reporter=line`
Expected: continuam passando.

```bash
git add edf-sequencia.js edf-theme.js games.js app.js edf.css sw.js tests/edf-expanded.test.js tests/edf-sequencia.test.js tests/browser/edf-sequencia.spec.js
git commit -m "feat(edf): jogo Ordene a Sequência com cartões de linha do tempo e passo a passo

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
### Tarefa 6: Cache offline, documentação e verificação final

**Arquivos:**
- Modificar: `sw.js` (versão), `app.js` (nome do cache), `MODO_EDF_7_ANO.md`, `README.md`
- Testar: `tests/sw-files.test.js` (novo, regras), `tests/browser/sw-servidor.spec.js` (novo, navegador)

**Interfaces:**
- Consome: todos os arquivos registrados em `sw.js` nas Tarefas 1, 2, 4 e 5.
- Produz: cache offline versão `eejam-v16-edf-anos`, com todos os arquivos existentes e servidos; documentação atualizada.

- [ ] **Passo 1: Escrever os testes que falham**

Crie `tests/sw-files.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function swData(){
 const context={self:{addEventListener(){}},caches:{}};vm.createContext(context);
 vm.runInContext(read('sw.js')+';\nglobalThis.__FILES=FILES;globalThis.__VERSION=VERSION;',context);
 return{files:context.__FILES,version:context.__VERSION};
}

test('todo arquivo do cache offline existe no projeto e os arquivos novos do EDF estão listados',()=>{
 const {files}=swData();
 assert.deepEqual(files.filter(file=>file!=='./'&&!existsSync(new URL('../'+file.slice(2),import.meta.url))),[]);
 for(const required of ['./edf-anos.js','./edf-ano6.js','./edf-ano7.js','./edf-ano8.js','./edf-ano9.js','./edf-sequencia.js','./forca-boneco.js','./edf-content.js','./edf-theme.js','./edf-menu.js','./edf-game.js'])assert.ok(files.includes(required),required);
});

test('a versão do cache mudou e é a mesma que o app abre para conferir o modo offline',()=>{
 const {version}=swData();
 assert.equal(version,'eejam-v16-edf-anos');
 assert.match(read('app.js'),new RegExp(`caches\\.open\\('${version}'\\)`));
});
```

Crie `tests/browser/sw-servidor.spec.js`:

```js
import {test,expect} from '@playwright/test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('todos os arquivos do cache offline são servidos com sucesso',async({request})=>{
 const context={self:{addEventListener(){}},caches:{}};vm.createContext(context);
 vm.runInContext(readFileSync('sw.js','utf8')+';\nglobalThis.__FILES=FILES;',context);
 const failures=[];
 for(const file of context.__FILES){const response=await request.get(file.replace(/^\.\//,'/'));if(!response.ok())failures.push(`${file}: ${response.status()}`)}
 expect(failures).toEqual([]);
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test tests/sw-files.test.js`
Expected: o primeiro teste passa (se algum arquivo listado em `sw.js` não existir, ele falha e mostra qual; se o arquivo ausente não for deste trabalho, anote e avise o professor em vez de corrigir); o segundo FALHA porque a versão ainda é `eejam-v15-avatar`.

- [ ] **Passo 3: Subir a versão do cache**

Em `sw.js`, troque `const VERSION='eejam-v15-avatar';` por `const VERSION='eejam-v16-edf-anos';`.
Em `app.js`, troque `caches.open('eejam-v15-avatar')` por `caches.open('eejam-v16-edf-anos')`.

Run: `grep -rn "eejam-v15" --include=*.js --include=*.md . --exclude-dir=node_modules`
Expected: nenhuma linha. Se aparecer algo (por exemplo em testes de navegador), troque pelo novo nome.

- [ ] **Passo 4: Atualizar a documentação**

Em `MODO_EDF_7_ANO.md` (o nome do arquivo não muda), faça estas trocas:

1. Troque as linhas 1–3
```
# Educação Física — 7º ano

Abra **EDF • 7º ano** no menu inicial. O EDF oferece os doze jogos do modo normal adaptados aos conteúdos e mantém a Trilha de Cartas, totalizando treze desafios.
```
por
```
# Educação Física — 6º ao 9º ano

Abra **EDF** no menu inicial e escolha o ano: 6º, 7º, 8º ou 9º. Cada ano usa o conteúdo do seu caderno DED Express. O EDF oferece os doze jogos do modo normal adaptados aos conteúdos, a Trilha de Cartas e o Ordene a Sequência, totalizando catorze desafios.
```
2. Troque `Marque os conteúdos, escolha um desafio e selecione solo ou duelo livre.` por `Escolha o ano, marque os conteúdos, escolha um desafio e selecione solo ou duelo livre.`
3. Na tabela, troque a linha `| Forca | Descoberta de palavras e conceitos do conteúdo. |` por `| Forca | Descoberta de palavras e conceitos do conteúdo, com a forca de madeira e o boneco tradicional (seis erros). |` e, depois da linha `| Circuito em Equilíbrio | … |`, acrescente `| Ordene a Sequência | Arrastar cartões para a ordem certa: linhas do tempo e passo a passo do caderno. Disponível só no EDF. |`.
4. Troque `usam vocabulário de ginástica, aventura e lutas, em vez do banco do modo normal` por `usam vocabulário dos temas marcados, em vez do banco do modo normal`.
5. Na seção `## Conteúdo e artes`, troque o primeiro parágrafo (`Os três temas do caderno vêm selecionados por padrão: …`) por:
```
Cada ano tem três unidades, que vêm marcadas por padrão:

| Ano | Unidades |
| --- | --- |
| 6º | Corpo em forma; Aventura na cidade; Lutas do Brasil |
| 7º | Ginástica e saúde; Aventura urbana segura; Lutas do Brasil: história e respeito. Jogos de tabuleiro é um complemento opcional e pode ser usado sozinho |
| 8º | Rede/parede e campo e taco; Invasão e combate: tática; Esporte e sociedade |
| 9º | Ginásticas e corpo; Aventura na natureza; Lutas do mundo |
```
6. Troque o parágrafo que começa com `Há 27 cartas de revisão adaptadas das páginas 5–9, 12–16 e 19–25` por:
```
Cada ano tem 27 cartas de revisão (9 por unidade), 48 palavras, 27 frases do Caça-Erro e 18 sequências do Ordene a Sequência, todas com a página do caderno. O 7º ano tem, além disso, seis cartas e três sequências complementares de tabuleiro. **Conferir cartas e fontes** mostra as cartas do ano escolhido, com as respostas comentadas e as páginas do material. As cartas, palavras e sequências dos anos 6, 8 e 9 foram escritas a partir do texto dos cadernos; o professor deve conferi-las antes de usar em turma.
```
7. Troque o parágrafo que começa com `Doze ilustrações PNG foram extraídas do glossário da página 25` por:
```
Doze ilustrações PNG de cada ano foram extraídas do glossário da página 25 do caderno, com a transparência original preservada. As do 7º ano estão em `assets/visual/edf/`; as dos outros anos, em `assets/visual/edf/ano6/`, `ano8/` e `ano9/`. A procedência de cada arquivo está no `proveniencia.json` da pasta, e o script `scripts/extrair-glossario.py` repete a extração.
```
8. No fim, substitua o parágrafo de "Verificação desta atualização" por um texto com os totais reais: `Passaram N testes de regras e conteúdo e a suíte completa de M testes de navegador, incluindo os 14 jogos EDF nos quatro anos, a Forca com boneco nos dois modos e o Ordene a Sequência por toque e por arrasto.` Troque N e M pelos totais impressos pelos comandos do Passo 6.

Em `README.md`:
1. Troque o título `## Educação Física — 7º ano` por `## Educação Física — 6º ao 9º ano` e o parágrafo seguinte por: `O botão **EDF** oferece catorze jogos para o ano escolhido (6º, 7º, 8º ou 9º): os doze do modo normal adaptados aos conteúdos do caderno, a Trilha de Cartas e o Ordene a Sequência. Forca, caça-palavras, memória, quebra-cabeças, sílabas, caça-erro, rota, cabo de guerra e os demais usam o conteúdo EDF do ano. Há partidas solo/livres e campeonato próprio com equipes, alunos, quantidade de rodadas, sorteio de cinco segundos, troca individual de aluno, ranking e final. Instruções, regras e referências estão em [MODO_EDF_7_ANO.md](MODO_EDF_7_ANO.md).`
2. Troque `Forca usa combustível de foguete; Palavra Secreta disputa rodadas de descoberta da mesma palavra.` por `Forca usa a forca e o boneco tradicional (seis erros); Palavra Secreta usa combustível de foguete e disputa rodadas de descoberta da mesma palavra.`
3. No parágrafo "Arquivos principais", acrescente ao final: ` edf-anos.js e edf-ano6.js a edf-ano9.js (conteúdo por ano), edf-sequencia.js (Ordene a Sequência) e forca-boneco.js (boneco da Forca).`

- [ ] **Passo 5: Rodar os testes de regras e o teste do servidor**

Run: `npm test`
Expected: PASS em tudo.

Run: `npx playwright test tests/browser/sw-servidor.spec.js --reporter=line`
Expected: PASS (todos os arquivos do cache respondem 200).

- [ ] **Passo 6: Verificação completa**

Run: `npm test`
Expected: PASS. Anote o total (N).

Run (em segundo plano; demora alguns minutos): `npx playwright test --reporter=line`
Expected: todos passam. Compare com a linha de base da Tarefa 0: nenhum teste que passava antes deve falhar. Anote o total (M).

Se algum teste antigo falhar por texto que mudou de propósito (por exemplo, "EDF • 7º ano" ou "treze jogos"), atualize o texto esperado no teste. Se falhar por outro motivo, investigue com `superpowers:systematic-debugging` antes de mexer no código.

- [ ] **Passo 7: Conferência visual**

Abra os PNG gerados pelos testes em `art-check-results/` (pasta ignorada pelo Git) e confirme:
- `edf-anos/menu-8ano.png`: quatro cartões de ano, o 8º destacado, as três unidades do 8º e os 14 jogos.
- `forca-boneco/modo-normal.png` e `modo-edf-9ano.png`: forca de madeira e boneco com as partes na ordem, palavra legível.
- `edf-sequencia/1280x720.png` e `1024x768.png`: cinco cartões, números de 1 a 5 e o botão **Conferir ordem** inteiros.

Com `npm start` em segundo plano e o navegador em `http://localhost:4173`, percorra também: **EDF** → 6º ano → Trilha de Cartas (duelo) e **EDF** → 9º ano → Ordene a Sequência (solo). Feche o servidor ao terminar.

- [ ] **Passo 8: Atualizar os números da documentação e commit**

Troque N e M no `MODO_EDF_7_ANO.md` (Passo 4.8) pelos totais reais.

```bash
git add sw.js app.js MODO_EDF_7_ANO.md README.md tests/sw-files.test.js tests/browser/sw-servidor.spec.js
git commit -m "chore(edf): cache offline v16, documentação dos quatro anos e verificação final

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git status --short
```
Expected no `git status`: só `?? "Conteudos EDF/"` e `?? "Fotos do Evento/"`.

- [ ] **Passo 9: Relatório final ao professor**

Entregue um resumo curto com:
1. O que foi feito (seletor de ano, 14 jogos nos quatro anos, Forca com boneco, Ordene a Sequência) e os totais de testes.
2. **O que o professor precisa conferir:** as cartas, as respostas e as sequências dos anos 6, 8 e 9, que foram escritas a partir do texto dos PDFs. O caminho é **EDF** → ano → **Conferir cartas e fontes**. Em temas sensíveis (apostas, doping, anabolizantes, padrões de beleza, racismo) as cartas só repetem o que o caderno diz.
3. **Pendências conhecidas:**
   - O selo da Forca no catálogo do modo normal (`assets/visual/menu/seal-forca.webp`) ainda é a arte do foguete; trocá-la exige gerar arte nova.
   - As pastas `Conteudos EDF/` (PDFs, 75 MB) e `Fotos do Evento/` continuam fora do Git.
   - Antes do evento, carregue a nova versão com internet até aparecer **Pronto para offline**.
4. Os outros jogos sugeridos (Mito ou Fato, Ache o Risco, Monte o Kit, Ligue os Pontos, Quadra Tática, Plano de Trilha, Detetive de Anúncio) ficam para uma próxima rodada.

---

## Desvios da especificação

- O Ordene a Sequência troca cartões de lugar em linhas numeradas (arrastar um cartão sobre outro, ou tocar em dois cartões), em vez de usar bandeja e espaços: a tela é mais compacta e cabe em 16:9. A especificação foi atualizada para refletir isso.
- Os cartões têm 3, 4 e 5 passos nos níveis 1, 2 e 3 (a conversa inicial citava "3 a 4 / 5 / 5 a 6"): o caderno traz listas de 3 passos quase sempre.
