# American Dispatch

2D-Multiplayer-Leitstellensimulation im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Phase 1
Die erste Ausbaustufe enthält die technische Basis aus React + TypeScript + Vite, einen getrennten Node/WebSocket-Server, einen typisierten zentralen Game-State, eine erste Redwood-Kartenansicht und die CAD-Grundoberfläche.

## Start
```bash
npm install
npm run dev
```

Frontend: http://localhost:5173
Server: http://localhost:8787

## Build & Tests
```bash
npm run build
npm test
```

## Architektur
- `src/game` – Simulationszustand und Modelle
- `src/ui` – CAD- und Kartenoberfläche
- `src/i18n` – Übersetzungen
- `server` – autoritativer Multiplayer-Server-Grundstein
- `tests` – Regressionstests

Die Systeme sind von Anfang an so strukturiert, dass spätere Phasen für Karte, Einheiten, Einsätze, Routing, Wirtschaft, Multiplayer und Simulation ergänzt werden können.