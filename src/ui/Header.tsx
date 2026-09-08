import type { GameState } from '../game/state';
import { de } from '../i18n/de';
export function Header({ state }: { state: GameState }) {
  const h = Math.floor(state.simulationMinutes / 60).toString().padStart(2, '0');
  const m = (state.simulationMinutes % 60).toString().padStart(2, '0');
  return <header className="topbar"><div><div className="brand">{de.title}</div><div className="subtitle">{de.subtitle}</div></div><div className="top-metrics"><div><small>SIMULATION</small><strong>{h}:{m}</strong></div><div><small>{de.money.toUpperCase()}</small><strong>${state.center.money.toLocaleString('en-US')}</strong></div><div><small>{de.reputation.toUpperCase()}</small><strong>{state.center.reputation}%</strong></div><div><small>{de.calls.toUpperCase()}</small><strong>{state.incidents.length.toString().padStart(2,'0')}</strong></div></div></header>;
}