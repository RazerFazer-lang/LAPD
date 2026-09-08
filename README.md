# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Aktueller Stand

Die Anwendung enthält inzwischen eine integrierte spielbare Alpha-Grundlage für die im Master-Prompt definierten Systeme: Redwood State / Redwood Metro County, interaktive 2D-Karte, 911-Einsätze, dynamische Eskalationen, Police/Fire/EMS, Fahrzeugbewegung, Krankenhäuser, Finanzen, Personal, Schichten, Reputation, Statistiken, Admin-Konsole, Save/Load und WebSocket-Multiplayer.

## Start

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Server: `http://localhost:8787`

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
Der Node/WebSocket-Server ist autoritativ. Rollen umfassen Call Taker, Police Dispatcher, Fire Dispatcher, EMS Dispatcher, Supervisor, Manager und Administrator. Wichtige Actions werden serverseitig validiert.

### Save/Load
Der Browser besitzt versionierte lokale Savegame-Daten über `localStorage`. Die UI kann speichern und laden; die Admin-Konsole kann den Spielstand zurücksetzen.

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
