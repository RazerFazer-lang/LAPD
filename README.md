# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## ▶ Produktionsbetrieb

Das Spiel wird als Node.js-Webservice betrieben. Frontend und Multiplayer-WebSocket laufen über denselben HTTP-Host.

GitHub Pages ist kein Produktionshost mehr. Node.js liefert den Vite-Build direkt aus und stellt den Multiplayer-WebSocket unter `/ws` bereit.

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

Die Produktions-Client-Verbindung verwendet automatisch denselben HTTP-Host: `ws://<host>/ws`. Für den aktuellen Betrieb werden ausschließlich HTTP und `ws://` verwendet.

## Build & Tests

```bash
npm test
npm run build
```

GitHub Actions führt Installation, Tests und Build automatisch bei Pushes auf `main` und bei Pull Requests aus.

## Architektur

- `src/game/state.ts` – versionierter, typisierter Game-State und Initialdaten
- `src/ui/MapView.tsx` – prozedurale amerikanische 2D-Karte mit Straßen, Highways, Städten, Einsatz- und Fahrzeugmarkern
- `src/App.tsx` – CAD-Frontend, Dispatch, Incident Management, Management, Personal, Krankenhäuser, Statistik und Admin
- `src/styles.css` – Dark Command Center UI mit Desktop-/Laptop-Responsive Layout
- `server/index.ts` – autoritativer WebSocket-Server mit Rollenprüfung, Action-Validierung und State-Broadcast
- `src/i18n` – zentrale deutsche UI-Texte
- `tests` – Domain-/Regressionstests

## Implementierte Systemsäulen

### Karte & Welt
Redwood City, Lakewood, Pine Valley, Port Redwood und Desert Ridge werden in einer gemeinsamen fiktiven Region abgebildet. Das Kartenmodell enthält Hauptstraßen, Highways, Wasserflächen, Stadtbereiche, Gebäude-Blöcke, Karten-Layer und Fahrzeug-/Einsatzpositionen.

### 911 & Einsatzsimulation
Einsätze entstehen über eine gewichtete Ereignislogik. Medizinische Notfälle, Feuer, Polizei, Verkehr, Gefahrgut und Waldbrand sind enthalten. Einsätze besitzen Priorität, Gefahrenwert, Eskalation, Status, Phasen, Ziele, Patienten und angeforderte Dienste.

### Einheiten
Police, Fire und EMS besitzen Status, Besatzung, Fähigkeiten, Geschwindigkeit, Wartungszustand, Treibstoff und Einsatzzuordnung. Einheiten können alarmiert, auf Anfahrt, vor Ort, transportierend oder auf Rückkehr gesetzt werden.

### Management
Budget, Einnahmen, laufende Kosten, Payroll, Treibstoff, Wartung, Upgrades, Level und Reputation werden im Spielzustand geführt. Fahrzeuge und CAD-/Analytics-Upgrades können gekauft werden.

### Personal
Dispatcher besitzen Erfahrung, Performance, Stress, Fehlerquote, Gehalt und Schicht. Neue Mitarbeiter können im Spiel eingestellt werden.

### Krankenhäuser
Mehrere Häuser besitzen Kapazität, aktuelle Belegung, Trauma, Burn Unit, Pädiatrie und Helipad. Diese Daten stehen im Managementbereich live zur Verfügung.

### Multiplayer
Der Node/WebSocket-Server ist autoritativ. Rollen umfassen Call Taker, Police Dispatcher, Fire Dispatcher, EMS Dispatcher, Supervisor, Manager und Administrator. Rollen- und Admin-Tokens werden serverseitig geprüft; Dispatch, Abschluss, Personal, Fahrzeuge sowie Admin-Aktionen werden auf dem Server validiert und an alle Clients synchronisiert.

### Save/Load
Der Browser besitzt lokale Savegame-Daten für den Offline-Betrieb. Multiplayer-Sitzungen verwenden zusätzlich den atomar geschriebenen, versionierten Server-Spielstand; die Admin-Konsole kann diesen nur mit Administratorrechten zurücksetzen.

## Phasenplan

1. Fundament – abgeschlossen
2. Kartenengine – integriert
3. Einheiten – integriert
4. Einsatzengine – integriert
5. Routing-/Bewegungsgrundlage – integriert als Kartenbewegung; vollwertiges straßenbasiertes Routing ist der nächste Vertiefungsschritt
6. Wirtschaft – integriert
7. Multiplayer – autoritativer WebSocket-Kern integriert
8. Personal – integriert
9. Krankenhäuser – integriert
10. Wetter/Verkehr/Tag-Nacht – integriert
11. Großereignisse – Ereignistypen und Eskalationsarchitektur vorhanden
12. Polish – Command-Center-UI und Kartenvisualisierung integriert
13. QA – Unit-/Domain-Tests und CI integriert
14. Release – npm-basierter Build und Dokumentation vorhanden

## Entwicklungsregeln

Jede Erweiterung soll die bestehende Spielbarkeit erhalten. Neue Systeme werden in `src/game` typisiert modelliert, UI bleibt von Simulationsdaten getrennt und serverseitig relevante Aktionen werden validiert.
