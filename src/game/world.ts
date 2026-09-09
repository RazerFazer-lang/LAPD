import type { GameState, RoadEdge, Weather } from './state';
import { CITIES, WEATHER_RULES, type Difficulty } from './catalog';

export interface DistrictProfile { id:string; cityId:string; name:string; population:number; density:number; wealth:number; crime:number; traffic:number; medicalRisk:number; fireRisk:number; biome:string; weekendFactor:number; }
export const DISTRICTS:Distric​tProfile[] = [] as DistrictProfile[];

for(const city of CITIES){
  for(let i=0;i<Math.max(2,Math.min(5,city.biomes.length));i++){
    const biome=city.biomes[i];
    DISTRICTS.push({id:`${city.id}-${biome.toLowerCase()}`,cityId:city.id,name:`${city.name} ${biome.replaceAll('_',' ')}`,population:Math.round(city.population/(city.biomes.length||1)),density:city.density+(i*2)%7,wealth:city.wealth+((i%3)-1)*4,crime:city.crime+((i%4)-1)*5,traffic:city.traffic+((i%5)-2)*4,medicalRisk:city.medicalRisk+((i%3)-1)*5,fireRisk:city.fireRisk+((i%4)-1)*4,biome,weekendFactor:biome==='SCHOOLS'?.5:biome==='MALL'?1.25:1});
  }
}

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));
export function isWeekend(day:number){return ((day-1)%7)===5||((day-1)%7)===6}
export function dayPart(hour:number):'NIGHT'|'MORNING'|'DAY'|'EVENING'{if(hour<6||hour>=22)return'NIGHT';if(hour<10)return'MORNING';if(hour<18)return'DAY';return'EVENING'}
export function worldDemand(state:GameState,difficulty:Difficulty='NORMAL'){
 const part=dayPart(state.world.hour);const weekend=isWeekend(state.world.day);const weather=WEATHER_RULES[state.world.weather];const night=part==='NIGHT';
 const medical=(state.world.population/100000)*(1+(night?.18:0)+(weekend?.08:0))*weather.medical;
 const traffic=(state.world.traffic/50)*(part==='MORNING'?1.32:part==='EVENING'?1.45:night?.72:1)*(weekend?.85:1)*weather.traffic;
 const fire=(1+(night?.08:0)+(part==='DAY'?.03:0))*weather.fire;
 const crime=(1+(night?.32:0)+(weekend?.14:0))*(state.world.emergencyLevel??1);
 return{medical,traffic,fire,crime,eventRate:Math.max(.1,medical+traffic+fire+crime)*({RELAXED:.55,NORMAL:1,HARD:1.35,REALISTIC:1.65}[difficulty]??1)};
}
export function applyRoadConditions(state:GameState):GameState{
 const next=structuredClone(state);const w=WEATHER_RULES[next.world.weather];for(const edge of next.roads?.edges??[]){edge.traffic=clamp(next.world.traffic*(edge.highway?1.08:1)+((edge.id.charCodeAt(edge.id.length-1)%9)-4),0,100);if(next.world.weather==='FLOODING')edge.blocked=!edge.highway&&edge.traffic>82;else if(next.world.weather==='SNOW')edge.blocked=edge.traffic>95;else if(edge.blocked&&Math.random()<.015)edge.blocked=false;edge.speedLimit=Math.max(15,Math.round(edge.speedLimit/w.traffic));}
 return next;
}
export function roadEtaMinutes(edge:RoadEdge,distance:number){return (distance/Math.max(5,edge.speedLimit))*(1+edge.traffic/100)*60}
export function districtForPoint(x:number,y:number){const ix=Math.max(0,Math.min(CITIES.length-1,Math.floor((y/100)*CITIES.length)));return DISTRICTS.find(d=>d.cityId===CITIES[ix].id)||DISTRICTS[0]}
