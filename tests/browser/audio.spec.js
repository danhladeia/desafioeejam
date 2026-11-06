import {test,expect} from '@playwright/test';

test('settings persist separate music/effects volumes and mute controls',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.getByRole('button',{name:'Ajustes',exact:true}).click();
 await expect(page.getByText('Música e sons', {exact:true})).toBeVisible();
 await page.locator('#music-volume').fill('22');await page.locator('#effects-volume').fill('48');
 await page.locator('#audio-music').uncheck();await page.locator('#audio-test').click();await page.locator('#settings-save').click();
 await expect(page.getByRole('button',{name:'Música desligada',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.reload();await page.getByRole('button',{name:'Ajustes',exact:true}).click();
 await expect(page.locator('#music-volume')).toHaveValue('22');await expect(page.locator('#effects-volume')).toHaveValue('48');await expect(page.locator('#audio-music')).not.toBeChecked();
 await page.locator('#settings-save').click();await page.getByRole('button',{name:'Música desligada',exact:true}).click();await expect(page.getByRole('button',{name:'Música ligada',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Som ligado',exact:true}).click();await expect(page.getByRole('button',{name:'Som desligado',exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('synthesized music generates signal, pauses, resumes, mutes and remains offline',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.getByRole('button',{name:'Ajustes',exact:true}).click();
 await page.evaluate(async()=>{const{GameAudio}=await import('/audio.js');window.testAudio=new GameAudio({musicVolume:1,effectsVolume:1});await window.testAudio.unlock();window.testAudio.setScene('game');const a=window.testAudio.context.createAnalyser();a.fftSize=2048;window.testAudio.master.connect(a);window.audioAnalyser=a;});
 await expect.poll(()=>page.evaluate(()=>{const values=new Float32Array(2048);window.audioAnalyser.getFloatTimeDomainData(values);return Math.max(...values.map(Math.abs))})).toBeGreaterThan(.0001);
 expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(true);
 await page.evaluate(()=>window.testAudio.setPaused(true));expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(false);
 await page.evaluate(()=>window.testAudio.setPaused(false));expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(true);
 await page.evaluate(()=>window.testAudio.setHidden(true));expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(false);
 await page.evaluate(async()=>{window.testAudio.setHidden(false);await window.testAudio.unlock()});expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(true);
 await page.evaluate(()=>window.testAudio.configure({sound:false}));expect(await page.evaluate(()=>window.testAudio.getState().musicPlaying)).toBe(false);
 await page.evaluate(()=>window.testAudio.configure({sound:true,music:false}));
 const types=['click','error','countdown','start','bonus','victory','champion','pause','warning','tie','correct'];
 await page.evaluate(types=>types.forEach(t=>window.testAudio.effect(t)),types);expect(await page.evaluate(()=>window.testAudio.getState().voices)).toBeGreaterThan(0);
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);
 expect(await page.evaluate(async()=>{const{GameAudio}=await import('/audio.js');const a=new GameAudio();a.destroy();return typeof GameAudio})).toBe('function');
 await context.setOffline(false);expect(errors).toEqual([]);
});

test('three competition themes produce audio and shuffle without consecutive repeats',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Ajustes',exact:true}).click();
 const ids=await page.evaluate(async()=>{const{GameAudio,COMPETITION_TRACKS}=await import('/audio.js');window.competitionAudio=new GameAudio({musicVolume:1});await window.competitionAudio.unlock();return COMPETITION_TRACKS});
 expect(ids).toHaveLength(3);expect(new Set(ids).size).toBe(3);
 for(const id of ids){
  await page.evaluate(id=>{window.competitionAudio.setScene(id);window.competitionAudio.effect('start')},id);
  expect(await page.evaluate(()=>window.competitionAudio.getState().musicPlaying)).toBe(true);
  expect(await page.evaluate(()=>window.competitionAudio.getState().bpm)).toBeGreaterThanOrEqual(136);
  expect(await page.evaluate(()=>window.competitionAudio.getState().voices)).toBeGreaterThan(0);
 }
 const transitions=await page.evaluate(()=>{const a=window.competitionAudio,selected=[];for(let i=0;i<40;i++){a.setScene('game');selected.push(a.scene)}const before=a.scene;a.step=128;a.nextTime=a.context.currentTime+.01;a.schedule();return {selected,before,after:a.scene}});
 for(let i=0;i<transitions.selected.length;i++){expect(ids).toContain(transitions.selected[i]);if(i)expect(transitions.selected[i]).not.toBe(transitions.selected[i-1])}
 expect(ids).toContain(transitions.after);expect(transitions.after).not.toBe(transitions.before);
 await page.evaluate(()=>window.competitionAudio.destroy());
});

test('competition percussion runs with bounded voices and music ducks for cues',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('button',{name:'Ajustes',exact:true}).click();
 await page.evaluate(async()=>{const{GameAudio}=await import('/audio.js');const a=new GameAudio({musicVolume:1});window.energy=a;await a.unlock();a.setScene('game');let hits=0;const original=a.percussion.bind(a);a.percussion=(...args)=>{hits++;return original(...args)};a.stopMusic();a.nextTime=a.context.currentTime+.02;a.step=0;for(let i=0;i<6;i++){a.schedule();a.nextTime=a.context.currentTime+.02}window.percussionHits=hits;a.effect('correct')});
 expect(await page.evaluate(()=>window.percussionHits)).toBeGreaterThan(5);
 await expect.poll(()=>page.evaluate(()=>window.energy.musicBus.gain.value)).toBeLessThan(.2);
 expect(await page.evaluate(()=>window.energy.getState().voices)).toBeLessThanOrEqual(91);
 await page.evaluate(()=>window.energy.destroy());expect(errors).toEqual([]);
});
