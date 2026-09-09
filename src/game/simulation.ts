import type { GameState, Incident, Service, UnitStatus, Weather } from './state';
import { CITIES, DIFFICULTY, INCIDENT_CATALOG, WEATHER_RULES, type Difficulty } from './catalog';

export interface SimulationMetrics { responseScore:number; dispatchScore:number; resolutionScore:number; unitCoverage:number; callLoad:number; reputationDelta:number; }
const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n));
const weightedRandom=<T>(items:T[],weights:number[],rng:()=>number=Math.random)=>{const total=weights.reduce((a,b)=>a+b,0);let p=rng()*total;for(let i=0;i<items.length;i++){p-=weights[i];if(p<=0)return items[i]}return items[items.length-1]};

export function advanceWorld(state:GameState,minutes:number,difficulty:Difficulty='NORMAL'):GameState{
 const next=structuredClone(state); const d=DIFFICULTY[difficulty];
 next.simulationMinutes+=minutes; next.serverTime=Date.now();
 const absolute=Math.floor(next.simulationMinutes); next.world.day=Math.floor(absolute/(24*60))+1; next.world.hour=Math.floor((absolute%(24*60))/60); next.world.minute=absolute%60;
 const hour=next.world.hour; const night=hour<6||hour>=22; next.world.nightFactor=night?1:hour<8||hour>=19?.35:0;
 next.world.traffic=clamp(next.world.traffic+(hour>=7&&hour<=9?9:hour>=15&&hour<=18?12:night?-8:-2),0,100)*d.traffic; next.world.traffic=clamp(next.world.traffic,0,100);
 next.world.eventRate=d.eventRate*weatherEventFactor(next.world.weather)*(night?1.12:1);
 for(const road of next.roads?.edges??[])road.traffic=clamp(next.world.traffic+(road.id.charCodeAt(1)%11-5),0,100);
 for(const u of next.units){
  if(u.status==='MAINTENANCE'){u.maintenance=clamp(u.maintenance+minutes*.15);continue;}
  if(u.status==='EN_ROUTE'&&u.target){const speed=Math.max(.1,u.speed)/weatherTrafficFactor(next.world.weather);const step=speed*minutes/5;const dx=u.target.x-u.position.x,dy=u.target.y-u.position.y;const distance=Math.hypot(dx,dy);if(distance<=step){u.position={...u.target};u.status='ON_SCENE';u.routeIndex=0}else if(distance>0){u.position.x+=dx/distance*step;u.position.y+=dy/distance*step;u.heading=Math.atan2(dy,dx)}}
  if(u.status==='RETURNING'&&u.target){const dx=u.target.x-u.position.x,dy=u.target.y-u.position.y;const distance=Math.hypot(dx,dy);const step=u.speed*minutes/5;if(distance<=step){u.position={...u.target};u.status='AVAILABLE';u.target=undefined;u.route=undefined}else if(distance>0){u.position.x+=dx/distance*step;u.position.y+=dy/distance*step}}
  if(u.status!=='AVAILABLE'){u.fuel=clamp(u.fuel-minutes*.02);u.maintenance=clamp(u.maintenance-minutes*.025)}
  if(u.fuel<12||u.maintenance<15)u.status='OUT_OF_SERVICE';
 }
 for(const i of next.incidents){
  if(['COMPLETE','CANCELLED'].includes(i.status))continue; i.ageMinutes+=minutes;
  if(i.stageIndex<i.stages.length-1){const threshold=4+i.priority*2;if(i.ageMinutes>threshold*(i.stageIndex+1)){i.stageIndex++;i.summary=i.stages[i.stageIndex];i.danger=clamp(i.danger+i.escalation*.04)}}
  if(i.status==='RESPONDING'&&i.unitIds.some(id=>next.units.find(u=>u.id===id)?.status==='ON_SCENE'))i.status='ON_SCENE';
  if(i.status==='ON_SCENE'&&i.ageMinutes>8+i.priority*2)i.status='ACTIVE';
  if(i.status==='ACTIVE'&&i.stageIndex>=i.stages.length-1&&i.unitIds.every(id=>['ON_SCENE','RETURNING','AVAILABLE','OUT_OF_SERVICE'].includes(next.units.find(u=>u.id===id)?.status??'')))i.status='STABILIZED';
 }
 return next;
}
function weatherEventFactor(weather:Weather){return WEATHER_RULES[weather]?.event??1}
function weatherTrafficFactor(weather:Weather){return WEATHER_RULES[weather]?.traffic??1}

