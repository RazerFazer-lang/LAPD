import { describe, expect, it } from 'vitest';
import { STATION_COST, STATION_NAME, stationType, isValidBuildPosition } from '../src/game/build';

describe('station construction rules',()=>{
  it('maps every service to exactly one station type',()=>{
    expect(stationType('POLICE')).toBe('POLICE_STATION');
    expect(stationType('FIRE')).toBe('FIRE_STATION');
    expect(stationType('EMS')).toBe('EMS_STATION');
  });
  it('keeps the intended starting prices and names',()=>{
    expect(STATION_COST).toEqual({POLICE:75000,FIRE:75000,EMS:65000});
    expect(STATION_NAME.POLICE).toBe('Police Station');
    expect(STATION_NAME.FIRE).toBe('Fire Station');
    expect(STATION_NAME.EMS).toBe('Rettungswache');
  });
  it('accepts only normalized map positions from 0 to 100',()=>{
    expect(isValidBuildPosition({x:0,y:0})).toBe(true);
    expect(isValidBuildPosition({x:50,y:50})).toBe(true);
    expect(isValidBuildPosition({x:100,y:100})).toBe(true);
    expect(isValidBuildPosition({x:-1,y:50})).toBe(false);
    expect(isValidBuildPosition({x:50,y:101})).toBe(false);
    expect(isValidBuildPosition({x:NaN,y:50})).toBe(false);
    expect(isValidBuildPosition(null)).toBe(false);
  });
});
