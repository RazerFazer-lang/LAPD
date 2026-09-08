import { describe, expect, it } from 'vitest';
import { cloneState, formatClock, getIncidentStatusLabel, getUnitStatusLabel } from '../src/game/state';

describe('American Dispatch domain',()=>{
  it('creates a complete starting dispatch center',()=>{const s=cloneState(); expect(s.center.name).toBe('Redwood Metro Dispatch'); expect(s.center.region).toBe('Redwood Metro County'); expect(s.units.length).toBeGreaterThanOrEqual(8); expect(new Set(s.units.map(u=>u.service))).toEqual(new Set(['POLICE','FIRE','EMS']));});
  it('has valid hospital capacity and finance state',()=>{const s=cloneState(); expect(s.hospitals.every(h=>h.occupied<=h.capacity)).toBe(true); expect(s.center.money).toBeGreaterThan(0);});
  it('keeps all incident priorities in dispatch range',()=>{const s=cloneState(); expect(s.incidents.every(i=>i.priority>=1&&i.priority<=4)).toBe(true);});
  it('localizes operational statuses',()=>{expect(getUnitStatusLabel('EN_ROUTE')).toBe('AUF ANFAHRT'); expect(getIncidentStatusLabel('NEW')).toBe('NEU');});
  it('formats simulation clock across midnight',()=>{expect(formatClock(0)).toBe('00:00'); expect(formatClock(1440)).toBe('00:00'); expect(formatClock(1501)).toBe('01:01');});
});
