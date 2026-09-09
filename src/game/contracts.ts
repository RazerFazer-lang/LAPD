import type { Finance } from './state';

export type ContractKind='COUNTY'|'STATE'|'MUNICIPAL'|'PRIVATE';
export interface ServiceContract{id:string;name:string;kind:ContractKind;payment:number;durationDays:number;minimumReputation:number;requiredServices:string[];active:boolean;}
export const CONTRACTS:ServiceContract[]=[
 {id:'COUNTY-911',name:'Redwood Metro County 911 Authority',kind:'COUNTY',payment:38000,durationDays:30,minimumReputation:50,requiredServices:['POLICE','FIRE','EMS'],active:true},
 {id:'STATE-HWY',name:'Redwood State Highway Response',kind:'STATE',payment:24000,durationDays:30,minimumReputation:62,requiredServices:['POLICE','FIRE','EMS'],active:false},
 {id:'MUNI-LAKE',name:'Lakewood Municipal Coverage',kind:'MUNICIPAL',payment:18000,durationDays:30,minimumReputation:68,requiredServices:['POLICE','EMS'],active:false},
 {id:'PORT-IND',name:'Port Redwood Industrial Emergency Contract',kind:'PRIVATE',payment:32000,durationDays:30,minimumReputation:72,requiredServices:['FIRE','EMS','POLICE'],active:false},
];
export function eligibleContracts(reputation:number){return CONTRACTS.filter(c=>reputation>=c.minimumReputation)}
export function applyContracts(finance:Finance,reputation:number,activeIds:string[]=CONTRACTS.filter(c=>c.active).map(c=>c.id)){const next=structuredClone(finance);for(const c of CONTRACTS)if(activeIds.includes(c.id)&&reputation>=c.minimumReputation)next.monthlyFunding+=c.payment;return next}
export function grantForPerformance(reputation:number,score:number){return reputation>=80&&score>=90?25000:reputation>=70&&score>=82?10000:0}
