import { createServer } from 'node:http';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { WebSocketServer, type WebSocket } from 'ws';
import { cloneState, formatClock, type GameState, type Role, type Service } from '../src/game/state';

const roles: Role[] = ['CALL_TAKER','POLICE_DISPATCHER','FIRE_DISPATCHER','EMS_DISPATCHER','SUPERVISOR','MANAGER','ADMIN'];
const dispatchToken = process.env.DISPATCH_TOKEN;
const adminToken = process.env.ADMIN_TOKEN;
const savePath = resolve(process.env.SAVE_FILE ?? 'data/game-state.json');
const clients = new Map<WebSocket, { id: string; name: string; role: Role }>();

function isGameState(value: unknown): value is GameState {
  const candidate = value as Partial<GameState> | null;
  return !!candidate && candidate.version === 2 && Array.isArray(candidate.units) && Array.isArray(candidate.incidents)
    && Array.isArray(candidate.personnel) && Array.isArray(candidate.hospitals) && !!candidate.center && !!candidate.finance && !!candidate.world;
}
function loadState(): GameState {
  try {
    const saved = JSON.parse(readFileSync(savePath, 'utf8')) as unknown;
    if (isGameState(saved)) return saved;
  } catch { /* No valid save exists yet; start a new dispatch center. */ }
  return cloneState();
}
let state: GameState = loadState();
let sequence = Math.max(0, ...state.incidents.map(incident => Number(incident.id.replace('INC-', '')) || 0)) + 1;
function persistState() {
  try {
    mkdirSync(dirname(savePath), { recursive: true });
    const temporaryPath = `${savePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(state), 'utf8');
    renameSync(temporaryPath, savePath);
  } catch (error) { console.error('Unable to persist game state', error); }
}

function broadcast(message: unknown) { const payload = JSON.stringify(message); for (const socket of clients.keys()) if (socket.readyState === socket.OPEN) socket.send(payload); }
function snapshot() { return { type: 'STATE_SNAPSHOT', payload: state }; }
function authorized(client: {role:Role}, roles:Role[]) { return roles.includes(client.role); }
function sendError(socket: WebSocket, message: string) { socket.send(JSON.stringify({ type: 'ERROR', message })); }
function roleForHello(requestedRole: unknown, token: unknown, requestedAdminToken: unknown): Role {
  if (!roles.includes(requestedRole as Role)) return 'CALL_TAKER';
  if (requestedRole === 'ADMIN') return adminToken && requestedAdminToken === adminToken ? 'ADMIN' : 'CALL_TAKER';
  return dispatchToken && token === dispatchToken ? requestedRole as Role : 'CALL_TAKER';
}
function dispatch(client:{role:Role}, unitId:string, incidentId:string) {
  if (!authorized(client,['SUPERVISOR','POLICE_DISPATCHER','FIRE_DISPATCHER','EMS_DISPATCHER','ADMIN'])) return false;
  const u=state.units.find(x=>x.id===unitId); const i=state.incidents.find(x=>x.id===incidentId);
  if(!u||!i||u.status!=='AVAILABLE') return false;
  if(client.role==='POLICE_DISPATCHER'&&u.service!=='POLICE' || client.role==='FIRE_DISPATCHER'&&u.service!=='FIRE' || client.role==='EMS_DISPATCHER'&&u.service!=='EMS') return false;
  u.status='EN_ROUTE'; u.target=i.location; u.assignedIncidentId=i.id; i.status='RESPONDING'; i.unitIds=[...new Set([...i.unitIds,u.id])];
  state.eventLog=[`${formatClock(state.simulationMinutes)} · ${u.callsign} → ${i.id}`,...state.eventLog].slice(0,18);
  return true;
}
function complete(client:{role:Role}, incidentId:string) {
  if(!authorized(client,['SUPERVISOR','ADMIN','EMS_DISPATCHER','FIRE_DISPATCHER','POLICE_DISPATCHER'])) return false;
  const i=state.incidents.find(x=>x.id===incidentId); if(!i||i.status==='COMPLETE'||i.status==='CANCELLED') return false;
  i.status='COMPLETE'; state.statistics.completed++; state.center.reputation=Math.min(100,state.center.reputation+0.35); state.finance.revenueToday+=500+i.priority*180;
  for(const u of state.units) if(i.unitIds.includes(u.id)){u.status='RETURNING';u.target={x:50,y:50};u.assignedIncidentId=undefined;}
  return true;
}
function buyAmbulance(client:{role:Role}) {
  const price=78000;
  if(!authorized(client,['MANAGER','ADMIN']) || state.center.money<price) return false;
  const number=state.units.filter(unit=>unit.service==='EMS').length+3;
  state.center.money-=price; state.finance.upgrades+=price;
  state.units.push({id:`EMS-A${number}`,callsign:`AMBULANCE ${number}`,service:'EMS',type:'ALS Ambulance',status:'AVAILABLE',position:{x:72,y:60},speed:1.9,crew:3,capabilities:['ALS','TRANSPORT'],maintenance:100,fuel:100});
  return true;
}
function hireDispatcher(client:{role:Role}) {
  const price=2500;
  if(!authorized(client,['MANAGER','ADMIN']) || state.center.money<price) return false;
  const number=state.personnel.length+1;
  state.center.money-=price; state.finance.payroll+=price;
  state.personnel.push({id:`P-${String(number).padStart(2,'0')}`,name:`Dispatcher ${number}`,role:'CALL_TAKER',experience:55,stress:12,salary:4800,performance:80,errorRate:6,shift:'AFTERNOON',active:true});
  return true;
}
function setWeather(client:{role:Role}, weather: unknown) {
  const valid=['CLEAR','CLOUDY','RAIN','HEAVY_RAIN','THUNDERSTORM','FOG','SNOW','HEATWAVE','WINDSTORM'];
  if(!authorized(client,['ADMIN']) || !valid.includes(weather as string)) return false;
  state.world.weather=weather as GameState['world']['weather']; return true;
}
function setTime(client:{role:Role}, minutes: unknown) {
  if(!authorized(client,['ADMIN']) || !Number.isInteger(minutes) || (minutes as number)<0 || (minutes as number)>=1440) return false;
  state.simulationMinutes=minutes as number; return true;
}
function releaseUnits(client:{role:Role}) {
  if(!authorized(client,['ADMIN'])) return false;
  for(const unit of state.units){unit.status='AVAILABLE';unit.assignedIncidentId=undefined;unit.target=undefined;}
  return true;
}
function addBudget(client:{role:Role}) {
  if(!authorized(client,['ADMIN'])) return false;
  state.center.money+=50000; return true;
}
function resetGame(client:{role:Role}) {
  if(!authorized(client,['ADMIN'])) return false;
  state=cloneState(); sequence=Math.max(0,...state.incidents.map(incident=>Number(incident.id.replace('INC-',''))||0))+1;
  return true;
}
function generate(client:{role:Role}) {
  if(!authorized(client,['SUPERVISOR','CALL_TAKER','ADMIN'])) return false;
  const types=[{type:'MEDICAL' as const,service:'EMS' as Service,name:'Bewusstlose Person'},{type:'FIRE' as const,service:'FIRE' as Service,name:'Rauchentwicklung'},{type:'POLICE' as const,service:'POLICE' as Service,name:'Einbruch'},{type:'TRAFFIC' as const,service:'POLICE' as Service,name:'Verkehrsunfall'},{type:'HAZMAT' as const,service:'FIRE' as Service,name:'Gefahrstoffaustritt'},{type:'WILDFIRE' as const,service:'FIRE' as Service,name:'Vegetationsbrand'}];
  const pick=types[Math.floor(Math.random()*types.length)]; const n=1050+sequence++; const id=`INC-${n}`; const location={x:12+Math.random()*76,y:10+Math.random()*80};
  state.incidents.push({id,type:pick.type,priority:(1+Math.floor(Math.random()*3)) as 1|2|3,location,address:['Pine Street','Market Avenue','Canyon Road','Harbor Drive'][Math.floor(Math.random()*4)]+' '+(100+Math.floor(Math.random()*1800)),status:'NEW',summary:pick.name,createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:[pick.name,'Weitere Kräfte erforderlich','Lage stabilisiert'],requiredServices:pick.type==='TRAFFIC'?['POLICE','EMS']:[pick.service],unitIds:[],patients:pick.type==='MEDICAL'?1:0,escalation:20+Math.random()*35,danger:20+Math.random()*70,objective:'Lage bewerten und passende Einheiten disponieren'});
  state.statistics.calls++; state.eventLog=[`${formatClock(state.simulationMinutes)} · ${id} · Neuer 911-Einsatz`,...state.eventLog].slice(0,18);
  return true;
}
function tick(){
  state.serverTime=Date.now(); state.simulationMinutes=(state.simulationMinutes+1)%1440; state.world.hour=Math.floor(state.simulationMinutes/60); state.world.minute=state.simulationMinutes%60;
  state.world.traffic=Math.max(8,Math.min(95,Math.round(45+Math.sin(state.simulationMinutes/55)*22+(state.world.weather==='RAIN'?12:0))));
  for(const i of state.incidents){ if(i.status==='COMPLETE'||i.status==='CANCELLED') continue; i.ageMinutes+=1/60; i.escalation=Math.min(100,i.escalation+0.05); if(i.escalation>78&&i.stageIndex<i.stages.length-1){i.stageIndex++;i.summary=i.stages[i.stageIndex];i.priority=Math.max(1,i.priority-1) as 1|2|3|4;} }
  for(const u of state.units){
    if((u.status!=='EN_ROUTE'&&u.status!=='RETURNING')||!u.target) continue;
    const d=Math.hypot(u.position.x-u.target.x,u.position.y-u.target.y);
    if(d<=0.7){
      u.position={...u.target};
      u.status=u.status==='RETURNING'?'AVAILABLE':'ON_SCENE';
      u.target=undefined;
    }else{
      const step=Math.min(d,u.speed/10); const r=step/d;
      u.position={x:u.position.x+(u.target.x-u.position.x)*r,y:u.position.y+(u.target.y-u.position.y)*r};
    }
  }
}

const http=createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({name:'American Dispatch',region:state.center.region,version:state.version,players:clients.size,status:'online'}));});
const wss=new WebSocketServer({server:http});
wss.on('connection',(socket)=>{
  const client={id:`player-${Date.now()}-${clients.size}`,name:'Dispatcher',role:'CALL_TAKER' as Role}; clients.set(socket,client); socket.send(JSON.stringify(snapshot()));
  socket.on('message',(raw)=>{try{const msg=JSON.parse(raw.toString()) as {type?:string;unitId?:string;incidentId?:string;name?:string;role?:Role;token?:string;adminToken?:string;weather?:string;minutes?:number}; let changed=false;
    if(msg.type==='HELLO'){
      client.name=typeof msg.name==='string'?msg.name.slice(0,32):client.name;
      client.role=roleForHello(msg.role,msg.token,msg.adminToken);
      socket.send(JSON.stringify({type:'SESSION',role:client.role,secured:Boolean(dispatchToken)}));
    }
    else if(msg.type==='DISPATCH'&&msg.unitId&&msg.incidentId){changed=dispatch(client,msg.unitId,msg.incidentId);}
    else if(msg.type==='COMPLETE'&&msg.incidentId){changed=complete(client,msg.incidentId);}
    else if(msg.type==='GENERATE_INCIDENT'){changed=generate(client);}
    else if(msg.type==='BUY_AMBULANCE'){changed=buyAmbulance(client);}
    else if(msg.type==='HIRE_DISPATCHER'){changed=hireDispatcher(client);}
    else if(msg.type==='SET_WEATHER'){changed=setWeather(client,msg.weather);}
    else if(msg.type==='SET_TIME'){changed=setTime(client,msg.minutes);}
    else if(msg.type==='RELEASE_UNITS'){changed=releaseUnits(client);}
    else if(msg.type==='ADD_BUDGET'){changed=addBudget(client);}
    else if(msg.type==='RESET_GAME'){changed=resetGame(client);}
    else if(msg.type==='PING'){socket.send(JSON.stringify({type:'PONG',serverTime:Date.now()})); return;}
    else { sendError(socket,'Unbekannte oder unvollständige Aktion'); return; }
    if(!changed && msg.type!=='HELLO') sendError(socket,'Aktion nicht autorisiert oder nicht möglich');
    if(changed) persistState();
    broadcast(snapshot());
  }catch{socket.send(JSON.stringify({type:'ERROR',message:'Ungültige Nachricht'}));}});
  socket.on('close',()=>clients.delete(socket));
});
setInterval(()=>{tick();broadcast(snapshot());},1000);
setInterval(persistState,60000);
const port=Number(process.env.PORT??8787); http.listen(port,()=>console.log(`American Dispatch server listening on :${port}`));
