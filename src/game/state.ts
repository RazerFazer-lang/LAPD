export type Service = 'POLICE' | 'FIRE' | 'EMS';
export type UnitStatus = 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'ON_SCENE' | 'OUT_OF_SERVICE';

export interface MapPoint { x: number; y: number; }
export interface Unit { id: string; callsign: string; service: Service; status: UnitStatus; position: MapPoint; }
export interface Incident { id: string; type: string; priority: 1 | 2 | 3 | 4; location: MapPoint; address: string; status: 'NEW' | 'DISPATCHING' | 'RESPONDING' | 'ON_SCENE' | 'ACTIVE' | 'COMPLETE'; summary: string; }
export interface DispatchCenter { id: string; name: string; money: number; reputation: number; }
export interface GameState { version: 1; serverTime: number; simulationMinutes: number; center: DispatchCenter; units: Unit[]; incidents: Incident[]; }

export const initialGameState: GameState = {
  version: 1,
  serverTime: Date.now(),
  simulationMinutes: 8 * 60 + 42,
  center: { id: 'dcc-001', name: 'Redwood Metro Dispatch', money: 250000, reputation: 72 },
  units: [
    { id: 'RPD-12', callsign: 'PATROL 12', service: 'POLICE', status: 'AVAILABLE', position: { x: 61, y: 43 } },
    { id: 'RFD-E7', callsign: 'ENGINE 7', service: 'FIRE', status: 'AVAILABLE', position: { x: 28, y: 58 } },
    { id: 'RFD-T2', callsign: 'TRUCK 2', service: 'FIRE', status: 'AVAILABLE', position: { x: 31, y: 56 } },
    { id: 'EMS-A3', callsign: 'AMBULANCE 3', service: 'EMS', status: 'BUSY', position: { x: 74, y: 27 } },
  ],
  incidents: [
    { id: 'INC-1042', type: 'MEDICAL', priority: 1, location: { x: 70, y: 30 }, address: '1457 Pine Street', status: 'ACTIVE', summary: 'Bewusstlose Person in Wohnhaus' },
    { id: 'INC-1043', type: 'TRAFFIC', priority: 2, location: { x: 48, y: 68 }, address: 'Redwood Highway / 8th Ave', status: 'RESPONDING', summary: 'Verkehrsunfall mit zwei Fahrzeugen' },
  ],
};