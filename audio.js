// Original procedural music and sound effects. All synthesis happens locally.
const clamp=(value,fallback)=>Number.isFinite(+value)?Math.max(0,Math.min(1,+value)):fallback;
const frequency=midi=>440*2**((midi-69)/12);
export const TRACKS={
 menu:{bpm:106,chords:[[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,61]],melody:[74,null,78,81,78,null,76,null,74,null,71,74,78,null,74,null,71,null,74,78,79,null,78,74,73,null,76,81,79,76,73,null]},
 'game-neon':{name:'Corrida Neon',bpm:140,chords:[[52,59,64,67],[48,55,60,64],[43,50,55,59],[50,57,62,66]],melody:[76,null,79,83,81,79,76,null,79,null,76,72,76,79,84,null,74,null,79,83,86,83,79,null,78,null,81,86,83,81,78,null]},
 'game-orbit':{name:'Órbita das Ideias',bpm:136,chords:[[57,64,69,72],[53,60,65,69],[48,55,60,64],[55,62,67,71]],melody:[81,84,null,88,86,84,null,81,81,77,null,81,84,89,88,null,84,79,null,76,79,84,88,null,83,86,null,91,86,83,79,null]},
 'game-sprint':{name:'Sprint do Futuro',bpm:148,chords:[[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,64]],melody:[74,77,81,null,86,81,77,null,82,77,74,70,74,null,77,null,81,84,89,null,84,81,77,null,79,84,88,84,79,76,72,null]},
 result:{bpm:106,chords:[[50,57,62,66],[43,50,55,59],[45,52,57,61],[50,57,62,66]],melody:[78,null,81,null,86,null,81,null,79,null,78,74,71,null,74,null,76,null,81,null,85,null,81,null,86,null,81,78,74,null,null,null]}
};
export const COMPETITION_TRACKS=['game-neon','game-orbit','game-sprint'];

