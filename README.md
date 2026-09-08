# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Produktionsbetrieb: Linux + AMP

Das Spiel ist für einen Linux-Server mit **AMP (CubeCoders Application Management Panel)** und dem dort verfügbaren **Node.js App Runner** vorbereitet. AMP unterstützt den Node.js App Runner unter Linux; dadurch kann der komplette Node.js-Webservice als verwaltete AMP-Instanz laufen.

Frontend und Multiplayer laufen gemeinsam über dieselbe Node.js-Instanz:

- HTTP: `http://<server>:<port>/`
- WebSocket: `ws://<server>:<port>/ws`
- Health Check: `http://<server>:<port>/health`
- Node bindet standardmäßig an `0.0.0.0`.
- Der Port wird über `PORT` von AMP bzw. der Umgebung gesetzt.

Für den aktuellen Entwicklungs-/Testbetrieb wird bewusst **kein TLS, kein HTTPS und kein WSS** vorausgesetzt.

## AMP-Setup

In AMP eine neue Instanz mit **Node.js App Runner** anlegen und das GitHub-Projekt verwenden:

```text
Repository: RazerFazer-lang/LAPD
Branch: main
Install: npm ci
Build: npm run build
Start: npm start
```

Die Anwendung muss auf dem von AMP zugewiesenen Port erreichbar sein. Der Server liest deshalb `PORT` und `HOST` aus der Umgebung.

Empfohlene Umgebungsvariablen:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=<AMP-Instanz-Port>
DISPATCH_TOKEN=<langer-zufälliger-token>
ADMIN_TOKEN=<anderer-langer-zufälliger-token>
SAVE_FILE=data/game-state.json
```

Der Client erkennt den Produktionshost automatisch und verbindet sich für Multiplayer mit `ws://<aktueller-host>/ws`.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Server: `http://localhost:8787`

Der lokale Client verwendet `ws://localhost:8787`. In Produktion wird automatisch der aktuelle HTTP-Host mit `/ws` verwendet.

## Build & Tests

```bash
npm test
npm run build
```

GitHub Actions führt Installation, Tests und Build automatisch bei Pushes auf `main` und bei Pull Requests aus.

## Multiplayer-Konfiguration

Für eine Multiplayer-Sitzung kopiere `.env.example` nach `.env` und setze zwei unterschiedliche, zufällige Tokens. Eine Rolle außer `911 Call Taker` erfordert `DISPATCH_TOKEN`; die Administratorrolle erfordert `ADMIN_TOKEN`.

Der Server speichert den versionierten Zustand atomar standardmäßig unter `data/game-state.json`. Dieser Pfad ist von Git ausgeschlossen und kann mit `SAVE_FILE` geändert werden.

## Architektur

- `src/game/state.ts` – versionierter, typisierter Game-State und Initialdaten
- `src/ui/RealMapView.tsx` – amerikanische 2D-Karte mit Straßen, Einsatz- und Fahrzeugmarkern
- `src/App.tsx` – CAD-Frontend, Dispatch, Incident Management, Management, Personal, Krankenhäuser, Statistik und Admin
- `src/styles.css` – Dark Command Center UI
- `server/index.ts` – autoritativer Node.js-WebSocket-/HTTP-Server mit Rollenprüfung, Action-Validierung und State-Broadcast
- `tests` – Domain-/Regressionstests

## Spielsysteme

### Karte & Welt
Redwood City, Lakewood, Pine Valley, Port Redwood und Desert Ridge werden in einer gemeinsamen fiktiven Region abgebildet. Das Kartenmodell enthält Hauptstraßen, Highways, Wasserflächen, Stadtbereiche, Gebäude-Blöcke, Karten-Layer und Fahrzeug-/Einsatzpositionen.

### 911 & Einsatzsimulation
Medizinische Notfälle, Feuer, Polizei, Verkehr, Gefahrgut und weitere Einsatztypen besitzen Priorität, Gefahrenwert, Eskalation, Status, Phasen, Ziele, Patienten und angeforderte Dienste.

### Einheiten
Police, Fire und EMS besitzen Status, Besatzung, Fähigkeiten, Geschwindigkeit, Wartungszustand, Treibstoff und Einsatzzuordnung. Einheiten können alarmiert, auf Anfahrt, vor Ort oder auf Rückkehr gesetzt werden.

### Management
Budget, Einnahmen, laufende Kosten, Payroll, Treibstoff, Wartung, Upgrades, Level und Reputation werden im Spielzustand geführt.

### Multiplayer
Der Node/WebSocket-Server ist autoritativ. Rollen, Dispatch, Einsatzabschluss, Fahrzeuge, Personal und relevante Aktionen werden serverseitig validiert und synchronisiert.

## Sicherheitshinweis

Der aktuelle AMP-Betrieb ist absichtlich HTTP-only. `ws://` und HTTP übertragen Daten unverschlüsselt. Das ist für den aktuellen Testbetrieb gewollt, sollte für einen öffentlichen Produktivbetrieb später wieder durch TLS/HTTPS/WSS abgesichert werden.
