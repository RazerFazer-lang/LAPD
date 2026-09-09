import { describe, expect, it } from 'vitest';
import { INCIDENT_CATALOG, UNIT_CATALOG, CITIES } from '../src/game/catalog';
import { advanceWorld, calculateDispatchMetrics, generateIncident, transitionUnitStatus } from '../src/game/simulation';
import { cloneState } from '../src/game/state';

describe('American Dispatch simulation systems',()=>{
 it('has complete data-driven catalogs',()=>{
  expect(CITIES.length).toBeGreaterThanOrEqual(5);
  expect(INCIDENT_CATALOG.length).toBeGreaterThanOrEqual(10);
  expect(Object.keys(UNIT_CATALOG).length).toBeGreaterThanOrEqual(15);
  expect(INCIDENT_CATALOG.every(i=>i.stages.length>=3&&i.services.length>0)).toBe(true);
 });
 it('generates contextual incidents deterministically with injected rng',()=>{
  const state=cloneState();state.world.traffic=90;state.world.hour=18;
  const incident=generateIncident(state,'NORMAL',()=>.999);
  expect(incident.id).toMatch(/^CALL-/);expect(incident.address).toContain('RS');expect(incident.stages.length).toBeGreaterThanOrEqual(3);expect(incident.priority).toBeGreaterThanOrEqual(1);
 });
 it('advances world time and incident escalation without mutating source',()=>{
  const state=cloneState();state.incidents.push(generateIncident(state));const before=state.simulationMinutes;const next=advanceWorld(state,20,'HARD');
  expect(next).not.toBe(state);expect(next.simulationMinutes).toBe(before+20);expect(next.incidents[0].ageMinutes).toBe(20);expect(next.world.eventRate).toBeGreaterThan(0);
 });
 it('calculates dispatch metrics for a live command center',()=>{const state=cloneState();state.units=[{id:'u',callsign:'ENGINE 1',service:'FIRE',type:'Engine',status:'AVAILABLE',position:{x:10,y:10},speed:1,crew:4,capabilities:['FIRE_SUPPRESSION'],maintenance:100,fuel:100}];const m=calculateDispatchMetrics(state);expect(m.responseScore).toBe(100);expect(m.dispatchScore).toBe(100);expect(m.unitCoverage).toBe(100)});
 it('enforces unit state transitions',()=>{expect(transitionUnitStatus('AVAILABLE','DISPATCH')).toBe('EN_ROUTE');expect(transitionUnitStatus('EN_ROUTE','ARRIVE')).toBe('ON_SCENE');expect(transitionUnitStatus('ON_SCENE','COMPLETE')).toBe('RETURNING');expect(transitionUnitStatus('RETURNING','RETURN')).toBe('AVAILABLE');});
});
