import type { GameState } from '../game/state';
const roads = [
  'M 0 18 H 100','M 0 36 H 100','M 0 54 H 100','M 0 72 H 100','M 8 0 C 28 30 22 62 31 100','M 42 0 C 48 25 47 66 52 100','M 72 0 C 66 28 77 58 69 100','M 90 0 C 84 25 88 66 83 100'
];
const highways=['M 0 84 C 28 75 58 88 100 78','M 17 0 C 36 20 53 30 76 42'];
const blocks=[
  [6,8,14,8],[24,7,13,10],[45,8,17,9],[69,7,19,11],[8,25,18,7],[31,24,15,8],[52,24,14,8],[73,25,18,8],
  [5,43,16,8],[27,42,18,9],[48,41,18,9],[72,43,19,9],[8,61,15,8],[28,60,16,10],[50,59,16,9],[72,60,19,9],[7,79,17,9],[32,78,14,9],[55,78,17,9],[77,79,14,9]
];
const cities=[{name:'REDWOOD CITY',x:43,y:15},{name:'LAKEWOOD',x:16,y:69},{name:'PORT REDWOOD',x:76,y:51},{name:'PINE VALLEY',x:12,y:34},{name:'DESERT RIDGE',x:75,y:89}];
export function MapView({state,zoom,onZoomChange,onIncidentSelect}:{state:GameState;zoom:number;onZoomChange:(z:number)=>void;onIncidentSelect:(id:string)=>void}){
 return <div className="map-shell"><div className="map-toolbar"><button onClick={()=>onZoomChange(Math.min(2.5,zoom+0.25))}>＋</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>onZoomChange(Math.max(.7,zoom-.25))}>−</button><button onClick={()=>onZoomChange(1)}>⌂</button><span className="map-layer">LAYERS · STRASSEN · POIs · EINSÄTZE · EINHEITEN</span></div><svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style={{transform:`scale(${zoom})`}}>
 <defs><pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="#21323d" strokeWidth=".15"/></pattern><filter id="glow"><feGaussianBlur stdDeviation=".18"/></filter></defs>
 <rect width="100" height="100" fill="#16242d"/><path d="M0 0 C13 22 8 47 15 67 C21 83 14 92 10 100 L0 100Z" fill="#103448"/><path d="M0 0 C12 22 7 48 15 68 C21 83 14 92 10 100" fill="none" stroke="#1c5068" strokeWidth="1.1"/><rect width="100" height="100" fill="url(#grid)" opacity=".7"/>
 {blocks.map((b,i)=><rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx=".8" fill={i%5===0?'#22323b':'#1e2d35'} stroke="#2d414d" strokeWidth=".25"/>)}
 {roads.map((d,i)=><g key={i}><path d={d} fill="none" stroke="#2a3943" strokeWidth="2.7"/><path d={d} fill="none" stroke="#58656d" strokeWidth="1.55"/><path d={d} fill="none" stroke="#9a9f9f" strokeWidth=".16" strokeDasharray="1.2 1.5"/></g>)}
 {highways.map((d,i)=><g key={i}><path d={d} fill="none" stroke="#111b21" strokeWidth="4.2"/><path d={d} fill="none" stroke="#d0aa43" strokeWidth=".32" strokeDasharray="1.6 1.6"/><path d={d} fill="none" stroke="#6a7780" strokeWidth="2.5"/></g>)}
 {cities.map(c=><g key={c.name}><text x={c.x} y={c.y} className="city-label">{c.name}</text></g>)}
 <text x="81" y="83" className="route-label">I-8</text><text x="46" y="86" className="route-label">HWY 101</text>
 {state.incidents.filter(i=>i.status!=='COMPLETE').map(i=><g key={i.id} transform={`translate(${i.location.x} ${i.location.y})`} className="map-click" onClick={()=>onIncidentSelect(i.id)}><circle r="2.3" fill={i.priority===1?'#d94f58':i.priority===2?'#c89435':'#627686'} opacity=".25" filter="url(#glow)"/><circle r="1.45" fill={i.priority===1?'#d94f58':i.priority===2?'#c89435':'#7891a0'} stroke="#eef6fb" strokeWidth=".28"/><text x="2" y="-.5" className="marker-label">{i.id}</text></g>)}
 {state.units.map(u=>{const c=u.service==='POLICE'?'#4e9be2':u.service==='FIRE'?'#dc5961':'#4ec68e';return <g key={u.id} transform={`translate(${u.position.x} ${u.position.y})`} className="unit-marker"><rect x="-1.5" y="-.8" width="3" height="1.6" rx=".35" fill={c} stroke="#fff" strokeWidth=".18"/><circle cx="-1" cy="1" r=".35" fill="#111"/><circle cx="1" cy="1" r=".35" fill="#111"/><text x="2.1" y=".4" className="unit-label">{u.callsign.replace('AMBULANCE','A').replace('PATROL','P').replace('ENGINE','E').replace('TRUCK','T').replace('BATTALION','B')}</text></g>})}
 </svg><div className="map-legend"><span><i className="legend-dot police"/>POLICE</span><span><i className="legend-dot fire"/>FIRE</span><span><i className="legend-dot ems"/>EMS</span><span><i className="legend-dot incident"/>911 CALL</span><span><i className="legend-dot highway"/>HIGHWAY</span></div><div className="map-coords">REDWOOD STATE · {state.world.weather} · TRAFFIC {state.world.traffic}%</div></div>;
}