export function generateIncident(state:GameState,difficulty:Difficulty='NORMAL',rng:()=>number=Math.random):Incident{
 const weighted=INCIDENT_CATALOG.map(def=>{let w=def.weight;const hour=state.world.hour;if(hour>=22||hour<6)w*=def.type==='POLICE'||def.type==='MEDICAL'?1.35:.9;if(state.world.traffic>70&&def.type==='TRAFFIC')w*=1.7;const weather=WEATHER_RULES[state.world.weather];if(def.type==='WILDFIRE'||def.type==='FIRE')w*=weather.fire;if(def.type==='MEDICAL')w*=weather.medical;return Math.max(.01,w*DIFFICULTY[difficulty].eventRate)});
 const def=weightedRandom(INCIDENT_CATALOG,weighted,rng);const city=CITIES[Math.floor(rng()*CITIES.length)];const region=def.regions[Math.floor(rng()*def.regions.length)];const priority=(def.type==='MCI'||def.type==='AVIATION'||def.type==='RAIL'?1:1+Math.floor(rng()*3)) as 1|2|3|4;const patients=Math.floor(def.patientRange[0]+rng()*(def.patientRange[1]-def.patientRange[0]+1));const seq=String(state.statistics.calls+state.incidents.length+1).padStart(3,'0');
 return {id:`CALL-${seq}`,type:def.type,priority,location:{x:8+rng()*84,y:8+rng()*84},address:`${100+Math.floor(rng()*8900)} ${['Pine Street','Market Avenue','Canyon Road','Harbor Drive','8th Avenue','Redwood Boulevard'][Math.floor(rng()*6)]}, ${city.name}, RS`,status:'NEW',summary:def.summary,description:`${def.summary}. Region ${region}. 911 Caller liefert laufend neue Informationen.`,createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:def.stages,requiredServices:[...def.services] as Service[],unitIds:[],patients,escalation:def.escalation*DIFFICULTY[difficulty].escalation,danger:def.hazards.length*18+priority*8,objective:def.objective,sections:def.type==='MCI'?[{id:'TRIAGE',name:'Triage',objective:'Patienten priorisieren',unitIds:[]},{id:'TRANSPORT',name:'Transport',objective:'Krankenhäuser zuweisen',unitIds:[]}]:undefined};
}

export function calculateDispatchMetrics(state:GameState):SimulationMetrics{
 const active=state.incidents.filter(i=>!['COMPLETE','CANCELLED'].includes(i.status));const covered=active.filter(i=>i.unitIds.length>0).length;const response=active.length?active.reduce((s,i)=>s+clamp(100-i.ageMinutes*3-i.danger*.15),0)/active.length:100;const capacity=state.units.length?clamp(state.units.filter(u=>u.status==='AVAILABLE').length/state.units.length*100):0;const load=state.world.eventRate*(1+active.length/12);const dispatch=clamp(capacity*.7+response*.3);const resolution=state.statistics.completed?clamp((state.statistics.firesControlled+state.statistics.arrests+state.statistics.patientsSaved)/Math.max(1,state.statistics.completed)*25):72;const score=clamp((response+dispatch+resolution+capacity)/4);return {responseScore:response,dispatchScore:dispatch,resolutionScore:resolution,unitCoverage:active.length?covered/active.length*100:100,callLoad:load,reputationDelta:(score-70)/100};
}
export function transitionUnitStatus(current:UnitStatus,action:'DISPATCH'|'ARRIVE'|'COMPLETE'|'RETURN'|'MAINTENANCE'):UnitStatus{if(action==='DISPATCH'&&current==='AVAILABLE')return'EN_ROUTE';if(action==='ARRIVE'&&current==='EN_ROUTE')return'ON_SCENE';if(action==='COMPLETE'&&['ON_SCENE','TRANSPORTING','BUSY'].includes(current))return'RETURNING';if(action==='RETURN'&&current==='RETURNING')return'AVAILABLE';if(action==='MAINTENANCE'&&current!=='EN_ROUTE')return'MAINTENANCE';return current}
