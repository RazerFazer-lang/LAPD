export type Service = 'POLICE' | 'FIRE' | 'EMS';
export type UnitStatus = 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'RETURNING' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
export type IncidentStatus = 'NEW' | 'DISPATCHING' | 'RESPONDING' | 'ON_SCENE' | 'ACTIVE' | 'STABILIZED' | 'TRANSPORT' | 'COMPLETE' | 'CANCELLED';
export type IncidentType = 'MEDICAL' | 'FIRE' | 'POLICE' | 'TRAFFIC' | 'HAZMAT' | 'WILDFIRE' | 'WEATHER' | 'AVIATION' | 'RAIL' | 'MCI' | 'FLOOD' | 'MASS_FIRE' | 'ACTIVE_THREAT';
export type Role = 'CALL_TAKER' | 'POLICE_DISPATCHER' | 'FIRE_DISPATCHER' | 'EMS_DISPATCHER' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
export type Weather = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'THUNDERSTORM' | 'FOG' | 'SNOW' | 'HEATWAVE' | 'WINDSTORM' | 'FLOODING';
export type FacilityType = 'POLICE_STATION' | 'FIRE_STATION' | 'HOSPITAL' | 'SCHOOL' | 'FUEL' | 'SHOPPING' | 'INDUSTRIAL' | 'AIRPORT' | 'RAIL' | 'PARK' | 'BRIDGE';
export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT';

export interface MapPoint { x: number; y: number; }
export interface RoadNode { id: string; position: MapPoint; signal?: boolean; }
export interface RoadEdge { id: string; from: string; to: string; lanes: number; speedLimit: number; traffic: number; blocked?: boolean; highway?: boolean; }
export interface Facility { id: string; name: string; type: FacilityType; position: MapPoint; district: string; capacity?: number; }
export interface Unit {
  id: string; callsign: string; service: Service; type: string; status: UnitStatus;
  position: MapPoint; target?: MapPoint; route?: MapPoint[]; routeIndex?: number; heading?: number; speed: number; crew: number;
  capabilities: string[]; maintenance: number; fuel: number; assignedIncidentId?: string; vehicleModel?: string; lightPattern?: 'STEADY' | 'DUAL' | 'TRIPLE';
}
export interface Incident {
  id: string; type: IncidentType; priority: 1 | 2 | 3 | 4; location: MapPoint; address: string;
  status: IncidentStatus; summary: string; createdAt: number; ageMinutes: number; stageIndex: number; stages: string[];
  requiredServices: Service[]; unitIds: string[]; patients: number; escalation: number; danger: number; objective: string;
  commandPost?: MapPoint; incidentCommander?: string; sections?: Array<{id:string;name:string;objective:string;unitIds:string[]}>;
}
export interface Personnel {
  id: string; name: string; role: Role; experience: number; stress: number; salary: number; performance: number; errorRate: number; shift: Shift; active: boolean;
  certifications?: string[]; training?: number; fatigue?: number; overtimeHours?: number;
}
export interface Hospital { id: string; name: string; capacity: number; occupied: number; trauma: boolean; burn: boolean; pediatric: boolean; helipad: boolean; }
export interface Finance { revenueToday: number; costsToday: number; monthlyFunding: number; maintenance: number; payroll: number; fuel: number; upgrades: number; emergencyReserve?: number; fleetValue?: number; }
export interface WorldState { population: number; weather: Weather; traffic: number; day: number; hour: number; minute: number; eventRate: number; powerLoad: number; nightFactor?: number; emergencyLevel?: number; }
export interface LobbyState { id: string; name: string; hostId: string; players: Array<{ id: string; name: string; role: Role; ready: boolean; connected?: boolean }>; maxPlayers: number; }
export interface GameState {
  version: 2; serverTime: number; simulationMinutes: number; center: { id: string; name: string; money: number; reputation: number; level: number; region: string };
  units: Unit[]; incidents: Incident[]; personnel: Personnel[]; hospitals: Hospital[]; finance: Finance; world: WorldState;
  roads?: { nodes: RoadNode[]; edges: RoadEdge[] };
  facilities?: Facility[];
  selectedIncidentId?: string; eventLog: string[]; statistics: { calls: number; completed: number; patientsSaved: number; firesControlled: number; arrests: number; falseAlarms: number; averageResponse: number; majorIncidents?: number; milesDriven?: number; trainingHours?: number };
}

