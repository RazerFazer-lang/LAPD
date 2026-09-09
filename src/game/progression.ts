import type { Service } from './state';

export interface ProgressionLevel { level:number; title:string; unlocks:string[]; maxCalls:number; fundingBonus:number; }
export const PROGRESSION:ProgressionLevel[]=[
 {level:1,title:'Local Dispatch',unlocks:['Police Station','Fire Station','EMS Station','Patrol','Engine','BLS Ambulance'],maxCalls:5,fundingBonus:0},
 {level:5,title:'Municipal Dispatch',unlocks:['Special incidents','Traffic operations','Facility upgrades'],maxCalls:8,fundingBonus:7500},
 {level:10,title:'City Operations',unlocks:['Rescue','Detective','MCI coordination','Expanded districts'],maxCalls:12,fundingBonus:15000},
 {level:15,title:'County Operations',unlocks:['Battalion Chief','Brush Truck','Multi-agency command'],maxCalls:18,fundingBonus:25000},
 {level:25,title:'Countywide System',unlocks:['Hazmat','State Trooper','Advanced contracts'],maxCalls:28,fundingBonus:45000},
 {level:35,title:'Regional ECC',unlocks:['Air Ambulance','SWAT','Regional mutual aid'],maxCalls:40,fundingBonus:80000},
 {level:50,title:'Regional Dispatch Network',unlocks:['All units','Advanced analytics','Priority mutual aid','Executive operations'],maxCalls:60,fundingBonus:125000},
];
export function levelInfo(level:number){return[...PROGRESSION].reverse().find(x=>level>=x.level)??PROGRESSION[0]}
export function xpForNextLevel(level:number){return level*500}
export function unlockForService(level:number,service:Service){const info=levelInfo(level);return info.unlocks.some(x=>service==='POLICE'&&/Police|Patrol|Detective|SWAT|Trooper/i.test(x)||service==='FIRE'&&/Fire|Engine|Rescue|Battalion|Brush|Hazmat/i.test(x)||service==='EMS'&&/Ambulance|MCI|Air/i.test(x))}
export function progressionTitle(level:number){return levelInfo(level).title}
