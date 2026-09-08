import { useEffect, useState } from 'react';
import { initialGameState, type GameState } from './game/state';
import { de } from './i18n/de';
import { MapView } from './ui/MapView';
import { Header } from './ui/Header';
import { IncidentPanel } from './ui/IncidentPanel';
import { UnitPanel } from './ui/UnitPanel';
import './styles.css';

export default function App() {
  const [state, setState] = useState<GameState>(initialGameState);
  const [filter, setFilter] = useState<'ALL' | 'POLICE' | 'FIRE' | 'EMS'>('ALL');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => ({ ...prev, serverTime: Date.now(), simulationMinutes: (prev.simulationMinutes + 1) % (24 * 60) }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const incidents = state.incidents.slice().sort((a, b) => a.priority - b.priority);
  const units = filter === 'ALL' ? state.units : state.units.filter((unit) => unit.service === filter);

  return (
    <main className="app-shell">
      <Header state={state} />
      <div className="workspace">
        <aside className="left-column"><IncidentPanel incidents={incidents} /></aside>
        <section className="map-column"><MapView state={state} /></section>
        <aside className="right-column">
          <UnitPanel units={units} filter={filter} onFilterChange={setFilter} />
        </aside>
      </div>
      <footer className="statusbar"><span>● Server verbunden</span><span>Tick 1s</span><span>{de.center}</span><span>Phase 1 · Fundament</span></footer>
    </main>
  );
}