const u=(id:string,callsign:string,service:Service,type:string,x:number,y:number,capabilities:string[],vehicleModel:string):Unit=>({id,callsign,service,type,status:'AVAILABLE',position:{x,y},speed:service==='FIRE'?1.35:service==='EMS'?1.65:1.95,crew:service==='POLICE'?2:3,capabilities,maintenance:92,fuel:88,vehicleModel,lightPattern:service==='POLICE'?'DUAL':'TRIPLE'});
const personnel:Personnel[]=[
{id:'P-01',name:'Jordan Miller',role:'SUPERVISOR',experience:88,stress:22,salary:7200,performance:94,errorRate:2,shift:'MORNING',active:true,certifications:['ICS-300','MCI','Supervisor'],training:96,fatigue:18},
{id:'P-02',name:'Alex Carter',role:'CALL_TAKER',experience:61,stress:34,salary:5100,performance:86,errorRate:5,shift:'MORNING',active:true,certifications:['EMD','EFD'],training:72,fatigue:24},
{id:'P-03',name:'Morgan Reed',role:'FIRE_DISPATCHER',experience:74,stress:28,salary:5600,performance:89,errorRate:4,shift:'MORNING',active:true,certifications:['Fire Dispatch','HazMat'],training:81,fatigue:20},
{id:'P-04',name:'Taylor Brooks',role:'EMS_DISPATCHER',experience:68,stress:31,salary:5400,performance:91,errorRate:3,shift:'MORNING',active:true,certifications:['EMD','MCI'],training:84,fatigue:19},
];
const nodes:RoadNode[]=[
{id:'N1',position:{x:10,y:18},signal:true},{id:'N2',position:{x:30,y:18},signal:true},{id:'N3',position:{x:50,y:18},signal:true},{id:'N4',position:{x:70,y:18},signal:true},{id:'N5',position:{x:90,y:18},signal:true},
{id:'N6',position:{x:10,y:45},signal:true},{id:'N7',position:{x:30,y:45},signal:true},{id:'N8',position:{x:50,y:45},signal:true},{id:'N9',position:{x:70,y:45},signal:true},{id:'N10',position:{x:90,y:45},signal:true},
{id:'N11',position:{x:10,y:72},signal:true},{id:'N12',position:{x:30,y:72},signal:true},{id:'N13',position:{x:50,y:72},signal:true},{id:'N14',position:{x:70,y:72},signal:true},{id:'N15',position:{x:90,y:72},signal:true}
];
const edges:RoadEdge[]=[]; let ei=1; for(let r=0;r<3;r++){for(let c=0;c<4;c++){edges.push({id:`E${ei++}`,from:`N${r*5+c+1}`,to:`N${r*5+c+2}`,lanes:2,speedLimit:45,traffic:35});edges.push({id:`E${ei++}`,from:`N${r*5+c+2}`,to:`N${r*5+c+1}`,lanes:2,speedLimit:45,traffic:35});}} for(let c=0;c<5;c++){for(let r=0;r<2;r++){edges.push({id:`E${ei++}`,from:`N${r*5+c+1}`,to:`N${(r+1)*5+c+1}`,lanes:2,speedLimit:35,traffic:30});edges.push({id:`E${ei++}`,from:`N${(r+1)*5+c+1}`,to:`N${r*5+c+1}`,lanes:2,speedLimit:35,traffic:30});}}
export const facilities:Facility[]=[
{id:'F-01',name:'Redwood Metro Police HQ',type:'POLICE_STATION',position:{x:28,y:14},district:'Downtown'},
{id:'F-02',name:'Redwood Fire Station 7',type:'FIRE_STATION',position:{x:24,y:54},district:'Westside'},
{id:'F-03',name:'Lakewood Fire Station 12',type:'FIRE_STATION',position:{x:16,y:75},district:'Lakewood'},
{id:'F-04',name:'Redwood Memorial Hospital',type:'HOSPITAL',position:{x:70,y:28},district:'Central',capacity:80},
{id:'F-05',name:'Lakewood General Hospital',type:'HOSPITAL',position:{x:34,y:82},district:'Lakewood',capacity:55},
{id:'F-06',name:'Redwood International Airport',type:'AIRPORT',position:{x:86,y:14},district:'North'},
{id:'F-07',name:'Union Station',type:'RAIL',position:{x:82,y:56},district:'Port Redwood'},
{id:'F-08',name:'Canyon View High School',type:'SCHOOL',position:{x:55,y:34},district:'Pine Valley'},
{id:'F-09',name:'Redwood Mall',type:'SHOPPING',position:{x:62,y:70},district:'Eastside'},
{id:'F-10',name:'Harbor Fuel Plaza',type:'FUEL',position:{x:88,y:73},district:'Port Redwood'},
{id:'F-11',name:'Port Redwood Industrial Park',type:'INDUSTRIAL',position:{x:83,y:46},district:'Port Redwood'},
{id:'F-12',name:'Cedar Creek Park',type:'PARK',position:{x:20,y:35},district:'Westside'},
{id:'F-13',name:'Redwood River Bridge',type:'BRIDGE',position:{x:49,y:58},district:'Central'},
{id:'F-14',name:'Metro Rail Yard',type:'RAIL',position:{x:73,y:82},district:'South'}
];
export const initialGameState:GameState={version:2,serverTime:Date.now(),simulationMinutes:8*60+42,center:{id:'dcc-001',name:'Redwood Metro Dispatch',money:250000,reputation:72,level:1,region:'Redwood Metro County'},units:[
 u('RPD-12','PATROL 12','POLICE','Patrol',61,43,['PATROL','TRAFFIC'],'Ford Police Interceptor Utility'),u('RPD-21','PATROL 21','POLICE','Patrol',58,49,['PATROL'],'Dodge Charger Pursuit'),u('RPD-31','PATROL 31','POLICE','SUV',36,20,['PATROL','K9'],'Chevrolet Tahoe PPV'),
 u('RFD-E7','ENGINE 7','FIRE','Engine',28,58,['FIRE_SUPPRESSION','RESCUE'],'Pierce Enforcer Engine'),u('RFD-T2','TRUCK 2','FIRE','Ladder',31,56,['LADDER','RESCUE'],'Pierce Arrow XT Ladder'),u('RFD-B1','BATTALION 1','FIRE','Battalion Chief',24,55,['COMMAND'],'Chevrolet Tahoe Fire Command'),
 u('EMS-A3','AMBULANCE 3','EMS','ALS Ambulance',74,27,['ALS','TRANSPORT'],'Ford F-450 Type I Ambulance'),u('EMS-A5','AMBULANCE 5','EMS','BLS Ambulance',67,58,['BLS','TRANSPORT'],'Ford E-Series Type III Ambulance'),u('EMS-S1','EMS SUP 1','EMS','Supervisor',72,60,['COMMAND','MCI'],'Chevrolet Tahoe EMS Supervisor')
],incidents:[
{id:'INC-1042',type:'MEDICAL',priority:1,location:{x:70,y:30},address:'1457 Pine Street',status:'ACTIVE',summary:'Bewusstlose Person in Wohnhaus',createdAt:Date.now()-420000,ageMinutes:7,stageIndex:1,stages:['Bewusstlos','Atemstillstand möglich','Reanimation läuft'],requiredServices:['EMS','POLICE'],unitIds:['EMS-A3'],patients:1,escalation:34,danger:22,objective:'Patient stabilisieren und transportieren'},
{id:'INC-1043',type:'TRAFFIC',priority:2,location:{x:48,y:68},address:'Redwood Highway / 8th Ave',status:'RESPONDING',summary:'Verkehrsunfall mit zwei Fahrzeugen',createdAt:Date.now()-180000,ageMinutes:3,stageIndex:0,stages:['Unfall mit zwei Fahrzeugen','Verkehr blockiert','Mögliche Verletzte'],requiredServices:['POLICE','EMS'],unitIds:['RPD-12'],patients:2,escalation:18,danger:28,objective:'Unfallstelle sichern und Verletzte versorgen'},
{id:'INC-1044',type:'FIRE',priority:2,location:{x:54,y:24},address:'820 Market Avenue',status:'NEW',summary:'Rauchentwicklung aus mehrstöckigem Gebäude',createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['Rauch aus Fenster','Flammen sichtbar','Personen im Gebäude'],requiredServices:['FIRE','EMS'],unitIds:[],patients:0,escalation:42,danger:51,objective:'Brand eindämmen und Gebäude durchsuchen'},
{id:'INC-1045',type:'MCI',priority:1,location:{x:82,y:55},address:'Union Station · Main Concourse',status:'NEW',summary:'Massenanfall von Verletzten nach Zugunfall',createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['Zugunfall','Viele Verletzte','MCI aktiviert'],requiredServices:['FIRE','EMS','POLICE'],unitIds:[],patients:18,escalation:48,danger:72,objective:'MCI-Struktur aufbauen, Verletzte triagieren und Kliniken koordinieren',sections:[{id:'SEC-A',name:'Triage',objective:'Patienten priorisieren',unitIds:[]},{id:'SEC-B',name:'Transport',objective:'Kliniktransport koordinieren',unitIds:[]}]},
{id:'INC-1046',type:'HAZMAT',priority:2,location:{x:83,y:46},address:'Port Redwood Industrial Park · Gate 4',status:'NEW',summary:'Gefahrstoffaustritt in Industrieanlage',createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['Leck gemeldet','Dämpfe im Gebäude','Evakuierung erforderlich'],requiredServices:['FIRE','POLICE','EMS'],unitIds:[],patients:0,escalation:36,danger:84,objective:'Gefahrenbereich absperren, Stoff identifizieren und Dekontamination vorbereiten'}
],personnel,hospitals:[{id:'HOSP-01',name:'Redwood Memorial Hospital',capacity:80,occupied:54,trauma:true,burn:true,pediatric:true,helipad:true},{id:'HOSP-02',name:'Lakewood General',capacity:55,occupied:31,trauma:false,burn:false,pediatric:true,helipad:false},{id:'HOSP-03',name:'Port Redwood Medical Center',capacity:40,occupied:29,trauma:true,burn:false,pediatric:false,helipad:true}],finance:{revenueToday:8400,costsToday:3920,monthlyFunding:76000,maintenance:980,payroll:2420,fuel:520,upgrades:0,emergencyReserve:90000,fleetValue:720000},world:{population:128400,weather:'CLEAR',traffic:47,day:1,hour:8,minute:42,eventRate:1,powerLoad:38,nightFactor:0,emergencyLevel:1},roads:{nodes,edges},facilities,statistics:{calls:44,completed:37,patientsSaved:18,firesControlled:7,arrests:4,falseAlarms:3,averageResponse:4.8,majorIncidents:1,milesDriven:184,trainingHours:12},eventLog:['08:42 · Leitstelle übernommen','08:41 · INC-1043 · Patrol 12 alarmiert','08:39 · INC-1042 · Ambulance 3 vor Ort','08:38 · MCI-Protokoll verfügbar','08:37 · HazMat-Alarm im Industriegebiet']};
export function cloneState():GameState{return structuredClone(initialGameState)}
export function formatClock(minutes:number):string{const m=((minutes%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
export function getUnitStatusLabel(status:UnitStatus):string{return ({AVAILABLE:'VERFÜGBAR',BUSY:'BELEGT',EN_ROUTE:'AUF ANFAHRT',ON_SCENE:'VOR ORT',TRANSPORTING:'TRANSPORT',RETURNING:'RÜCKKEHR',OUT_OF_SERVICE:'AUSSER DIENST',MAINTENANCE:'WARTUNG'} as Record<UnitStatus,string>)[status]}
export function getIncidentStatusLabel(status:IncidentStatus):string{return ({NEW:'NEU',DISPATCHING:'DISPOSITION',RESPONDING:'AUF ANFAHRT',ON_SCENE:'VOR ORT',ACTIVE:'AKTIV',STABILIZED:'STABILISIERT',TRANSPORT:'TRANSPORT',COMPLETE:'ABGESCHLOSSEN',CANCELLED:'ABGEBROCHEN'} as Record<IncidentStatus,string>)[status]}
export function weatherLabel(w:Weather):string{return ({CLEAR:'Klar',CLOUDY:'Bewölkt',RAIN:'Regen',HEAVY_RAIN:'Starkregen',THUNDERSTORM:'Gewitter',FOG:'Nebel',SNOW:'Schnee',HEATWAVE:'Hitzewelle',WINDSTORM:'Sturm',FLOODING:'Hochwasser'} as Record<Weather,string>)[w]}
