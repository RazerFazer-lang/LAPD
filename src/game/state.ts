export type Service = 'POLICE' | 'FIRE' | 'EMS';
export type UnitStatus = 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'RETURNING' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
export type IncidentStatus = 'NEW' | 'DISPATCHING' | 'RESPONDING' | 'ON_SCENE' | 'ACTIVE' | 'STABILIZED' | 'TRANSPORT' | 'COMPLETE' | 'CANCELLED';
export type IncidentType = 'MEDICAL' | 'FIRE' | 'POLICE' | 'TRAFFIC' | 'HAZMAT' | 'WILDFIRE' | 'WEATHER' | 'AVIATION' | 'RAIL';
export type Role = 'CALL_TAKER' | 'POLICE_DISPATCHER' | 'FIRE_DISPATCHER' | 'EMS_DISPATCHER' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
export type Weather = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'THUNDERSTORM' | 'FOG' | 'SNOW' | 'HEATWAVE' | 'WINDSTORM';

export interface MapPoint { x: number; y: number; }
export interface Unit {
  id: string; callsign: string; service: Service; type: string; status: UnitStatus;
  position: MapPoint; target?: MapPoint; speed: number; crew: number;
  capabilities: string[]; maintenance: number; fuel: number; assignedIncidentId?: string;
}
export interface Incident {
  id: string; type: IncidentType; priority: 1 | 2 | 3 | 4; location: MapPoint; address: string;
  status: IncidentStatus; summary: string; createdAt: number; ageMinutes: number;
  stageIndex: number; stages: string[]; requiredServices: Service[]; unitIds: string[];
  patients: number; escalation: number; danger: number; objective: string;
}
export interface Personnel {
  id: string; name: string; role: Role; experience: number; stress: number; salary: number;
  performance: number; errorRate: number; shift: 'MORNING' | 'AFTERNOON' | 'NIGHT'; active: boolean;
}
export interface Hospital { id: string; name: string; capacity: number; occupied: number; trauma: boolean; burn: boolean; pediatric: boolean; helipad: boolean; }
export interface Finance { revenueToday: number; costsToday: number; monthlyFunding: number; maintenance: number; payroll: number; fuel: number; upgrades: number; }
export interface WorldState { population: number; weather: Weather; traffic: number; day: number; hour: number; minute: number; eventRate: number; powerLoad: number; }
export interface LobbyState { id: string; name: string; hostId: string; players: Array<{ id: string; name: string; role: Role; ready: boolean }>; maxPlayers: number; }
export interface GameState {
  version: 2; serverTime: number; simulationMinutes: number; center: { id: string; name: string; money: number; reputation: number; level: number; region: string };
  units: Unit[]; incidents: Incident[]; personnel: Personnel[]; hospitals: Hospital[]; finance: Finance; world: WorldState;
  selectedIncidentId?: string; eventLog: string[]; statistics: { calls: number; completed: number; patientsSaved: number; firesControlled: number; arrests: number; falseAlarms: number; averageResponse: number };
}

