import type { Incident } from '../game/state';
const label: Record<Incident['priority'], string> = { 1: 'LEBENSGEFAHR', 2: 'DRINGEND', 3: 'NORMAL', 4: 'NICHT DRINGEND' };
const icon: Record<string,string> = { MEDICAL:'✚', FIRE:'♨', TRAFFIC:'⚠', POLICE:'◉' };
export function IncidentPanel({ incidents }: { incidents: Incident[] }) {
  return <div className="panel"><div className="panel-title"><span>AKTIVE EINSÄTZE</span><b>{incidents.length}</b></div><div className="list">{incidents.map((i) => <article className={`incident p${i.priority}`} key={i.id}><div className="incident-icon">{icon[i.type] ?? '•'}</div><div className="incident-main"><div className="incident-head"><strong>{i.id}</strong><span className="priority">P{i.priority}</span></div><div className="incident-type">{i.type}</div><div className="muted">{i.address}</div><p>{i.summary}</p><div className="incident-foot"><span>{label[i.priority]}</span><span>{i.status}</span></div></div></article>)}</div></div>;
}