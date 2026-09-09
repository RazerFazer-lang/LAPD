import type { FacilityType, IncidentType, Service, Unit } from './state';

export type Difficulty='RELAXED'|'NORMAL'|'HARD'|'REALISTIC';
export type GameRole='CALL_TAKER'|'POLICE_DISPATCHER'|'FIRE_DISPATCHER'|'EMS_DISPATCHER'|'SUPERVISOR'|'MANAGER'|'ADMINISTRATOR';

export const CITIES=[
  {id:'redwood-city',name:'Redwood City',district:'Central',population:560000,density:92,wealth:68,crime:58,traffic:74,medicalRisk:54,fireRisk:45,biomes:['DOWNTOWN','SUBURBS','INDUSTRIAL','AIRPORT']},
  {id:'lakewood',name:'Lakewood',district:'East',population:214000,density:61,wealth:72,crime:31,traffic:55,medicalRisk:42,fireRisk:38,biomes:['SUBURBS','MALL','SCHOOLS']},
  {id:'pine-valley',name:'Pine Valley',district:'North',population:68000,density:18,wealth:49,crime:22,traffic:29,medicalRisk:35,fireRisk:78,biomes:['FOREST','MOUNTAIN','FARM']},
  {id:'port-redwood',name:'Port Redwood',district:'West',population:172000,density:47,wealth:53,crime:51,traffic:68,medicalRisk:48,fireRisk:66,biomes:['PORT','INDUSTRIAL','RAIL']},
  {id:'desert-ridge',name:'Desert Ridge',district:'South',population:91000,density:11,wealth:46,crime:34,traffic:44,medicalRisk:57,fireRisk:91,biomes:['DESERT','HIGHWAY','MOTEL']},
] as const;

export const FACILITY_CATALOG:Record<FacilityType,{label:string;icon:string;buildable?:boolean}>= {
  POLICE_STATION:{label:'Police Station',icon:'POLICE',buildable:true},
  FIRE_STATION:{label:'Fire Station',icon:'FIRE',buildable:true},
  EMS_STATION:{label:'EMS Station',icon:'EMS',buildable:true},
  HOSPITAL:{label:'Hospital',icon:'HOSPITAL'}, SCHOOL:{label:'School',icon:'SCHOOL'}, FUEL:{label:'Fuel',icon:'FUEL'},
  SHOPPING:{label:'Shopping',icon:'SHOPPING'}, INDUSTRIAL:{label:'Industrial',icon:'INDUSTRIAL'}, AIRPORT:{label:'Airport',icon:'AIRPORT'},
  RAIL:{label:'Rail',icon:'RAIL'}, PARK:{label:'Park',icon:'PARK'}, BRIDGE:{label:'Bridge',icon:'BRIDGE'}
};

