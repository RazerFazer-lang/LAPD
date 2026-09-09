const REQUIRED_SERVER_MARKERS=[
  'function build(c:Client,service:Service,name:string,pos:MapPoint)',
  'function dispatch(c:Client,uid:string,iid:string)',
  'setInterval(()=>{tick();broadcastState()},TICK)',
  "const wss=new WebSocketServer({noServer:true,maxPayload:MAX_PAYLOAD})",
];
export function patchServerSource(source){
  for(const marker of REQUIRED_SERVER_MARKERS){
    if(!source.includes(marker))throw new Error(`Server source guard: required runtime marker missing: ${marker.slice(0,80)}`);
  }
  return source;
}
