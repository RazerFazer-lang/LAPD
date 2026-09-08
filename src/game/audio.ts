let ctx: AudioContext | null = null;
let ambientTimer: number | null = null;
let ambientEnabled = false;

function audioContext(){
  if(!ctx) ctx = new AudioContext();
  if(ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(frequency:number, duration:number, type:OscillatorType='sine', gain=0.035){
  const c=audioContext();
  const now=c.currentTime;
  const osc=c.createOscillator();
  const amp=c.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(frequency,now);
  amp.gain.setValueAtTime(0.0001,now);
  amp.gain.exponentialRampToValueAtTime(gain,now+0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001,now+duration);
  osc.connect(amp).connect(c.destination);
  osc.start(now); osc.stop(now+duration+0.03);
}

export function playRadioPing(){
  tone(880,0.08,'square',0.025);
  window.setTimeout(()=>tone(660,0.11,'square',0.018),90);
}

export function playDispatchAlert(){
  tone(740,0.12,'triangle',0.035);
  window.setTimeout(()=>tone(980,0.18,'triangle',0.035),140);
}

export function playSiren(){
  const c=audioContext();
  const now=c.currentTime;
  const osc=c.createOscillator();
  const amp=c.createGain();
  osc.type='sawtooth';
  osc.frequency.setValueAtTime(520,now);
  osc.frequency.linearRampToValueAtTime(880,now+0.42);
  osc.frequency.linearRampToValueAtTime(520,now+0.84);
  amp.gain.setValueAtTime(0.0001,now);
  amp.gain.exponentialRampToValueAtTime(0.045,now+0.04);
  amp.gain.exponentialRampToValueAtTime(0.0001,now+0.9);
  osc.connect(amp).connect(c.destination);
  osc.start(now); osc.stop(now+0.95);
}

export function toggleAmbient(){
  ambientEnabled=!ambientEnabled;
  if(!ambientEnabled){
    if(ambientTimer!==null) window.clearInterval(ambientTimer);
    ambientTimer=null;
    return false;
  }
  const playAmbient=()=>{
    const c=audioContext();
    const now=c.currentTime;
    const osc=c.createOscillator();
    const gain=c.createGain();
    const filter=c.createBiquadFilter();
    osc.type='brown';
    osc.frequency.value=55;
    filter.type='lowpass'; filter.frequency.value=180;
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(0.006,now+0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+2.4);
    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start(now); osc.stop(now+2.5);
  };
  playAmbient();
  ambientTimer=window.setInterval(playAmbient,2200);
  return true;
}

export function isAmbientEnabled(){ return ambientEnabled; }
