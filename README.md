# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## ▶ Linux-HTTP-Produktionsbetrieb

Das Produktionsziel ist ein Linux-Node.js-Webservice. Node.js liefert den Vite-Build direkt aus und stellt den Multiplayer-WebSocket unter `/ws` bereit. Für den aktuellen Betrieb werden ausschließlich HTTP und `ws://` verwendet.

## Aktueller Stand

Die Anwendung enthält inzwischen eine integrierte spielbare Alpha-Grundlage für die im Master-Prompt definierten Systeme: Redwood State / Redwood Metro County, interaktive 2D-Karte, 911-Einsätze, dynamische Eskalationen, Police/Fire/EMS, Fahrzeugbewegung, Krankenhäuser, Finanzen, Personal, Schichten, Reputation, Statistiken, Admin-Konsole, Save/Load und WebSocket-Multiplayer.

## Start

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Server: `http://localhost:8787`

### Multiplayer-Konfiguration

Für eine Multiplayer-Sitzung kopiere `.env.example` nach `.env` und setze zwei
unterschiedliche, zufällige Tokens. Eine Rolle außer `911 Call Taker` erfordert
`DISPATCH_TOKEN`; die Administratorrolle erfordert `ADMIN_TOKEN`. Der Client
wird beispielsweise mit `http://localhost:5173/?token=...` geöffnet; für
Administratorrechte ergänzt man `&adminToken=...`. Ohne gültiges Token bleibt
die Sitzung absichtlich auf die Call-Taker-Rolle begrenzt.

Der Server speichert den versionierten Zustand atomar standardmäßig unter
`data/game-state.json`, bei Aktionen sowie alle 60 Sekunden. Dieser Pfad ist
von Git ausgeschlossen und kann mit `SAVE_FILE` geändert werden.

Die Produktions-Client-Verbindung verwendet automatisch denselben HTTP-Host:
`ws://<host>/ws`.

## Build & Tests

```bash
npm test
npm run build
```

GitHub Actions führt Installation, Tests und Build automatisch bei Pushes auf `main` und bei Pull Requests aus.

## Architektur

- `src/game/state.ts` – versionierter, typisierter Game-State und Initialdaten
- `src/ui/RealMapView.tsx` – interaktive amerikanische 2D-Karte mit Straßen, Highways, Einsatz- und Fahrzeugmarkern
- `src/App.tsx` – CAD-Frontend, Dispatch, Incident Management und Multiplayer-Client
- `server/index.ts` – autoritativer Node.js-WebSocket- und HTTP-Server
- `src/i18n` – zentrale deutsche UI-Texte
- `tests` – Domain-/Regressionstests

## Produktionsmodell

Node.js läuft auf Linux und bindet an `0.0.0.0` sowie `PORT` aus der Umgebung. Der Server liefert `dist/` als SPA aus, beantwortet `/health` und `/api/health` und stellt WebSockets über denselben HTTP-Port bereit. Der Client verbindet sich produktiv mit `ws://<host>/ws`.

## Entwicklungsregeln

Jede Erweiterung soll die bestehende Spielbarkeit erhalten. Neue Systeme werden in `src/game` typisiert modelliert, UI bleibt von Simulationsdaten getrennt und serverseitig relevante Aktionen werden validiert.
