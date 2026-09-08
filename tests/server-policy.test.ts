import { describe, expect, it } from 'vitest';
import { STARTER_VEHICLE_CALL, patchServerSource } from '../scripts/server-source-policy.mjs';

const serverFixture=`const c:Client={id:\`player-\${randomUUID()}\`,name:'Dispatcher',ready:false,accountToken:'',remoteAddress};function build(){state.finance.upgrades+=cost;addVehicle(c,service,safePosition);}if(existing){c.accountToken=existing.token;c.name=existing.name}else{c.name=cleanName(m.name);const account=accountFor(c);account.name=c.name}const account=accountFor(c);if(typeof m.name==='string'&&!existing)account.name=c.name=cleanName(m.name);account.lastSeen=Date.now();c.ready=m.ready===true;`;

describe('server runtime policy',()=>{
  it('removes the free starter vehicle from both production and development runtimes',()=>{
    const patched=patchServerSource(serverFixture);
    expect(patched).not.toContain(STARTER_VEHICLE_CALL);
    expect(patched).toContain("const c:Client={id:'',name:'Dispatcher'");
  });

  it('stabilizes account ownership across reconnects',()=>{
    const patched=patchServerSource(serverFixture);
    expect(patched).toContain('c.id=`player-${existing.token}`');
    expect(patched).toContain('if(!existing)c.id=`player-${account.token}`');
    expect(patched).toContain('accounts.delete(provisionalToken)');
  });

  it('fails closed when the expected server code changes unexpectedly',()=>{
    expect(()=>patchServerSource('function build(){state.finance.upgrades+=cost;}')).toThrow(/starter vehicle call/i);
  });
});
