import type { Finance, GameState, Hospital, Incident, Personnel, Service, Unit } from './state';

export type SaveEnvelope={schemaVersion:3;savedAt:number;state:GameState};
export type FinancialSnapshot={revenue:number;costs:number;net:number;payroll:number;maintenance:number;fuel:number;reserve:number;runwayDays:number};

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));

export function calculatePayroll(personnel:Personnel[]):number{return personnel.filter(p=>p.active).reduce((sum,p)=>sum+p.salary,0)}
export function calculateFleetCosts(units:Unit[]):{maintenance:number;fuel:number}{
 const maintenance=units.reduce((sum,u)=>sum+(100-Math.max(0,u.maintenance))*18,0);
 const fuel=units.reduce((sum,u)=>sum+(100-Math.max(0,u.fuel))*7.5,0);
 return {maintenance,fuel};
}
export function buildFinancialSnapshot(finance:Finance,personnel:Personnel[],units:Unit[]):FinancialSnapshot{
 const payroll=calculatePayroll(personnel);const fleet=calculateFleetCosts(units);const revenue=finance.revenueToday+finance.monthlyFunding;const costs=finance.costsToday+payroll+fleet.maintenance+fleet.fuel+finance.upgrades;const net=revenue-costs;const reserve=Math.max(0,finance.emergencyReserve??0)+net;const runwayDays=costs>0?Math.max(0,reserve/(costs/30)):9999;return{revenue,costs,net,payroll,maintenance:fleet.maintenance,fuel:fleet.fuel,reserve,runwayDays};
}
export function applyEndOfDay(finance:Finance,personnel:Personnel[],units:Unit[]):Finance{
 const next=structuredClone(finance);const snapshot=buildFinancialSnapshot(next,personnel,units);next.payroll=snapshot.payroll;next.maintenance=snapshot.maintenance;next.fuel=snapshot.fuel;next.costsToday+=snapshot.payroll+snapshot.maintenance+snapshot.fuel;next.emergencyReserve=Math.max(0,snapshot.reserve);next.revenueToday=0;next.costsToday=0;next.upgrades=0;return next;
}

export function updatePersonnel(personnel:Personnel[],load:number,minutes:number):Personnel[]{
 return personnel.map(p=>{const n={...p};if(!n.active)return n;const shiftFactor=load>1.2?1.35:load<.7?.7:1;n.stress=clamp(n.stress+minutes*.02*shiftFactor-(minutes/60)*.35);n.fatigue=clamp((n.fatigue??0)+minutes*.015*shiftFactor-(minutes/60)*.5);n.errorRate=clamp(.02+(n.stress/200)+(n.fatigue??0)/220-(n.performance/500),0,35);if(n.stress>92)n.active=false;return n});
}
export function assignShift(personnel:Personnel[],shift:Personnel['shift'],needed:number):Personnel[]{
 const selected=[...personnel].filter(p=>p.active).sort((a,b)=>a.stress-b.stress).slice(0,Math.max(0,needed)).map(p=>p.id);return personnel.map(p=>selected.includes(p.id)?{...p,shift}:p);
}

export function hospitalCapacity(hospital:Hospital){return Math.max(0,hospital.capacity-hospital.occupied)}
export function chooseHospital(hospitals:Hospital[],requiresTrauma=false,requiresBurn=false,requiresPediatric=false):Hospital|null{
 return [...hospitals].filter(h=>hospitalCapacity(h)>0).filter(h=>!requiresTrauma||h.trauma).filter(h=>!requiresBurn||h.burn).filter(h=>!requiresPediatric||h.pediatric).sort((a,b)=>hospitalCapacity(b)-hospitalCapacity(a))[0]??null;
}
export function admitPatients(hospital:Hospital,patients:number){const admitted=Math.min(Math.max(0,patients),hospitalCapacity(hospital));return{hospital:{...hospital,occupied:hospital.occupied+admitted},admitted,rejected:Math.max(0,patients-admitted)}}

export function scoreReputation(state:GameState):number{
 const completed=Math.max(1,state.statistics.completed);const response=clamp(100-state.statistics.averageResponse*2);const survival=clamp(state.statistics.patientsSaved/completed*100);const publicSafety=clamp((state.statistics.firesControlled+state.statistics.arrests)/completed*70);return Math.round(response*.25+survival*.4+publicSafety*.35);
}
export function applyReputation(state:GameState):GameState{const next=structuredClone(state);const score=scoreReputation(next);next.center.reputation=Math.round(clamp(next.center.reputation+(score-70)*.05));return next}

export function createSaveEnvelope(state:GameState):SaveEnvelope{return{schemaVersion:3,savedAt:Date.now(),state:structuredClone(state)}}
export function validateSaveEnvelope(value:unknown):value is SaveEnvelope{const v=value as Partial<SaveEnvelope>|null;return !!v&&v.schemaVersion===3&&typeof v.savedAt==='number'&&!!v.state&&v.state.version===2}
export function migrateSave(value:unknown):GameState|null{
 if(validateSaveEnvelope(value))return structuredClone(value.state);
 const legacy=value as Partial<GameState>|null;if(legacy?.version===2&&Array.isArray(legacy.units)&&Array.isArray(legacy.incidents))return structuredClone(legacy as GameState);
 return null;
}

export function serviceForUnit(unit:Unit):Service{return unit.service}
export function chainIncident(incident:Incident):Incident|null{
 if(incident.type==='TRAFFIC'&&incident.stageIndex===1)return{...incident,id:`${incident.id}-CHAIN-ROAD`,type:'TRAFFIC',priority:2,summary:'Folgeunfall durch Rückstau',address:incident.address,location:{x:Math.min(98,incident.location.x+4),y:Math.min(98,incident.location.y+3)},createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['Stau bildet sich','Folgeunfall gemeldet','Fahrbahn wird geräumt'],requiredServices:['POLICE','EMS'],unitIds:[],patients:1,escalation:30,danger:35,objective:'Folgeunfall sichern und Rückstau auflösen.',status:'NEW',ownerId:incident.ownerId,ownerName:incident.ownerName};
 if((incident.type==='FIRE'||incident.type==='WILDFIRE')&&incident.stageIndex===2)return{...incident,id:`${incident.id}-CHAIN-MED`,type:'MEDICAL',priority:2,summary:'Rauchinhalation bei mehreren Betroffenen',address:incident.address,location:incident.location,createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['Betroffene gemeldet','Patienten triagieren','Transport erforderlich'],requiredServices:['EMS'],unitIds:[],patients:Math.max(1,incident.patients),escalation:22,danger:25,objective:'Betroffene medizinisch versorgen.',status:'NEW',ownerId:incident.ownerId,ownerName:incident.ownerName};
 return null;
}