export class GameAudio {
 constructor(options={}){
  this.context=null;this.unlocked=false;this.hidden=false;this.paused=false;this.scene='menu';
  this.timer=null;this.step=0;this.nextTime=0;this.voices=new Set();this.lastEffects=new Map();
  this.configure(options);
 }
 configure(options){
  this.options={sound:true,music:true,effects:true,musicVolume:.35,effectsVolume:.65,...this.options,...options};
  this.options.musicVolume=clamp(this.options.musicVolume,.35);this.options.effectsVolume=clamp(this.options.effectsVolume,.65);
  if(this.context){const t=this.context.currentTime;this.master.gain.setTargetAtTime(this.options.sound?1:0,t,.025);this.musicBus.gain.cancelScheduledValues(t);this.musicBus.gain.setTargetAtTime(this.options.musicVolume*.28,t,.04);this.effectsBus.gain.setTargetAtTime(this.options.effects?this.options.effectsVolume*.45:0,t,.025)}
  this.sync();
 }
 async unlock(){
  try{
   if(!this.context){
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
    this.context=new Audio();this.master=this.context.createGain();this.musicBus=this.context.createGain();this.effectsBus=this.context.createGain();
    const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=18;limiter.ratio.value=5;
    this.musicBus.connect(this.master);this.effectsBus.connect(this.master);this.master.connect(limiter);limiter.connect(this.context.destination);
    this.master.gain.value=this.options.sound?1:0;this.musicBus.gain.value=this.options.musicVolume*.28;this.effectsBus.gain.value=this.options.effects?this.options.effectsVolume*.45:0;
   }
   if(this.hidden)return false;
   await this.context.resume();this.unlocked=this.context.state==='running';this.sync();return this.unlocked;
  }catch{return false}
 }
 chooseCompetition(){const pool=COMPETITION_TRACKS.filter(id=>id!==this.lastCompetition);const random=new Uint32Array(1);const value=globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(random)[0]/4294967296:Math.random();this.lastCompetition=pool[Math.floor(value*pool.length)];return this.lastCompetition}
 setScene(scene){const next=scene==='game'?this.chooseCompetition():TRACKS[scene]?scene:'menu';if(next===this.scene)return;this.stopMusic();this.scene=next;this.step=0;this.sync()}
 setPaused(paused){this.paused=!!paused;this.sync();if(paused)this.stopVoices('effect')}
 setHidden(hidden){this.hidden=!!hidden;this.sync();if(hidden){this.stopVoices();this.context?.suspend().catch(()=>{})}else if(this.unlocked)this.unlock()}
 sync(){
  const enabled=this.context&&this.unlocked&&!this.hidden&&!this.paused&&this.options.sound&&this.options.music&&this.options.musicVolume>0;
  if(!enabled){this.stopMusic();return}
  if(this.timer!==null)return;
  this.nextTime=this.context.currentTime+.06;this.schedule();this.timer=setInterval(()=>this.schedule(),35);
 }
 stopVoices(kind){for(const voice of [...this.voices]){if(kind&&voice.kind!==kind)continue;try{voice.gain.gain.cancelScheduledValues(this.context.currentTime);voice.gain.gain.setTargetAtTime(0,this.context.currentTime,.015);voice.osc.stop(this.context.currentTime+.07)}catch{}this.voices.delete(voice)}}
 stopMusic(){if(this.timer!==null)clearInterval(this.timer);this.timer=null;this.stopVoices('music')}
 note(midi,time,duration,volume,type='sine',kind='music',slide){
  if(!this.context||this.voices.size>90)return;
  const osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency(midi),time);
  if(slide!==undefined)osc.frequency.exponentialRampToValueAtTime(frequency(slide),time+duration);
  gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),time+.012);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  let filter;
  if(type==='sawtooth'){filter=this.context.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(2200,time);filter.frequency.exponentialRampToValueAtTime(650,time+duration);filter.Q.value=.7;osc.connect(filter);filter.connect(gain)}else osc.connect(gain);
  gain.connect(kind==='music'?this.musicBus:this.effectsBus);
  const voice={osc,gain,kind};this.voices.add(voice);osc.onended=()=>{this.voices.delete(voice);osc.disconnect();filter?.disconnect();gain.disconnect()};osc.start(time);osc.stop(time+duration+.025);
 }
 percussion(time,type,accent=1){
  if(!this.context||this.voices.size>90)return;
  if(!this.noise){this.noise=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*.4),this.context.sampleRate);const data=this.noise.getChannelData(0);let seed=137;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1}}
  const osc=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();osc.buffer=this.noise;
  const hat=type==='hat',duration=hat?.045:.15;filter.type='highpass';filter.frequency.value=hat?7500:1500;
  gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime((hat?.1:.23)*accent,time+.003);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  osc.connect(filter);filter.connect(gain);gain.connect(this.musicBus);
  const voice={osc,gain,kind:'music'};this.voices.add(voice);osc.onended=()=>{this.voices.delete(voice);osc.disconnect();filter.disconnect();gain.disconnect()};osc.start(time);osc.stop(time+duration+.01);
 }
 schedule(){
  if(!this.context||this.context.state!=='running')return;
  // Schedule only a short look-ahead, so pause/mute never leaves a long queue.
  if(this.nextTime<this.context.currentTime-.2)this.nextTime=this.context.currentTime+.03;
  while(this.nextTime<this.context.currentTime+.16){
   // Two eight-bar loops, then cross into another competition theme on the beat.
   if(this.scene.startsWith('game-')&&this.step>=128){this.scene=this.chooseCompetition();this.step=0}
   const track=TRACKS[this.scene],beat=60/track.bpm;
   const step=this.step%64,chord=track.chords[Math.floor(step/16)],time=this.nextTime;
   const competition=this.scene.startsWith('game-');
   if(competition){
    // Driving dance beat: quarter-note kick, backbeat snare and eighth-note hats.
    if(step%2===0)this.note(55,time,.22,.5,'sine','music',26);
    if(step%8===2||step%8===6){this.percussion(time,'snare');this.note(50,time,.1,.12,'triangle','music',40)}
    this.percussion(time,'hat',step%2===1?1:.6);
    if(step%16===15)this.percussion(time+beat/4,'hat',.75);
    // Offbeat bass and short bright chord stabs create motion without covering cues.
    if(step%2===1){this.note(chord[0]-12,time,beat*.36,.34,'sawtooth');this.note(chord[0]-12,time,beat*.4,.22,'sine')}
    if(step%4===1)chord.slice(1).forEach((m,i)=>this.note(m,time+i*.008,beat*.27,.075,'sawtooth'));
    const melody=track.melody[Math.floor(step/2)];if(step%2===0&&melody!==null)this.note(melody,time,beat*.42,.2,'triangle');
    const arpeggio=chord[1+(step%3)]+12;this.note(arpeggio,time,beat*.19,.085,'triangle');
    if(this.scene==='game-sprint'&&step%2===1)this.note(chord[2]+12,time+beat/4,beat*.13,.075,'triangle');
    if(this.scene==='game-orbit'&&step%8===7)this.note(chord[1]+12,time,beat*.38,.09,'sine');
    if(step%32>=28&&step%2===1)this.percussion(time+beat/4,'snare',.4);
   }else{
    if(step%8===0)chord.slice(1).forEach((m,i)=>this.note(m,time+i*.012,beat*3.4,.09,'sine'));
    if(step%4===0)this.note(chord[0]-12,time,beat*.8,.26,'triangle');
    const melody=track.melody[Math.floor(step/2)];if(step%2===0&&melody!==null)this.note(melody,time,beat*.65,.15,'sine');
   }
   this.step++;this.nextTime+=beat/2;
  }
 }
 effect(name='correct'){
  if(!this.context||!this.unlocked||this.hidden||!this.options.sound||!this.options.effects||this.options.effectsVolume<=0)return;
  const now=this.context.currentTime;
  if(now-(this.lastEffects.get(name)??-100)<.065)return;this.lastEffects.set(name,now);
  // Give gameplay cues a brief foreground window, then restore the chosen volume.
  const musicLevel=this.options.musicVolume*.28,duck=this.musicBus.gain;
  duck.cancelScheduledValues(now);duck.setValueAtTime(duck.value,now);duck.linearRampToValueAtTime(musicLevel*.5,now+.025);duck.setTargetAtTime(musicLevel,now+(name==='victory'||name==='champion'?1.4:.25),.12);
  const play=(m,delay,len=.14,vol=.32,type='sine',slide)=>this.note(m,now+.012+delay,len,vol,type,'effect',slide);
  if(name==='click')play(79,0,.065,.12);
  else if(name==='error'){play(52,0,.18,.2,'triangle',45);play(45,.12,.2,.16,'triangle')}
  else if(name==='countdown')play(76,0,.13,.24,'triangle');
  else if(name==='start'){[74,78,81,86].forEach((n,i)=>play(n,i*.07,.25,.3))}
  else if(name==='bonus'){[79,83,86,91].forEach((n,i)=>play(n,i*.065,.26,.26))}
  else if(name==='victory'){[74,78,81,86,81,86,90].forEach((n,i)=>play(n,i*.13,.42,.28));[62,66,69].forEach(n=>play(n,.78,.7,.15))}
  else if(name==='champion'){[74,78,81,86,90,93,98].forEach((n,i)=>play(n,i*.12,.5,.25));[62,66,69,74].forEach(n=>play(n,.75,1.2,.15))}
  else if(name==='pause'){play(74,0,.12,.18);play(69,.1,.18,.16)}
  else if(name==='warning')play(81,0,.08,.15,'triangle');
  else if(name==='tie'){[69,74,78].forEach((n,i)=>play(n,i*.12,.24,.25))}
  else{play(79,0,.14,.26);play(86,.08,.22,.26)}
 }
 getState(){return {unlocked:this.unlocked,context:this.context?.state??'uninitialized',scene:this.scene,trackName:TRACKS[this.scene]?.name??this.scene,bpm:TRACKS[this.scene]?.bpm,paused:this.paused,hidden:this.hidden,musicPlaying:this.timer!==null,voices:this.voices.size,options:{...this.options}}}
 destroy(){this.stopMusic();this.stopVoices();this.context?.close().catch(()=>{});this.unlocked=false;this.context=null}
}
