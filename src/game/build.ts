import type { FacilityType, MapPoint, Service } from './state';

export const STATION_COST: Record<Service, number> = { POLICE: 75000, FIRE: 75000, EMS: 65000 };
export const STATION_TYPE: Record<Service, FacilityType> = { POLICE: 'POLICE_STATION', FIRE: 'FIRE_STATION', EMS: 'EMS_STATION' };
export const STATION_NAME: Record<Service, string> = { POLICE: 'Police Station', FIRE: 'Fire Station', EMS: 'Rettungswache' };

export function isValidBuildPosition(position: unknown): position is MapPoint {
  if (!position || typeof position !== 'object') return false;
  const p = position as Record<string, unknown>;
  const x = p.x;
  const y = p.y;
  return typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100
    && typeof y === 'number' && Number.isFinite(y) && y >= 0 && y <= 100;
}

export function stationType(service: Service): FacilityType {
  return STATION_TYPE[service];
}