const u = (id: string, callsign: string, service: Service, type: string, x: number, y: number, capabilities: string[]): Unit => ({ id, callsign, service, type, status: 'AVAILABLE', position: { x, y }, speed: service === 'FIRE' ? 1.6 : service === 'EMS' ? 1.9 : 2.2, crew: service === 'POLICE' ? 2 : 3, capabilities, maintenance: 92, fuel: 88 });
const personnel: Personnel[] = [
  { id: 'P-01', name: 'Jordan Miller', role: 'SUPERVISOR', experience: 88, stress: 22, salary: 7200, performance: 94, errorRate: 2, shift: 'MORNING', active: true },
  { id: 'P-02', name: 'Alex Carter', role: 'CALL_TAKER', experience: 61, stress: 34, salary: 5100, performance: 86, errorRate: 5, shift: 'MORNING', active: true },
  { id: 'P-03', name: 'Morgan Reed', role: 'FIRE_DISPATCHER', experience: 74, stress: 28, salary: 5600, performance: 89, errorRate: 4, shift: 'MORNING', active: true },
  { id: 'P-04', name: 'Taylor Brooks', role: 'EMS_DISPATCHER', experience: 68, stress: 31, salary: 5400, performance: 91, errorRate: 3, shift: 'MORNING', active: true },
];
export const initialGameState: GameState = {
  version: 2, serverTime: Date.now(), simulationMinutes: 8 * 60 + 42,
  center: { id: 'dcc-001', name: 'Redwood Metro Dispatch', money: 250000, reputation: 72, level: 1, region: 'Redwood Metro County' },
  units: [
    u('RPD-12', 'PATROL 12', 'POLICE', 'Patrol', 61, 43, ['PATROL','TRAFFIC']), u('RPD-21', 'PATROL 21', 'POLICE', 'Patrol', 58, 49, ['PATROL']),
    u('RFD-E7', 'ENGINE 7', 'FIRE', 'Engine', 28, 58, ['FIRE_SUPPRESSION','RESCUE']), u('RFD-T2', 'TRUCK 2', 'FIRE', 'Ladder', 31, 56, ['LADDER','RESCUE']),
    u('RFD-B1', 'BATTALION 1', 'FIRE', 'Battalion Chief', 24, 55, ['COMMAND']), u('EMS-A3', 'AMBULANCE 3', 'EMS', 'ALS Ambulance', 74, 27, ['ALS','TRANSPORT']),
    u('EMS-A5', 'AMBULANCE 5', 'EMS', 'BLS Ambulance', 67, 58, ['BLS','TRANSPORT']), u('EMS-S1', 'EMS SUP 1', 'EMS', 'Supervisor', 72, 60, ['COMMAND','MCI']),
  ],
  incidents: [
    { id: 'INC-1042', type: 'MEDICAL', priority: 1, location: { x: 70, y: 30 }, address: '1457 Pine Street', status: 'ACTIVE', summary: 'Bewusstlose Person in Wohnhaus', createdAt: Date.now()-420000, ageMinutes: 7, stageIndex: 1, stages: ['Bewusstlos','Atemstillstand möglich','Reanimation läuft'], requiredServices: ['EMS','POLICE'], unitIds: ['EMS-A3'], patients: 1, escalation: 34, danger: 22, objective: 'Patient stabilisieren und transportieren' },
    { id: 'INC-1043', type: 'TRAFFIC', priority: 2, location: { x: 48, y: 68 }, address: 'Redwood Highway / 8th Ave', status: 'RESPONDING', summary: 'Verkehrsunfall mit zwei Fahrzeugen', createdAt: Date.now()-180000, ageMinutes: 3, stageIndex: 0, stages: ['Unfall mit zwei Fahrzeugen','Verkehr blockiert','Mögliche Verletzte'], requiredServices: ['POLICE','EMS'], unitIds: ['RPD-12'], patients: 2, escalation: 18, danger: 28, objective: 'Unfallstelle sichern und Verletzte versorgen' },
    { id: 'INC-1044', type: 'FIRE', priority: 2, location: { x: 54, y: 24 }, address: '820 Market Avenue', status: 'NEW', summary: 'Rauchentwicklung aus mehrstöckigem Gebäude', createdAt: Date.now(), ageMinutes: 0, stageIndex: 0, stages: ['Rauch aus Fenster','Flammen sichtbar','Personen im Gebäude'], requiredServices: ['FIRE','EMS'], unitIds: [], patients: 0, escalation: 42, danger: 51, objective: 'Brand eindämmen und Gebäude durchsuchen' },
  ],
  personnel, hospitals: [
    { id: 'HOSP-01', name: 'Redwood Memorial Hospital', capacity: 80, occupied: 54, trauma: true, burn: true, pediatric: true, helipad: true },
    { id: 'HOSP-02', name: 'Lakewood General', capacity: 55, occupied: 31, trauma: false, burn: false, pediatric: true, helipad: false },
    { id: 'HOSP-03', name: 'Port Redwood Medical Center', capacity: 40, occupied: 29, trauma: true, burn: false, pediatric: false, helipad: true },
  ], finance: { revenueToday: 8400, costsToday: 3920, monthlyFunding: 76000, maintenance: 980, payroll: 2420, fuel: 520, upgrades: 0 },
  world: { population: 128400, weather: 'CLEAR', traffic: 47, day: 1, hour: 8, minute: 42, eventRate: 1, powerLoad: 38 },
  eventLog: ['08:42 · Leitstelle übernommen','08:41 · INC-1043 · Patrol 12 alarmiert','08:39 · INC-1042 · Ambulance 3 vor Ort'],
  statistics: { calls: 42, completed: 37, patientsSaved: 18, firesControlled: 7, arrests: 4, falseAlarms: 3, averageResponse: 4.8 },
};

export function cloneState(): GameState { return structuredClone(initialGameState); }
export function formatClock(minutes: number): string { const m = ((minutes % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`; }
export function getUnitStatusLabel(status: UnitStatus): string { return ({ AVAILABLE:'VERFÜGBAR', BUSY:'BELEGT', EN_ROUTE:'AUF ANFAHRT', ON_SCENE:'VOR ORT', TRANSPORTING:'TRANSPORT', RETURNING:'RÜCKKEHR', OUT_OF_SERVICE:'AUSSER DIENST', MAINTENANCE:'WARTUNG' } as Record<UnitStatus,string>)[status]; }
export function getIncidentStatusLabel(status: IncidentStatus): string { return ({ NEW:'NEU', DISPATCHING:'DISPOSITION', RESPONDING:'AUF ANFAHRT', ON_SCENE:'VOR ORT', ACTIVE:'AKTIV', STABILIZED:'STABILISIERT', TRANSPORT:'TRANSPORT', COMPLETE:'ABGESCHLOSSEN', CANCELLED:'ABGEBROCHEN' } as Record<IncidentStatus,string>)[status]; }
export function weatherLabel(w: Weather): string { return ({ CLEAR:'Klar', CLOUDY:'Bewölkt', RAIN:'Regen', HEAVY_RAIN:'Starkregen', THUNDERSTORM:'Gewitter', FOG:'Nebel', SNOW:'Schnee', HEATWAVE:'Hitzewelle', WINDSTORM:'Sturm' } as Record<Weather,string>)[w]; }
