import { describe, expect, it } from 'vitest';
import { cloneState, formatClock, getIncidentStatusLabel, getUnitStatusLabel } from '../src/game/state';

describe('American Dispatch domain',()=>{
  it('starts without preplaced player vehicles',()=>{const s=cloneState();expect(s.units).toHaveLength(0);expect(s.facilities?.some(f=>!!f.ownerId)).toBe(false);});
  it('has hospitals and a usable economy',()=>{const s=cloneState();expect(s.hospitals.every(h=>h.occupied<=h.capacity)).toBe(true);expect(s.center.money).toBeGreaterThan(0);});
  it('keeps the starter world clean for automatic 911 generation',()=>{const s=cloneState();expect(s.incidents).toHaveLength(0);expect(s.statistics.calls).toBe(0);});
  it('localizes operational statuses',()=>{expect(getUnitStatusLabel('EN_ROUTE')).toBe('ANFAHRT');expect(getUnitStatusLabel('RETURNING')).toBe('RÜCKKEHR');expect(getUnitStatusLabel('MAINTENANCE')).toBe('WARTUNG');expect(getIncidentStatusLabel('NEW')).toBe('NEUER NOTRUF');});
  it('formats simulation clock across midnight',()=>{expect(formatClock(0)).toBe('00:00');expect(formatClock(1440)).toBe('00:00');expect(formatClock(1501)).toBe('01:01');});
});
