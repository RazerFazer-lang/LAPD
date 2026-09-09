import { describe, expect, it } from 'vitest';
import { patchServerSource } from '../scripts/server-source-policy.mjs';

const serverFixture=`function build(c:Client,service:Service,name:string,pos:MapPoint){return true}function dispatch(c:Client,uid:string,iid:string){return true}const wss=new WebSocketServer({noServer:true,maxPayload:MAX_PAYLOAD});setInterval(()=>{tick();broadcastState()},TICK);`;

describe('server runtime policy',()=>{
  it('accepts the authoritative dispatch runtime structure',()=>{
    const source=patchServerSource(serverFixture);
    expect(source).toContain('function build(c:Client,service:Service,name:string,pos:MapPoint)');
    expect(source).toContain('function dispatch(c:Client,uid:string,iid:string)');
  });

  it('does not rewrite production server source',()=>{
    expect(patchServerSource(serverFixture)).toBe(serverFixture);
  });

  it('fails closed when required runtime markers are missing',()=>{
    expect(()=>patchServerSource('function build(){return true}')).toThrow(/required runtime marker/i);
  });
});
