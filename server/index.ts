import { createServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { cloneState, formatClock, type GameState, type Role, type Service } from '../src/game/state.ts';

const state: GameState = cloneState();
const clients = new Map<WebSocket, { id: string; name: string; role: Role }>();
let sequence = 0;

function broadcast(message: unknown) { const payload = JSON.stringify(message); for (const socket of clients.keys()) if (socket.readyState === socket.OPEN) socket.send(payload); }
function snapshot() { return { type: 'STATE_SNAPSHOT', payload: state }; }
function authorized(client: {role:Role}, roles:Role[]) { return roles.includes(client.role); }
function nearestAvailable(service: Service, point:{x:number;y:number}) { return state.units.filter(u=>u.service===service&&u.status==='AVAILABLE').sort((a,b)=>Math.hypot(a.position.x-point.x,a.position.y-point.y)-Math.hypot(b.position.x-point.x,b.position.y-point.y))[0]; }
function dispatch(client:{role:Role}, unitId:string, incidentId:string) {
  if (!authorized(client,['SUPERVISOR','POLICE_DISPATCHER','FIRE_DISPATCHER','EMS_DISPATCHER','ADMIN'])) return;
  const u=state.units.find(x=>x.id===unitId); const i=state.incidents.find(x=>x.id===incidentId);
  if(!u||!i||u.status!=='AVAILABLE') return;
  if(client.role==='POLICE_DISPATCHER'&&u.service!=='POLICE' || client.role==='FIRE_DISPATCHER'&&u.service!=='FIRE' || client.role==='EMS_DISPATCHER'&&u.service!=='EMS') return;
  u.status='EN_ROUTE'; u.target=i.location; u.assignedIncidentId=i.id; i.status='RESPONDING'; i.unitIds=[...new Set([...i.unitIds,u.id])];
  state.eventLog=[`${formatClock(state.simulationMinutes)} · ${u.callsign} → ${i.id}`,...state.eventLog].slice(0,18);
}
function complete(client:{role:Role}, incidentId:string) {
  if(!authorized(client,['SUPERVISOR','ADMIN','EMS_DISPATCHER','FIRE_DISPATCHER','POLICE_DISPATCHER'])) return;
  const i=state.incidents.find(x=>x.id===incidentId); if(!i) return;
  i.status='COMPLETE'; state.statistics.completed++; state.center.reputation=Math.min(100,state.center.reputation+0.35); state.finance.revenueToday+=500+i.priority*180;
  for(const u of state.units) if(i.unitIds.includes(u.id)){u.status='RETURNING';u.target={x:50,y:50};u.assignedIncidentId=undefined;}
}
function generate(client:{role:Role}) {
  if(!authorized(client,['SUPERVISOR','CALL_TAKER','ADMIN'])) return;
  const types=[{type:'MEDICAL' as const,service:'EMS' as Service,name:'Bewusstlose Person'},{type:'FIRE' as const,service:'FIRE' as Service,name:'Rauchentwicklung'},{type:'POLICE' as const,service:'POLICE' as Service,name:'Einbruch'},{type:'TRAFFIC' as const,service:'POLICE' as Service,name:'Verkehrsunfall'},{type:'HAZMAT' as const,service:'FIRE' as Service,name:'Gefahrstoffaustritt'},{type:'WILDFIRE' as const,service:'FIRE' as Service,name:'Vegetationsbrand'}];
  const pick=types[Math.floor(Math.random()*types.length)]; const n=1050+sequence++; const id=`INC-${n}`; const location={x:12+Math.random()*76,y:10+Math.random()*80};
  state.incidents.push({id,type:pick.type,priority:(1+Math.floor(Math.random()*3)) as 1|2|3,location,address:['Pine Street','Market Avenue','Canyon Road','Harbor Drive'][Math.floor(Math.random()*4)]+' '+(100+Math.floor(Math.random()*1800)),status:'NEW',summary:pick.name,createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:[pick.name,'Weitere Kräfte erforderlich','Lage stabilisiert'],requiredServices:pick.type==='TRAFFIC'?['POLICE','EMS']:[pick.service],unitIds:[],patients:pick.type==='MEDICAL'?1:0,escalation:20+Math.random()*35,danger:20+Math.random()*70,objective:'Lage bewerten und passende Einheiten disponieren'});
  state.statistics.calls++; state.eventLog=[`${formatClock(state.simulationMinutes)} · ${id} · Neuer 911-Einsatz`,...state.eventLog].slice(0,18);
}
function tick(){
  state.serverTime=Date.now(); state.simulationMinutes=(state.simulationMinutes+1)%1440; state.world.hour=Math.floor(state.simulationMinutes/60); state.world.minute=state.simulationMinutes%60;
  state.world.traffic=Math.max(8,Math.min(95,Math.round(45+Math.sin(state.simulationMinutes/55)*22+(state.world.weather==='RAIN'?12:0))));
  for(const i of state.incidents){ if(i.status==='COMPLETE'||i.status==='CANCELLED') continue; i.ageMinutes+=1/60; i.escalation=Math.min(100,i.escalation+0.05); if(i.escalation>78&&i.stageIndex<i.stages.length-1){i.stageIndex++;i.summary=i.stages[i.stageIndex];i.priority=Math.max(1,i.priority-1) as 1|2|3|4;} }
  for(const u of state.units){ if(u.status!=='EN_ROUTE'||!u.target) continue; const d=Math.hypot(u.position.x-u.target.x,u.position.y-u.target.y); if(d<=0.7){u.position={...u.target};u.status='ON_SCENE';}else{const step=Math.min(d,u.speed/10);const r=step/d;u.position={x:u.position.x+(u.target.x-u.position.x)*r,y:u.position.y+(u.target.y-u.position.y)*r};} }
}

const http=createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({name:'American Dispatch',region:state.center.region,version:state.version,players:clients.size,status:'online'}));});
const wss=new WebSocketServer({server:http});
wss.on('connection',(socket)=>{
  const client={id:`player-${Date.now()}-${clients.size}`,name:'Dispatcher',role:'SUPERVISOR' as Role}; clients.set(socket,client); socket.send(JSON.stringify(snapshot()));
  socket.on('message',(raw)=>{try{const msg=JSON.parse(raw.toString()) as {type?:string;unitId?:string;incidentId?:string;name?:string;role?:Role}; if(msg.type==='HELLO'){client.name=typeof msg.name==='string'?msg.name.slice(0,32):client.name; if(msg.role&&['CALL_TAKER','POLICE_DISPATCHER','FIRE_DISPATCHER','EMS_DISPATCHER','SUPERVISOR','MANAGER','ADMIN'].includes(msg.role)) client.role=msg.role;}
    else if(msg.type==='DISPATCH'&&msg.unitId&&msg.incidentId) dispatch(client,msg.unitId,msg.incidentId);
    else if(msg.type==='COMPLETE'&&msg.incidentId) complete(client,msg.incidentId);
    else if(msg.type==='GENERATE_INCIDENT') generate(client);
    else if(msg.type==='PING') socket.send(JSON.stringify({type:'PONG',serverTime:Date.now()}));
    broadcast(snapshot());
  }catch{socket.send(JSON.stringify({type:'ERROR',message:'Ungültige Nachricht'}));}});
  socket.on('close',()=>clients.delete(socket));
});
setInterval(()=>{tick();broadcast(snapshot());},1000);
const port=Number(process.env.PORT??8787); http.listen(port,()=>console.log(`American Dispatch server listening on :${port}`));
