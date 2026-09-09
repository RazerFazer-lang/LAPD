const REQUIRED_SERVER_MARKERS=[
  "function newLobby(c:Client,name:string,isPrivate:boolean,password:string,maxPlayers:number,difficulty:Difficulty)",
  "case'CREATE_LOBBY':",
  "case'JOIN_LOBBY':",
  "case'LEAVE_LOBBY':",
  "const wss=new WebSocketServer({noServer:true,maxPayload:MAX_PAYLOAD})",
  "setInterval(()=>{for(const s of sessions.values())",
];
export function patchServerSource(source){
  for(const marker of REQUIRED_SERVER_MARKERS){
    if(!source.includes(marker))throw new Error(`Server source guard: required runtime marker missing: ${marker.slice(0,100)}`);
  }
  return source;
}
