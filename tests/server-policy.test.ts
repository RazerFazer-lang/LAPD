import { describe, expect, it } from 'vitest';
import { patchServerSource } from '../scripts/server-source-policy.mjs';

const serverFixture=`function newLobby(c:Client,name:string,isPrivate:boolean,password:string,maxPlayers:number,difficulty:Difficulty){return true}case'CREATE_LOBBY':case'JOIN_LOBBY':case'LEAVE_LOBBY':const wss=new WebSocketServer({noServer:true,maxPayload:MAX_PAYLOAD});setInterval(()=>{for(const s of sessions.values()){}},TICK);`;

describe('server runtime policy',()=>{
  it('accepts the modular multi-lobby runtime structure',()=>expect(patchServerSource(serverFixture)).toBe(serverFixture));
  it('fails closed when required runtime markers are missing',()=>expect(()=>patchServerSource('function build(){return true}')).toThrow(/required runtime marker/i));
});
