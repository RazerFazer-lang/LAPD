export const STARTER_VEHICLE_CALL='state.finance.upgrades+=cost;addVehicle(c,service,safePosition);';
const CONNECTION_ID_INIT="const c:Client={id:`player-${randomUUID()}`,name:'Dispatcher',ready:false,accountToken:'',remoteAddress};";
const CONNECTION_ID_STABLE="const c:Client={id:'',name:'Dispatcher',ready:false,accountToken:'',remoteAddress};";
const HELLO_ACCOUNT_BLOCK="if(existing){c.accountToken=existing.token;c.name=existing.name}else{c.name=cleanName(m.name);const account=accountFor(c);account.name=c.name}";
const HELLO_ACCOUNT_BLOCK_STABLE="if(existing){const provisionalToken=c.accountToken;c.accountToken=existing.token;c.id=`player-${existing.token}`;c.name=existing.name;if(provisionalToken&&provisionalToken!==existing.token)accounts.delete(provisionalToken)}else{c.name=cleanName(m.name)}";
const INITIAL_ID_MARKER="c.name=initial.name;send(socket,{type:'HELLO_ACK',playerId:c.id";
const INITIAL_ID_STABLE="c.id=`player-${initial.token}`;c.name=initial.name;send(socket,{type:'HELLO_ACK',playerId:c.id";

export function patchServerSource(source){
  let patched=source;
  if(!patched.includes(STARTER_VEHICLE_CALL))
    throw new Error('Server source guard: expected starter vehicle call was not found. Refusing to build/run an unexpected server.');
  patched=patched.replace(STARTER_VEHICLE_CALL,'state.finance.upgrades+=cost;');
  if(!patched.includes(CONNECTION_ID_INIT))
    throw new Error('Server source guard: connection identity initialization changed unexpectedly.');
  patched=patched.replace(CONNECTION_ID_INIT,CONNECTION_ID_STABLE);
  if(!patched.includes(INITIAL_ID_MARKER))
    throw new Error('Server source guard: initial account identity block changed unexpectedly.');
  patched=patched.replace(INITIAL_ID_MARKER,INITIAL_ID_STABLE);
  if(!patched.includes(HELLO_ACCOUNT_BLOCK))
    throw new Error('Server source guard: account handshake block changed unexpectedly.');
  patched=patched.replace(HELLO_ACCOUNT_BLOCK,HELLO_ACCOUNT_BLOCK_STABLE);
  const helloAccountMarker="const account=accountFor(c);if(typeof m.name==='string'&&!existing)account.name=c.name=cleanName(m.name);account.lastSeen=Date.now();c.ready=m.ready===true;";
  if(!patched.includes(helloAccountMarker))
    throw new Error('Server source guard: HELLO account update block changed unexpectedly.');
  patched=patched.replace(helloAccountMarker,"const account=accountFor(c);if(!existing)c.id=`player-${account.token}`;if(typeof m.name==='string'&&!existing)account.name=c.name=cleanName(m.name);account.lastSeen=Date.now();c.ready=m.ready===true;");
  return patched;
}