export const UNIT_CATALOG:Record<string,Partial<Pick<Unit,'type'|'capabilities'|'crew'|'speed'|'maintenance'|'fuel'>> & {service:Service;cost:number;unlockLevel:number;model:string}>= {
  PATROL:{service:'POLICE',type:'Patrol',capabilities:['PATROL','TRAFFIC'],crew:2,speed:1.9,maintenance:100,fuel:100,cost:105000,unlockLevel:1,model:'Ford Police Interceptor Utility'},
  SUPERVISOR:{service:'POLICE',type:'Supervisor',capabilities:['SUPERVISOR','PATROL','TRAFFIC','COMMAND'],crew:2,speed:1.9,maintenance:100,fuel:100,cost:145000,unlockLevel:6,model:'Ford Police Interceptor Utility Supervisor'},
  K9:{service:'POLICE',type:'K9',capabilities:['PATROL','K9','SEARCH'],crew:2,speed:1.85,maintenance:100,fuel:100,cost:128000,unlockLevel:9,model:'Ford Police Interceptor Utility K9'},
  DETECTIVE:{service:'POLICE',type:'Detective',capabilities:['INVESTIGATION','FOLLOW_UP'],crew:2,speed:1.6,maintenance:100,fuel:100,cost:118000,unlockLevel:14,model:'Unmarked Ford Explorer'},
  SWAT:{service:'POLICE',type:'SWAT',capabilities:['TACTICAL','HOSTAGE','HIGH_RISK'],crew:4,speed:1.55,maintenance:100,fuel:100,cost:280000,unlockLevel:22,model:'Lenco BearCat'},
  STATE_TROOPER:{service:'POLICE',type:'State Trooper',capabilities:['HIGHWAY','TRAFFIC','PURSUIT'],crew:2,speed:2.1,maintenance:100,fuel:100,cost:112000,unlockLevel:18,model:'Dodge Charger Pursuit'},
  ENGINE:{service:'FIRE',type:'Engine',capabilities:['FIRE_SUPPRESSION','RESCUE','MEDICAL_AID'],crew:4,speed:1.35,maintenance:100,fuel:100,cost:440000,unlockLevel:1,model:'Pierce Enforcer Engine'},
  LADDER:{service:'FIRE',type:'Ladder Truck',capabilities:['FIRE_SUPPRESSION','LADDER','AERIAL','RESCUE'],crew:4,speed:1.05,maintenance:100,fuel:100,cost:850000,unlockLevel:7,model:'Pierce Enforcer 100ft Ladder'},
  RESCUE:{service:'FIRE',type:'Rescue',capabilities:['RESCUE','TECHNICAL','MEDICAL_AID'],crew:4,speed:1.2,maintenance:100,fuel:100,cost:590000,unlockLevel:10,model:'Heavy Rescue'},
  BATTALION:{service:'FIRE',type:'Battalion Chief',capabilities:['COMMAND','FIRE_SUPPRESSION'],crew:2,speed:1.25,maintenance:100,fuel:100,cost:330000,unlockLevel:13,model:'Chevrolet Tahoe Battalion Chief'},
  BRUSH:{service:'FIRE',type:'Brush Truck',capabilities:['WILDFIRE','OFFROAD'],crew:3,speed:1.45,maintenance:100,fuel:100,cost:360000,unlockLevel:16,model:'Type 6 Brush Truck'},
  HAZMAT:{service:'FIRE',type:'Hazmat',capabilities:['HAZMAT','DECONTAMINATION','RESCUE'],crew:4,speed:1.1,maintenance:100,fuel:100,cost:720000,unlockLevel:20,model:'Hazmat Response Unit'},
  BLS_AMBULANCE:{service:'EMS',type:'BLS Ambulance',capabilities:['BLS','TRANSPORT'],crew:2,speed:1.7,maintenance:100,fuel:100,cost:190000,unlockLevel:1,model:'Ford F-450 Type III Ambulance'},
  ALS_AMBULANCE:{service:'EMS',type:'ALS Ambulance',capabilities:['ALS','BLS','TRANSPORT'],crew:2,speed:1.75,maintenance:100,fuel:100,cost:235000,unlockLevel:3,model:'Ford F-450 Type I Ambulance'},
  SUPERVISOR_EMS:{service:'EMS',type:'EMS Supervisor',capabilities:['SUPERVISOR','ALS','COMMAND'],crew:2,speed:1.75,maintenance:100,fuel:100,cost:250000,unlockLevel:8,model:'Chevrolet Tahoe EMS Supervisor'},
  AIR_AMBULANCE:{service:'EMS',type:'Air Ambulance',capabilities:['AIR','ALS','TRANSPORT'],crew:4,speed:4.2,maintenance:100,fuel:100,cost:1450000,unlockLevel:24,model:'EC135 Air Ambulance'},
};

