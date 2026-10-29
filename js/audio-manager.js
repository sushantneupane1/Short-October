class AudioManager{
  constructor(){this.tracks={music:null,ambience:null};this.volumes={music:.2,ambience:.2,sfx:.55};this.musicIntensity=1;this.muted=false;this.started=false;this.paused=false;this.effects=new Set()}
  start(){this.started=true;this.initKeys()}
  initKeys(){
    if(this.ctx)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      this.ctx=new AC();
      const len=Math.floor(this.ctx.sampleRate*0.04),buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);
      this.noiseBuf=buf;
    }catch(e){console.warn('Key sound unavailable:',e)}
  }
  // one half of a keystroke: a short filtered click plus a soft low "thock"
  // smooth, soft key: low-passed noise "tap" with a gentle rounded thump underneath
  _tick(t,{freq,level,thock=0,thockFreq=140,decay=0.09,attack=0.006}){
    const ctx=this.ctx;
    const src=ctx.createBufferSource();src.buffer=this.noiseBuf;src.playbackRate.value=0.7+Math.random()*0.15;
    const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=freq;bp.Q.value=0.5;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
    const g=ctx.createGain();
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(level,t+attack);g.gain.exponentialRampToValueAtTime(0.0001,t+decay);
    src.connect(bp);bp.connect(lp);lp.connect(g);g.connect(ctx.destination);src.start(t);
    if(thock>0){
      const o=ctx.createOscillator(),og=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(thockFreq,t);o.frequency.exponentialRampToValueAtTime(thockFreq*0.7,t+0.1);
      og.gain.setValueAtTime(0.0001,t);og.gain.linearRampToValueAtTime(level*thock,t+attack+0.004);og.gain.exponentialRampToValueAtTime(0.0001,t+0.13);
      o.connect(og);og.connect(ctx.destination);o.start(t);o.stop(t+0.15);
    }
  }
  playKey(ch){
    if(this.muted||this.paused||!this.ctx)return;
    const ctx=this.ctx;if(ctx.state==='suspended')ctx.resume();
    const vol=this.volumes.sfx*0.1;if(vol<=0)return;   // minimal, background-level
    const t=ctx.currentTime,big=(ch===' '||ch==='\n');
    const code=ch.charCodeAt(0)||0,tone=1+((code%5)-2)*0.03;
    const level=vol*(0.8+Math.random()*0.2);
    // one tiny, soft tap per key (no release sound)
    this._tick(t,{freq:(big?1000:1500)*tone,level,thock:big?0.6:0.35,thockFreq:(big?100:135)*tone,decay:0.045,attack:0.004});
  }
  async playTrack(channel,path,{loop=true,fade=1}={}){
    if(!path)return;
    try{
      let audio=this.tracks[channel];
      if(audio && audio.dataset.path===path){if(audio.paused){audio.volume=this.muted?0:this.volumes[channel];await audio.play()}return}
      const old=audio; audio=new Audio(path);audio.dataset.path=path;audio.loop=loop;audio.volume=0;this.tracks[channel]=audio;
      await audio.play(); this.fadeAudio(audio,this.muted?0:this.volumes[channel]*(channel==="music"?this.musicIntensity:1),fade);
      if(old){this.fadeAudio(old,0,fade,()=>{old.pause();old.src=""})}
    }catch(e){console.warn("Audio unavailable; continuing without it:",path,e)}
  }
  playSfx(path){if(!path)return;try{const a=new Audio(path);a.volume=this.muted?0:this.volumes.sfx;this.effects.add(a);a.addEventListener("ended",()=>this.effects.delete(a),{once:true});if(this.paused){a.pause();return}a.play().catch(e=>console.warn("SFX unavailable:",path,e))}catch(e){console.warn(e)}}
  pause(){if(this.paused)return;this.paused=true;Object.values(this.tracks).forEach(a=>a?.pause());this.effects.forEach(a=>a.pause());if(this.ctx?.state==="running")this.ctx.suspend()}
  resume(){if(!this.paused)return;this.paused=false;Object.keys(this.tracks).forEach(k=>{const a=this.tracks[k];if(a){a.volume=this.muted?0:this.volumes[k]*(k==="music"?this.musicIntensity:1);a.play().catch(e=>console.warn("Audio resume unavailable:",e))}});this.effects.forEach(a=>a.play().catch(e=>console.warn("SFX resume unavailable:",e)));if(this.ctx?.state==="suspended")this.ctx.resume()}
  fadeAudio(audio,target,duration=1,done){if(!audio)return;const start=audio.volume,begin=performance.now(),ms=Math.max(10,duration*1000);const tick=now=>{const t=Math.min(1,(now-begin)/ms);audio.volume=Math.max(0,Math.min(1,start+(target-start)*t));if(t<1)requestAnimationFrame(tick);else if(done)done()};requestAnimationFrame(tick)}
  setVolume(channel,value){this.volumes[channel]=value;const a=this.tracks[channel];if(a)a.volume=this.muted?0:value*(channel==="music"?this.musicIntensity:1)}
  setMusicIntensity(value,duration=1.4){this.musicIntensity=Math.max(0,Math.min(1,Number(value)||0));const a=this.tracks.music;if(a&&!this.muted&&!this.paused)this.fadeAudio(a,this.volumes.music*this.musicIntensity,duration)}
  setMute(value){this.muted=value;Object.keys(this.tracks).forEach(k=>{if(this.tracks[k])this.tracks[k].volume=value?0:this.volumes[k]*(k==="music"?this.musicIntensity:1)})}
  stopAll(fade=.6){Object.values(this.tracks).forEach(a=>{if(a){this.fadeAudio(a,0,fade,()=>{a.pause();a.currentTime=0})}})}
}
window.audioManager=new AudioManager();


