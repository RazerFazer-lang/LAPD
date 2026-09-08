import { useEffect, useMemo, useState } from 'react';
import { cloneState, getIncidentStatusLabel, getUnitStatusLabel, type GameState, type Service, type Unit } from './game/state';
import { play911Incoming, playDispatchAlert, playMutualAid, playRadioPing, playSiren, toggleAmbient } from './game/audio';
import { RealMapView } from './ui/RealMapView';
import './styles.css';
import './rebuild.css';
import './rebuild-extensions.css';

type Screen='MENU'|'GAME';
type Tab='CAD'|'AGENCY'|'RANKS'|'WORLD';
const meta:Record<Service,{name:string;station:string;color:string;cost:number}>={POLICE:{name:'Police Department',station:'Polizeiwache',color:'#1668b2',cost:75000},FIRE:{name:'Fire Department',station:'Feuerwache',color:'#c62832',cost:75000},EMS:{name:'Emergency Medical Services',station:'Rettungswache',color:'#087f5b',cost:65000}};
const ranks:Record<Service,string[]>={POLICE:['Police Recruit','Police Officer I','Police Officer II','Police Officer III','Senior Police Officer','Corporal','Sergeant','Lieutenant','Captain','Commander','Deputy Chief','Assistant Chief','Chief of Police'],FIRE:['Firefighter Recruit','Firefighter I','Firefighter II','Firefighter III','Engineer / Driver','Lieutenant','Captain','Battalion Chief','Division Chief','Deputy Chief','Assistant Chief','Fire Chief'],EMS:['EMT','Advanced EMT','Paramedic','Senior Paramedic','Field Training Officer','Field Supervisor','Lieutenant','Captain','Division Chief','Deputy Director','Assistant Director','EMS Director']};
const rankRewards:Record<Service,string[]>={POLICE:['Streifenwagen','zweite Einheit','mehr Personal','Traffic Unit','K9-Option','Sergeant-Führung','mehr Streifen','Detective/Investigation','Command Vehicle','Spezialfahrzeuge','größeres Budget','Sonderlagen','Behördenleitung'],FIRE:['Engine 1','zweite Engine','mehr Crew','Rescue Unit','Engineer-Posten','Lieutenant-Führung','Ladder Truck','Battalion Command','Sonderfahrzeuge','mehr Wachenbudget','Major Incident Command','Fire Chief Command'],EMS:['BLS Ambulance','ALS Ambulance','zweite Ambulance','mehr Crew','FTO-System','Supervisor Unit','mehr Fahrzeuge','MCI-Kapazität','Sondertransport','größeres Budget','Command Staff','EMS Command']};
// Public HTTP deployment: connect the game directly to the AMP server's HTTP + WebSocket endpoint.
// The same endpoint works for both the browser page and multiplayer WebSocket traffic.
const serverUrl=import.meta.env.VITE_SERVER_URL??(import.meta.env.DEV?`ws://${location.hostname}:7778`:`ws://gaminglive.mooo.com:7778`);
const ACCOUNT_TOKEN_KEY='ad-account-token-v1';
let ws:WebSocket|null=null;
function loadProfile(){try{return JSON.parse(localStorage.getItem('ad-profile-v5')??'null')}catch{return null}}
function persist(p:unknown){localStorage.setItem('ad-profile-v5',JSON.stringify(p))}
function cash(v:number){return `$${Math.max(0,Math.round(v)).toLocaleString('en-US')}`}
function dist(a:{x:number;y:number},b:{x:number;y:number}){return Math.hypot(a.x-b.x,a.y-b.y)}
function cap(t:string,l:number){return l>=5||!['MCI','ACTIVE_THREAT','MASS_FIRE','HAZMAT'].includes(t)}
function Tutorial({close}:{close:()=>void}){return <div className="tutorial-backdrop"><section className="tutorial"><small>AMERICAN DISPATCH · ERSTER EINSATZ</small><h2>Willkommen in deiner Leitstelle</h2><p>Du bist die Leitstelle. Es gibt keinen künstlichen Dispatcher, der für dich entscheidet. Du bekommst einen echten Notruf, entscheidest selbst über Ressourcen und baust deine Organisation Schritt für Schritt aus.</p><div className="tutorial-steps"><div><b>01 · Wache bauen</b><span>Öffne AGENCY, wähle Polizei, Fire oder EMS und starte den Bau. Danach ist ausschließlich der freie Kartenklick aktiv.</span></div><div><b>02 · Notruf</b><span>Neue Einsätze erscheinen als CALL-011, CALL-012 usw. Lies Adresse, Lage und Priorität und nimm den Notruf an.</span></div><div><b>03 · Selbst disponieren</b><span>Du entscheidest selbst, welche deiner Fahrzeuge fahren. Das Spiel übernimmt nicht deine Disposition.</span></div><div><b>04 · Ausbauen</b><span>Wachen können Stufe für Stufe wachsen: zusätzliche Fahrzeuge, Personal, Zellen, Apparate, Medical Capacity und Spezialoptionen.</span></div></div><button onClick={close}>TUTORIAL ABSCHLIESSEN</button></section></div>}
export default function App(){
 const saved=loadProfile();
 const [profile,setProfile]=useState<any>(()=>saved??{service:'FIRE',level:1,xp:0,money:100000,ownedServices:[],playerName:'Dispatcher'});
 const [screen,setScreen]=useState<Screen>('MENU');
 const [game,setGame]=useState<GameState>(()=>cloneState());
 const [connected,setConnected]=useState(false);
 const [playerId,setPlayerId]=useState('');
 const [tab,setTab]=useState<Tab>('CAD');
 const [selected,setSelected]=useState('');
 const [filter,setFilter]=useState<'ALL'|Service>('ALL');
 const [zoom,setZoom]=useState(1);
 const [notice,setNotice]=useState('');
 const [buildMode,setBuildMode]=useState<Service|null>(null);
 const [buildPending,setBuildPending]=useState(false);
 const [selectedRank,setSelectedRank]=useState(0);
 const [tutorial,setTutorial]=useState(!localStorage.getItem('ad-tutorial-v1'));
 const [dark,setDark]=useState(false);
 const currentService=profile.service as Service;
 const rank=ranks[currentService][Math.min(ranks[currentService].length-1,Math.max(0,profile.level-1))];
 const active=game.incidents.filter(i=>i.status!=='COMPLETE'&&i.status!=='CANCELLED'&&cap(i.type,profile.level)&&(!playerId||i.ownerId===playerId));
 const incident=game.incidents.find(i=>i.id===selected&&(!playerId||i.ownerId===playerId))??active[0];
 const myUnits:Unit[]=playerId?game.units.filter((u:any)=>u.ownerId===playerId):[];
 const otherPlayers=useMemo(()=>((game as any).__lobby?.players??[]).filter((p:any)=>p.id!==playerId),[game,playerId]);
 const ownedFacilities=(game.facilities??[]).filter((f:any)=>f.ownerId===playerId);
 const incoming=((game as any).__aid??[]).filter((a:any)=>a.toPlayerId===playerId&&a.status==='PENDING');
 const send=(m:unknown)=>{if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify(m));return true}return false};
 useEffect(()=>{
  if(screen!=='GAME')return;
  let closed=false;
  let retry:number|undefined;
  const connect=()=>{
   if(closed)return;
   try{
    ws?.close();
    ws=new WebSocket(serverUrl);
    ws.onopen=()=>{
     if(closed)return;
     setConnected(true);
     setNotice('CAD ONLINE · Leitstelle verbunden.');
     const accountToken=localStorage.getItem(ACCOUNT_TOKEN_KEY);
     ws?.send(JSON.stringify({type:'HELLO',name:profile.playerName,ready:true,...(accountToken?{accountToken}:{})}));
    };
    ws.onclose=()=>{
     if(!closed){setConnected(false);ws=null;retry=window.setTimeout(connect,1500)}
    };
    ws.onerror=()=>setConnected(false);
    ws.onmessage=e=>{
     try{
      const m=JSON.parse(e.data);
      if(m.type==='HELLO_ACK'){
       setPlayerId(m.playerId);
       if(typeof m.accountToken==='string'&&/^[a-f0-9]{64}$/.test(m.accountToken))localStorage.setItem(ACCOUNT_TOKEN_KEY,m.accountToken);
       if(Number.isFinite(m.budget))setProfile((p:any)=>{const n={...p,money:m.budget};persist(n);return n});
      }
      if(m.type==='STATE_SNAPSHOT'&&m.payload){
       const next=m.payload as GameState;
       (next as any).__lobby=m.lobby;
       (next as any).__budget=m.payload.__budget;
       setGame(next);
       if(Number.isFinite(m.payload.__budget))setProfile((p:any)=>{if(p.money===m.payload.__budget)return p;const n={...p,money:m.payload.__budget};persist(n);return n});
      }
      if(m.type==='ACTION_RESULT'){
       setBuildPending(false);
       if(m.ok){
        if(Number.isFinite(m.budget))setProfile((p:any)=>{const n={...p,money:m.budget};persist(n);return n});
        if(m.action==='BUILD_FACILITY'){setBuildMode(null);playDispatchAlert()}
        setNotice(m.message??'Aktion erfolgreich.');
       }else setNotice(m.message??'Aktion vom Server abgelehnt.');
      }
      if(m.type==='MUTUAL_AID_SNAPSHOT')setGame(s=>{const n=structuredClone(s) as any;n.__aid=m.payload??[];return n});
      if(m.type==='ERROR'){setBuildPending(false);setNotice(m.message??'Serverfehler')}
     }catch{setNotice('Ungültige Serverantwort')}
    };
   }catch{setConnected(false)}
  };
  connect();
  return()=>{closed=true;if(retry)window.clearTimeout(retry);ws?.close();ws=null;setConnected(false)};
 },[screen,profile.playerName]);
 useEffect(()=>{if(active.length&&(!selected||!active.some(i=>i.id===selected)))setSelected(active[0].id)},[active,selected]);
 useEffect(()=>{if(active.some(i=>i.status==='NEW'))play911Incoming()},[active.length]);
 useEffect(()=>{if(!buildMode)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!buildPending){setBuildMode(null);setNotice('Bau abgebrochen.')}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[buildMode,buildPending]);
 function open(){setScreen('GAME');setTab('CAD');setNotice('Du bist jetzt die Leitstelle. Baue deine erste Wache über AGENCY.')}function finishTutorial(){localStorage.setItem('ad-tutorial-v1','1');setTutorial(false)}
 function chooseService(s:Service){setProfile((p:any)=>{const n={...p,service:s};persist(n);return n})}
 function startBuild(s:Service){if(buildPending)return;if(profile.money<meta[s].cost){setNotice(`Nicht genug Startkapital für ${meta[s].station}.`);return}setBuildMode(s);setTab('CAD');if(!connected){setNotice(`${meta[s].station}: BAUMODUS AKTIV. Die CAD-Verbindung wird automatisch erneut versucht – klicke nach ONLINE direkt auf die Karte.`);return}setNotice(`${meta[s].station}: BAUMODUS AKTIV. Klicke genau einmal mit der linken Maustaste auf den gewünschten Kartenpunkt.`)}
 function place(p:{x:number;y:number}){if(!buildMode||buildPending)return;if(!connected){setNotice('CAD verbindet noch. Der Verbindungsversuch läuft automatisch weiter. Sobald oben ONLINE steht, erneut auf die Karte klicken.');return}const s=buildMode;setBuildPending(true);const ok=send({type:'BUILD_FACILITY',service:s,name:`${meta[s].station} ${ownedFacilities.filter((f:any)=>f.type===`${s==='POLICE'?'POLICE':s==='FIRE'?'FIRE':'EMS'}_STATION`).length+1}`,position:{x:Number(p.x.toFixed(4)),y:Number(p.y.toFixed(4))}});if(!ok){setBuildPending(false);setNotice('Server nicht verbunden.');return}setNotice('BAUANFRAGE GESENDET · Server prüft Standort und Budget …')}
 function cancelBuild(){if(buildPending)return;setBuildMode(null);setNotice('Bau abgebrochen.')}
 function accept(){if(incident&&send({type:'ACCEPT_CALL',incidentId:incident.id}))playRadioPing()}
 function dispatch(u:Unit){if(incident&&u.status==='AVAILABLE'&&send({type:'DISPATCH',unitId:u.id,incidentId:incident.id}))playRadioPing()}
 function auto(){const u=myUnits.filter(u=>u.status==='AVAILABLE').sort((a,b)=>incident?dist(a.position,incident.location)-dist(b.position,incident.location):0)[0];if(u)dispatch(u);else setNotice('Keine eigene Einheit verfügbar.')}
 function complete(){if(incident)send({type:'COMPLETE',incidentId:incident.id})}
 function upgrade(f:any,kind:string){if(send({type:'UPGRADE_FACILITY',facilityId:f.id,upgrade:kind}))setNotice('Ausbau wird vom Server geprüft …')}
 function requestAid(){const target=otherPlayers[0];if(!incident||!target)return setNotice('Keine andere Leitstelle verfügbar.');if(send({type:'REQUEST_MUTUAL_AID',incidentId:incident.id,toPlayerId:target.id,requestedServices:incident.requiredServices,requestedUnits:1,note:'Mutual Aid benötigt.'}))playMutualAid()}
 function answerAid(id:string,ok:boolean){if(send({type:'ANSWER_MUTUAL_AID',requestId:id,accept:ok}))playMutualAid()}
 if(screen==='MENU')return <main className={`rebuild-menu ${dark?'theme-dark':''}`}><section className="menu-content"><div className="menu-kicker"><i/>LIVE PUBLIC SAFETY SIMULATION</div><h1>AMERICAN<br/><strong>DISPATCH</strong></h1><p>911 · reale OSM-Karte · eigene Wachen · eigene Fahrzeuge · Multiplayer</p><button className="hero-button" onClick={open}>PLAY <span>→</span></button><div className="menu-options"><button onClick={()=>setNotice('Profil: Name und Karriere werden lokal gespeichert.')}>PROFILE</button><button onClick={()=>setDark(v=>!v)}>DARK MODE</button><button onClick={()=>setTutorial(true)}>TUTORIAL</button></div><div className="menu-status"><span><i/>SERVER READY</span><span>REDWOOD METRO · USA</span><span>NO PRESET UNITS</span></div>{notice&&<div className="toast">{notice}</div>}</section><footer>MAP DATA © OPENSTREETMAP CONTRIBUTORS · OPENFREEMAP</footer>{tutorial&&<Tutorial close={finishTutorial}/>}</main>;
 return <main className={`rebuild-game ${dark?'theme-dark':''}`}><header className="game-top"><button className="brand-mini" onClick={()=>{if(!buildMode)setScreen('MENU')}}><span>911</span><b>AMERICAN DISPATCH</b></button><div className="agency"><strong>{meta[currentService].name}</strong><small>{rank.toUpperCase()} · LEVEL {profile.level}</small></div><div className="top-stats"><span><small>XP</small><b>{profile.xp%500}/500</b></span><span><small>BUDGET</small><b>{cash(profile.money)}</b></span><span><small>911</small><b>{game.statistics.calls}</b></span><span><small>CAD</small><b className={connected?'online':'offline'}>{connected?'ONLINE':'OFFLINE'}</b></span></div></header><nav className="game-tabs">{(['CAD','AGENCY','RANKS','WORLD'] as Tab[]).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>{if(!buildMode)setTab(t)}}>{t}</button>)}<button onClick={()=>setDark(v=>!v)}>◐</button></nav>
 {tab==='CAD'&&<section className="cad-grid"><aside className="cad-panel calls"><div className="panel-title"><span>911 CALL QUEUE</span><b>{active.length}</b></div><div className="filter-row"><button className={filter==='ALL'?'active':''} onClick={()=>setFilter('ALL')}>ALL</button>{(['POLICE','FIRE','EMS'] as Service[]).map(s=><button key={s} className={filter===s?'active':''} onClick={()=>setFilter(s)}>{s}</button>)}</div><div className="call-list">{active.filter(i=>filter==='ALL'||i.requiredServices.includes(filter)).map(i=><button key={i.id} className={selected===i.id?'call selected':'call'} onClick={()=>{if(!buildMode)setSelected(i.id)}}><strong>{i.id}</strong><span>{i.status==='NEW'?'☎ INCOMING 911':getIncidentStatusLabel(i.status)}</span><small>{i.summary}</small><em>{i.address}</em></button>)}</div></aside><section className="map-wrap"><RealMapView state={game} units={myUnits} incident={incident} zoom={zoom} buildMode={buildMode} onPlace={place}/>{buildMode&&<div className="build-banner">BAUMODUS · {meta[buildMode].station.toUpperCase()} · KLICK AUF DIE KARTE · ESC ABBRECHEN</div>}<div className="map-controls"><button onClick={()=>setZoom(z=>Math.min(1.8,z+.15))}>+</button><button onClick={()=>setZoom(z=>Math.max(.7,z-.15))}>−</button></div></section><aside className="cad-panel detail"><div className="panel-title"><span>{incident?.id??'NO ACTIVE CALL'}</span><b>{incident?.priority?`P${incident.priority}`:'—'}</b></div>{incident?<><h2>{incident.summary}</h2><p className="address">{incident.address}</p><div className="detail-grid"><span>STATUS<b>{getIncidentStatusLabel(incident.status)}</b></span><span>PATIENTEN<b>{incident.patients}</b></span><span>GEFAHR<b>{incident.danger}%</b></span><span>ESCALATION<b>{Math.round(incident.escalation)}%</b></span></div><div className="required"><small>REQUIRED</small>{incident.requiredServices.map(s=><b key={s}>{s}</b>)}</div><div className="dispatch-list">{myUnits.map(u=><button key={u.id} disabled={u.status!=='AVAILABLE'} onClick={()=>dispatch(u)}><span>{u.callsign}</span><small>{u.status}</small></button>)}</div><div className="action-row"><button onClick={accept} disabled={incident.status!=='NEW'}>TAKE 911</button><button onClick={auto}>DISPATCH NEAREST</button><button onClick={complete}>CLOSE CALL</button><button onClick={requestAid} disabled={!otherPlayers.length}>MUTUAL AID</button></div></>:<div className="empty">Warte auf einen neuen 911-Notruf …</div>}</aside></section>}
 {tab==='AGENCY'&&<section className="agency-page"><div className="agency-hero"><small>BUILD YOUR AGENCY</small><h2>Deine Organisation beginnt bei null.</h2><p>Wähle einen Dienst, baue eine Wache auf der Karte und entwickle deine Leitstelle mit echten Budgetentscheidungen.</p></div><div className="service-cards">{(['POLICE','FIRE','EMS'] as Service[]).map(s=><article key={s} className={currentService===s?'selected':''}><div className="service-accent" style={{background:meta[s].color}}/><h3>{meta[s].name}</h3><p>Startwache · Fahrzeug · eigene Einsatzkette</p><strong>{cash(meta[s].cost)}</strong><div><button onClick={()=>chooseService(s)}>SELECT</button><button onClick={()=>startBuild(s)} disabled={!connected||buildPending}>BUILD</button></div></article>)}</div><div className="facility-grid">{ownedFacilities.map((f:any)=><article key={f.id}><small>{f.type}</small><h3>{f.name}</h3><span>LEVEL {f.level}</span><div className="upgrade-grid">{['FLEET','STAFF','CELLS','APPARATUS','MEDICAL','STORAGE'].map(k=><button key={k} onClick={()=>upgrade(f,k)}>{k}<small>{cash(({FLEET:35000,STAFF:25000,CELLS:30000,APPARATUS:45000,MEDICAL:40000,STORAGE:20000} as any)[k])}</small></button>)}</div></article>)}</div></section>}
 {tab==='RANKS'&&<section className="ranks-page"><div className="agency-hero"><small>CAREER PROGRESSION</small><h2>{meta[currentService].name}</h2><p>Jeder Dienst hat eine eigene amerikanische Rangstruktur. Fortschritt schaltet neue taktische und organisatorische Optionen frei.</p></div><div className="rank-layout"><div className="rank-list">{ranks[currentService].map((r,i)=><button key={r} className={selectedRank===i?'selected':''} onClick={()=>setSelectedRank(i)}><span>{String(i+1).padStart(2,'0')}</span><b>{r}</b><small>{i<profile.level?'UNLOCKED':`LEVEL ${i+1}`}</small></button>)}</div><article className="rank-detail"><small>RANK {selectedRank+1}</small><h2>{ranks[currentService][selectedRank]}</h2><p>Freigabe: {rankRewards[currentService][selectedRank]??'Command privileges'}</p><div className="rank-progress"><span style={{width:`${Math.min(100,Math.max(8,(profile.xp%500)/5))}%`}}/></div><strong>{profile.xp%500} / 500 XP</strong></article></div></section>}
 {tab==='WORLD'&&<section className="world-page"><div className="agency-hero"><small>MULTIPLAYER OPERATIONS</small><h2>REDWOOD METRO · USA</h2><p>Gemeinsame Leitstellen-Lobby mit bis zu 16 Spielern. Deine Fahrzeuge und dein Budget bleiben deinem Account zugeordnet.</p></div><div className="world-grid"><article><small>LOBBY</small><h3>REDWOOD-1</h3><b>{((game as any).__lobby?.players??[]).length} / 16</b></article>{otherPlayers.map((p:any)=><article key={p.id}><small>DISPATCHER</small><h3>{p.name}</h3><b>ONLINE</b></article>)}{incoming.map((a:any)=><article key={a.id}><small>MUTUAL AID</small><h3>{a.fromName}</h3><p>{a.incidentSummary}</p><button onClick={()=>answerAid(a.id,true)}>ACCEPT</button><button onClick={()=>answerAid(a.id,false)}>DECLINE</button></article>)}</div></section>}
 {notice&&<div className="game-toast">{notice}</div>}
 </main>;
}