export interface IncidentDefinition { type:IncidentType; summary:string; services:Service[]; weight:number; stages:string[]; hazards:string[]; patientRange:[number,number]; escalation:number; regions:string[]; objective:string; }
export const INCIDENT_CATALOG:IncidentDefinition[]=[
 {type:'MEDICAL',summary:'Person mit Brustschmerzen und Atemnot',services:['EMS'],weight:28,stages:['911-Anrufer meldet Symptome','Patientenzustand verschlechtert sich','Transportentscheidung erforderlich','Einsatz abgeschlossen'],hazards:[],patientRange:[1,1],escalation:12,regions:['DOWNTOWN','SUBURBS'],objective:'Patienten stabilisieren und geeigneten Transport sicherstellen.'},
 {type:'MEDICAL',summary:'Bewusstlose Person in Wohngebäude',services:['EMS'],weight:16,stages:['Bewusstlos gemeldet','Reanimation begonnen','ROSC oder Transport','Krankenhausübergabe'],hazards:['MEDICAL'],patientRange:[1,1],escalation:26,regions:['DOWNTOWN','SUBURBS','INDUSTRIAL'],objective:'Schnelle ALS-Versorgung und Transport.'},
 {type:'FIRE',summary:'Rauch aus Wohnhaus',services:['FIRE','EMS'],weight:11,stages:['Rauch aus Gebäude','Flammen sichtbar','Personen vermisst','Dach einsturzgefährdet'],hazards:['FIRE','STRUCTURAL'],patientRange:[0,4],escalation:36,regions:['SUBURBS','DOWNTOWN'],objective:'Brand eindämmen, Personen retten und Ausbreitung verhindern.'},
 {type:'FIRE',summary:'Industriebrand mit unbekanntem Stoff',services:['FIRE','EMS'],weight:5,stages:['Rauchentwicklung','Gefahrstoff vermutet','Wind treibt Rauch','Dekontamination erforderlich'],hazards:['FIRE','HAZMAT'],patientRange:[0,8],escalation:54,regions:['INDUSTRIAL','PORT'],objective:'Gefahrenbereich sichern und Hazmat-Lage kontrollieren.'},
 {type:'POLICE',summary:'Einbruchalarm in Geschäft',services:['POLICE'],weight:18,stages:['Alarm eingegangen','Gebäude prüfen','Tatort sichern','Einsatz abgeschlossen'],hazards:['CRIME'],patientRange:[0,1],escalation:17,regions:['DOWNTOWN','SUBURBS','MALL'],objective:'Tatort sichern und mögliche Täterlage klären.'},
 {type:'POLICE',summary:'Bewaffnete Person gemeldet',services:['POLICE'],weight:7,stages:['Bewaffnete Person gemeldet','Lage bestätigt','Perimeter aufgebaut','Bedrohung beendet'],hazards:['ACTIVE_THREAT'],patientRange:[0,3],escalation:64,regions:['DOWNTOWN','SUBURBS'],objective:'Gefahr eindämmen und zivile Personen schützen.'},
 {type:'TRAFFIC',summary:'Mehrfahrzeug-Unfall auf Interstate',services:['POLICE','EMS','FIRE'],weight:9,stages:['Kollision gemeldet','Fahrbahn blockiert','Verletzte identifiziert','Fahrbahn geräumt'],hazards:['TRAFFIC'],patientRange:[1,8],escalation:38,regions:['HIGHWAY'],objective:'Unfallstelle sichern, Verletzte versorgen und Verkehr wieder öffnen.'},
 {type:'WILDFIRE',summary:'Rauchentwicklung im Waldgebiet',services:['FIRE','EMS'],weight:4,stages:['Rauch gesichtet','Flammenfront wächst','Evakuierungswarnung','Feuer unter Kontrolle'],hazards:['FIRE','WILDFIRE','WEATHER'],patientRange:[0,12],escalation:72,regions:['FOREST','MOUNTAIN'],objective:'Brandlinie aufbauen und betroffene Gebiete schützen.'},
 {type:'HAZMAT',summary:'Chemieunfall auf Betriebsgelände',services:['FIRE','EMS','POLICE'],weight:3,stages:['Stoff unbekannt','Sperrzone eingerichtet','Dekontamination','Gefahr beseitigt'],hazards:['HAZMAT'],patientRange:[0,12],escalation:68,regions:['INDUSTRIAL','PORT'],objective:'Gefahrstoff isolieren und Exposition minimieren.'},
 {type:'AVIATION',summary:'Flugzeugnotfall im Anflug',services:['FIRE','EMS','POLICE'],weight:1,stages:['Mayday gemeldet','Crash Landing möglich','Massenanfall Verletzter','Runway wieder freigegeben'],hazards:['MCI','FIRE'],patientRange:[4,40],escalation:88,regions:['AIRPORT'],objective:'Airport Emergency Plan auslösen und MCI bewältigen.'},
 {type:'RAIL',summary:'Zugentgleisung im Hafenbereich',services:['FIRE','EMS','POLICE'],weight:1,stages:['Entgleisung gemeldet','Mehrere Wagen betroffen','Hazmat prüfen','Bergung läuft'],hazards:['MCI','HAZMAT','RAIL'],patientRange:[5,30],escalation:82,regions:['PORT','RAIL'],objective:'Großlage segmentieren, Patienten triagieren und Verkehrswege schützen.'},
 {type:'MCI',summary:'Großereignis mit vielen Verletzten',services:['EMS','FIRE','POLICE'],weight:1,stages:['MCI bestätigt','Triage aufgebaut','Transportkoordination','Übergabe abgeschlossen'],hazards:['MCI'],patientRange:[8,40],escalation:80,regions:['DOWNTOWN','MALL','STADIUM'],objective:'Triage, Transport und Ressourcenzuteilung koordinieren.'},
];

