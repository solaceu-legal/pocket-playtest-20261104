(()=>{'use strict';
const MUSIC={play:'assets/audio/dance-play.mp3',won:'assets/audio/dance-clear-loop.mp3',lost:'assets/audio/dance-retry-loop.mp3'};
const EFFECTS={tap:'assets/audio/tap.mp3',match:'assets/audio/match.mp3',error:'assets/audio/error.mp3',start:'assets/audio/start.mp3',hint:'assets/audio/hint.mp3',shuffle:'assets/audio/shuffle.mp3',undo:'assets/audio/undo.mp3',warning:'assets/audio/warning.mp3',blocked:'assets/audio/blocked.mp3',saved:'assets/audio/saved.mp3',abandon:'assets/audio/abandon.mp3',win:'assets/audio/clear-jingle.mp3',complete:'assets/audio/complete-jingle.mp3',lose:'assets/audio/failure-jingle.mp3'};
const DEFAULTS={musicEnabled:true,effectsEnabled:true,musicVolume:.28,effectsVolume:.65};
function normalize(settings={}){const result={...DEFAULTS};for(const k of ['musicEnabled','effectsEnabled'])if(typeof settings[k]==='boolean')result[k]=settings[k];for(const k of ['musicVolume','effectsVolume'])if(Number.isFinite(settings[k]))result[k]=Math.max(0,Math.min(1,settings[k]));return result;}
class Soundscape{
 constructor({settings,onChange,onStatus}={}){
  this.settings=normalize(settings);this.onChange=onChange||(()=>{});this.onStatus=onStatus||(()=>{});
  this.context=null;this.master=null;this.musicBus=null;this.effectsBus=null;this.buffers=new Map();this.loading=new Map();this.effects=new Set();this.lastPlayed={};
  this.unlocked=false;this.visible=!document.hidden;this.scene='home';this.state='playing';this.modal=false;this.music=null;this.request=0;this.effectsRequest=0;this.duckUntil=0;this.duckAmount=.58;this.matchChain=0;this.lastMatch=-Infinity;this.mixTimer=null;this.error=null;this.loadingTrack=null;
 }
 getSettings(){return {...this.settings};}
 emit(){this.onStatus(this.status());}
 status(){return {unlocked:this.unlocked,supported:!this.unsupported,playing:!!this.music&&this.visible&&this.settings.musicEnabled&&this.settings.musicVolume>0&&this.context?.state==='running',track:this.music?.key||null,loading:!!this.loadingTrack,error:this.error};}
 async unlock(){
  if(this.unsupported)return false;
  if(!this.context){
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context){this.unsupported=true;this.emit();return false;}
   try{this.context=new Context();this.master=this.context.createGain();this.master.gain.value=.75;if(this.context.createDynamicsCompressor){this.limiter=this.context.createDynamicsCompressor();this.limiter.threshold.value=-4;this.limiter.knee.value=3;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.09;this.master.connect(this.limiter);this.limiter.connect(this.context.destination);}else this.master.connect(this.context.destination);this.musicBus=this.context.createGain();this.musicBus.gain.value=0;this.musicBus.connect(this.master);this.effectsBus=this.context.createGain();this.effectsBus.gain.value=this.settings.effectsVolume;this.effectsBus.connect(this.master);}
   catch{this.unsupported=true;this.emit();return false;}
  }
  if(!this.visible)return false;
  try{if(this.context.state!=='running')await this.context.resume();this.unlocked=this.context.state==='running';this.error=null;this.emit();this.syncMusic();return this.unlocked;}
  catch{this.unlocked=false;this.error='blocked';this.emit();return false;}
 }
 ramp(node,value,seconds=.15){if(!node||!this.context)return;const p=node.gain,t=this.context.currentTime;p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(value,t+seconds);}
 async load(src){
  if(this.buffers.has(src))return this.buffers.get(src);
  if(this.loading.has(src))return this.loading.get(src);
  const task=(async()=>{
   let bytes;
   if(src.startsWith('data:')){const raw=atob(src.slice(src.indexOf(',')+1)),values=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)values[i]=raw.charCodeAt(i);bytes=values.buffer;}
   else{const response=await fetch(src);if(!response.ok)throw Error('Audio unavailable');bytes=await response.arrayBuffer();}
   const buffer=await this.context.decodeAudioData(bytes);this.buffers.set(src,buffer);return buffer;
  })();
  this.loading.set(src,task);try{return await task;}finally{this.loading.delete(src);}
 }
 targetKey(){return this.state==='won'?'won':this.state==='lost'?'lost':'play';}
 async syncMusic(){
  if(!this.context||!this.unlocked||!this.visible)return;
  if(!this.settings.musicEnabled||this.settings.musicVolume===0){this.request++;this.loadingTrack=null;this.stopMusic();return;}
  const key=this.targetKey();
  if(this.music?.key===key){this.applyMix();return;}
  if(this.loadingTrack===key)return;
  const request=++this.request;this.loadingTrack=key;this.stopMusic();this.emit();
  try{
   const buffer=await this.load(MUSIC[key]);
   if(request!==this.request||!this.visible||!this.settings.musicEnabled||this.settings.musicVolume===0||this.targetKey()!==key)return;
   const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.musicBus);source.start();this.music={source,gain,key};this.ramp(gain,1,.35);this.error=null;this.applyMix();
  }catch{if(request===this.request)this.error='asset';}
  finally{if(request===this.request){this.loadingTrack=null;this.emit();}}
 }
 stopMusic(){if(!this.music)return;const previous=this.music;this.music=null;this.ramp(previous.gain,0,.18);try{previous.source.stop(this.context.currentTime+.2);}catch{}previous.source.onended=()=>{previous.source.disconnect();previous.gain.disconnect();};this.emit();}
 applyMix(){if(!this.context)return;const duck=this.context.currentTime < this.duckUntil ? this.duckAmount : 1,modal=this.modal ? .52 : 1,home=this.scene==='home' ? .72 : 1;this.ramp(this.musicBus,this.settings.musicEnabled?this.settings.musicVolume*duck*modal*home:0,.2);this.ramp(this.effectsBus,this.settings.effectsEnabled?this.settings.effectsVolume:0,.05);}
 duck(duration,amount=.58){if(!this.context)return;this.duckAmount=this.context.currentTime<this.duckUntil?Math.min(this.duckAmount,amount):amount;this.duckUntil=Math.max(this.duckUntil,this.context.currentTime+duration);this.applyMix();clearTimeout(this.mixTimer);this.mixTimer=setTimeout(()=>this.applyMix(),Math.max(0,(this.duckUntil-this.context.currentTime)*1000)+35);}
 setScene(scene,state='playing'){if(this.state!==state){this.effectsRequest++;this.stopEffects();this.duckUntil=0;clearTimeout(this.mixTimer);}this.scene=scene;this.state=state;this.syncMusic();this.applyMix();}
 setModal(open){this.modal=open;if(!open&&this.previewing){this.effectsRequest++;this.stopEffects();this.previewing=false;this.duckUntil=0;clearTimeout(this.mixTimer);}this.applyMix();}
 preview(type){this.effectsRequest++;this.stopEffects();this.duckUntil=0;clearTimeout(this.mixTimer);this.previewing=true;this.play(type);}
 async setVisible(visible){this.visible=visible;if(!this.context)return;try{if(!visible){this.request++;this.loadingTrack=null;this.effectsRequest++;this.stopEffects();clearTimeout(this.mixTimer);await this.context.suspend();}else if(this.unlocked){await this.context.resume();if(this.duckUntil>this.context.currentTime)this.duck(this.duckUntil-this.context.currentTime,this.duckAmount);else this.applyMix();this.syncMusic();}}catch{}this.emit();}
 update(change){const before=this.settings;this.settings=normalize({...this.settings,...change});if(!this.settings.effectsEnabled||this.settings.effectsVolume===0){this.effectsRequest++;this.stopEffects();}if(before.musicEnabled&&!this.settings.musicEnabled){this.request++;this.loadingTrack=null;this.stopMusic();}this.applyMix();this.syncMusic();this.onChange(this.getSettings());this.emit();}
 stopEffects(){for(const source of this.effects){try{source.stop();}catch{}}this.effects.clear();}
 async play(type='tap'){
  if(!EFFECTS[type]||!this.visible||!this.settings.effectsEnabled||this.settings.effectsVolume===0)return;
  const now=performance.now(),gap=type==='tap'?55:type==='warning'?1200:90;
  if(now-(this.lastPlayed[type]??-Infinity)<gap)return;this.lastPlayed[type]=now;
  if(type==='match'){this.matchChain=now-this.lastMatch<4500?Math.min(this.matchChain+1,4):0;this.lastMatch=now;}
  else if(['error','start','win','complete','lose','abandon','shuffle'].includes(type)){this.matchChain=0;this.lastMatch=-Infinity;}
  const playbackRate=type==='match'?2**([0,2,4,7,9][this.matchChain]/12):1;
  const request=['win','complete','lose','abandon'].includes(type)?++this.effectsRequest:this.effectsRequest;
  if(!this.unlocked&&!await this.unlock())return;
  try{
   const buffer=await this.load(EFFECTS[type]);
   if(request!==this.effectsRequest||!this.visible||!this.settings.effectsEnabled||this.settings.effectsVolume===0)return;
   if(['win','complete','lose','abandon'].includes(type)){this.stopEffects();this.duck(Math.min(buffer.duration+.2,9),.23);}
   else if(['match','saved','error','warning','blocked'].includes(type))this.duck(Math.min(buffer.duration+.12,1.2));
   if(this.effects.size>=8){const oldest=this.effects.values().next().value;try{oldest.stop();}catch{}this.effects.delete(oldest);}
   const source=this.context.createBufferSource();source.buffer=buffer;if(source.playbackRate)source.playbackRate.value=playbackRate;source.connect(this.effectsBus);this.effects.add(source);source.onended=()=>{this.effects.delete(source);source.disconnect();};source.start();
  }catch{this.fallback(type);}
 }
 fallback(type){
  if(!this.context||!this.visible||!this.settings.effectsEnabled)return;
  const notes=({tap:[520],match:[659,880],error:[260,220],win:[523,659,784,1046],complete:[523,659,784,1046],lose:[392,330,262],abandon:[392,330],warning:[440,440],blocked:[330,294],start:[392,523],hint:[784,1046],shuffle:[440,554],undo:[554,440],saved:[659,784]})[type]||[520];
  notes.forEach((f,i)=>{const o=this.context.createOscillator(),g=this.context.createGain(),t=this.context.currentTime+i*.09;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(this.effectsBus);this.effects.add(o);o.onended=()=>{this.effects.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+.22);});
 }
 destroy(){this.request++;this.effectsRequest++;clearTimeout(this.mixTimer);this.stopEffects();this.stopMusic();if(this.context)this.context.close().catch(()=>{});}
}
window.PocketSound={create:options=>new Soundscape(options),MUSIC,EFFECTS,DEFAULTS};
})();
