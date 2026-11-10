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