export const DIFFICULTY={
 RELAXED:{eventRate:.55,escalation:.65,budgetMultiplier:1.25,traffic:.75},
 NORMAL:{eventRate:1,escalation:1,budgetMultiplier:1,traffic:1},
 HARD:{eventRate:1.35,escalation:1.2,budgetMultiplier:.9,traffic:1.2},
 REALISTIC:{eventRate:1.65,escalation:1.35,budgetMultiplier:.82,traffic:1.3},
} satisfies Record<Difficulty,{eventRate:number;escalation:number;budgetMultiplier:number;traffic:number}>;

export const ROLE_LABELS:Record<GameRole,string>={CALL_TAKER:'911 Call Taker',POLICE_DISPATCHER:'Police Dispatcher',FIRE_DISPATCHER:'Fire Dispatcher',EMS_DISPATCHER:'EMS Dispatcher',SUPERVISOR:'Supervisor',MANAGER:'Manager',ADMINISTRATOR:'Administrator'};
export const ROLE_PERMISSIONS:Record<GameRole,string[]>={
 CALL_TAKER:['CALL_ACCEPT','CALL_CREATE'],POLICE_DISPATCHER:['CALL_ACCEPT','UNIT_DISPATCH','POLICE_COMMAND'],FIRE_DISPATCHER:['CALL_ACCEPT','UNIT_DISPATCH','FIRE_COMMAND'],EMS_DISPATCHER:['CALL_ACCEPT','UNIT_DISPATCH','EMS_COMMAND'],SUPERVISOR:['CALL_ACCEPT','UNIT_DISPATCH','COMMAND','MUTUAL_AID'],MANAGER:['FINANCE','PERSONNEL','UPGRADES'],ADMINISTRATOR:['ALL'],
};

export const WEATHER_RULES={CLEAR:{traffic:1,event:1,fire:1,medical:1},CLOUDY:{traffic:1.03,event:1.05,fire:.96,medical:1},RAIN:{traffic:1.22,event:1.18,fire:.76,medical:1.08},HEAVY_RAIN:{traffic:1.45,event:1.5,fire:.55,medical:1.22},THUNDERSTORM:{traffic:1.6,event:1.8,fire:.68,medical:1.28},FOG:{traffic:1.35,event:1.22,fire:.94,medical:1.06},SNOW:{traffic:1.7,event:1.25,fire:.9,medical:1.3},HEATWAVE:{traffic:1.05,event:1.42,fire:1.38,medical:1.34},WINDSTORM:{traffic:1.5,event:1.58,fire:1.22,medical:1.18},FLOODING:{traffic:1.9,event:1.35,fire:.6,medical:1.42}} as const;
