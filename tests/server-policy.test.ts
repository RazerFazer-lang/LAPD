import { describe, expect, it } from 'vitest';
import { STARTER_VEHICLE_CALL, patchServerSource } from '../scripts/server-source-policy.mjs';

describe('server runtime policy',()=>{
  it('removes the free starter vehicle from both production and development runtimes',()=>{
    const source=`function build(){state.finance.upgrades+=cost;addVehicle(c,service,safePosition);}`;
    const patched=patchServerSource(source);
    expect(source).toContain(STARTER_VEHICLE_CALL);
    expect(patched).toBe('function build(){state.finance.upgrades+=cost;}');
    expect(patched).not.toContain(STARTER_VEHICLE_CALL);
  });

  it('fails closed when the expected server code changes unexpectedly',()=>{
    expect(()=>patchServerSource('function build(){state.finance.upgrades+=cost;}')).toThrow(/starter vehicle call/i);
  });
});
