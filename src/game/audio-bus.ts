export type AudioChannel='MASTER'|'UI'|'RADIO'|'CALLS'|'VEHICLES'|'ALARMS'|'MUSIC';
export type AudioSettings=Record<AudioChannel,number>;
const KEY='ad-audio-settings-v1';
const defaults:AudioSettings={MASTER:1,UI:.8,RADIO:.9,CALLS:1,VEHICLES:.7,ALARMS:.85,MUSIC:.35};
let settings:AudioSettings={...defaults};
try{const saved=JSON.parse(localStorage.getItem(KEY)??'null');if(saved&&typeof saved==='object')settings={...defaults,...saved}}catch{}
export function getAudioSettings(){return {...settings}}
export function setAudioChannel(channel:AudioChannel,value:number){settings[channel]=Math.max(0,Math.min(1,value));try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{}}
export function channelGain(channel:AudioChannel){return settings.MASTER*settings[channel]}
