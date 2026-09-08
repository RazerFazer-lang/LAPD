import type { FacilityType, MapPoint, Service } from './state';

export const STATION_COST: Record<Service, number> = { POLICE: 75000, FIRE: 75000, EMS: 65000 };
export const STATION_TYPE: Record<Service, FacilityType> = { POLICE: 'POLICE_STATION', FIRE: 'FIRE_STATION', EMS: 'EMS_STATION' };
export const STATION_NAME: Record<Service, string> = { POLICE: 'Police Station', FIRE: 'Fire Station', EMS: 'Rettungswache' };

export function isValidBuildPosition(position: unknown): position is MapPoint {
  const p = position as Partial<MapPoint> | null;
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
}

export function stationType(service: Service): FacilityType {
  return STATION_TYPE[service];
}
