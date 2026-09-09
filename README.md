# AMERICAN DISPATCH

**Emergency Communications Simulator** – ein browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Aktueller Systemumfang

Das Projekt ist als echte Simulationsbasis aufgebaut und trennt Frontend, Spielzustand, datengetriebene Kataloge, Simulation, Audio, Multiplayer-Server und UI. Kernsysteme des Master-Prompts sind vorbereitet bzw. implementiert:

- Redwood State mit Redwood Metro County und fünf klar getrennten Stadt-/Regionsprofilen
- 2D-Kartensystem mit Straßen, POIs, Wachen, Krankenhäusern und beweglichen Einheiten
- Polizei, Fire Department und EMS mit amerikanischen Fahrzeugtypen
- datengetriebener Incident-Katalog mit Medical, Fire, Police, Traffic, Hazmat, Wildfire, Aviation, Rail und MCI
- priorisierte 911-Call-Queue und dynamische Einsatzphasen/Eskalation
- Straßenrouting mit Verkehrseinfluss und ETA-Grundlage
- Fahrzeuglebenszyklus: Available → En Route → On Scene → Returning → Available sowie Maintenance/Out of Service
- Krankenhäuser mit Kapazität und Spezialversorgung
- Wetter-, Tageszeit- und Verkehrssimulation
- Budget, Einnahmen, Ausgaben, Fuhrpark- und Ausbaukosten
- XP, Level, Reputation und Ausbauten
- Dispatcher-Rollenmodell und serverseitige Berechtigungsprüfung
- Multiplayer-Lobby-Synchronisation über WebSocket
- Mutual-Aid/Amtshilfe-Grundsystem
- persistente Accounts und versionierter Game-State als JSON-Dateien
- Autosave und Crash-/Shutdown-Sicherung
- serverseitige Rate Limits und Eingabevalidierung
- zentrale deutsche/englische Übersetzungsarchitektur
- automatisierte Tests für Build-Regeln, State, Server-Sicherheitsrichtlinien und Simulation
- Premium-Dark-CAD-Oberfläche mit responsivem Desktop-Layout

## Architektur

```text
src/
├── App.tsx
├── game/
│   ├── state.ts          # serialisierbarer Kernzustand
│   ├── catalog.ts        # Units, Incidents, Regionen, Rollen, Wetter, Schwierigkeit
│   ├── simulation.ts      # Welt-/Incident-Simulation und Dispatch-Metriken
│   ├── build.ts           # Bauvalidierung und Stationsregeln
│   └── audio.ts           # zentrale Audio-Steuerung
├── i18n/
│   ├── de.ts
│   ├── en.ts
│   └── index.ts
└── ui/
    ├── RealMapView.tsx
    ├── IncidentPanel.tsx
    ├── UnitPanel.tsx
    └── Header.tsx

server/
└── index.ts               # autoritativer Multiplayer-/Simulationsserver
```

Neue Einheiten und Einsatzarten werden primär über `src/game/catalog.ts` definiert. Dadurch kann die Spielwelt wachsen, ohne die komplette Engine umzubauen.

## AMP / Linux Produktionsbetrieb

Das Projekt ist für **CubeCoders AMP – NodeJS App Runner** vorbereitet. AMP lädt das Git-Repository und synchronisiert es vor jedem Start mit `main`, damit die laufende Instanz nicht auf einer alten Version bleibt.

### AMP-Konfiguration

| AMP-Feld | Wert |
|---|---|
| **App Download Type** | `Git repo` |
| **App Download Source** | `https://github.com/RazerFazer-lang/LAPD.git` |
| **Git Repo Branch** | `main` |
| **Node.js Release Stream** | `24` |
| **Node.js Version** | `24.x` / aktuelle Node-24-Version |
| **npm Install Type** | `None` |
| **Run App Setup Commands** | **AN** |
| **App Setup Commands** | `node scripts/amp-setup.mjs` |
| **Run App Pre-start Commands** | **AN** |
| **App Pre-start Commands** | `node scripts/amp-update.mjs` |
| **App Name** | `dist/server/index.js` |

`amp-update.mjs` führt vor jedem Start `git pull --ff-only origin main`, `npm install` und den Produktions-Build aus. Das Produktions-Build erzeugt den Vite-Client und den kompilierten Node-Server gemeinsam.

## Netzwerk

Standardmäßig:

- `HOST=0.0.0.0`
- `PORT=7778`
- HTTP: `http://<server-ip>:7778`
- WebSocket: `ws://<server-ip>:7778/ws`
- Healthcheck: `http://<server-ip>:7778/health`

## Lokaler Test

```bash
npm install
npm run test
npm run build
npm start
```

Danach läuft das vollständige Paket unter `http://localhost:7778`.

Für die schnelle Entwicklungsansicht:

```bash
npm run dev
```

## Daten und Speicher

Der Server verwendet standardmäßig:

```text
data/game-state.json
 data/accounts.json
```

Beide Pfade können über `SAVE_FILE` und `ACCOUNTS_FILE` gesetzt werden. Der Server speichert zusätzlich bei Shutdown und regelmäßig automatisch.

## Rollen

Die Multiplayer-Rollen sind intern englisch und werden in der Oberfläche deutsch erklärt:

`CALL_TAKER` · `POLICE_DISPATCHER` · `FIRE_DISPATCHER` · `EMS_DISPATCHER` · `SUPERVISOR` · `MANAGER` · `ADMINISTRATOR`

Wichtige Serveraktionen werden nicht vom Client autorisiert, sondern nochmals auf dem Server geprüft.

## Qualitätsziel

Das Projekt verfolgt den Master-Prompt als fortlaufenden Produktionsauftrag: erst robuste Kernmechanik, dann zusätzliche Systeme, danach Polish und QA. Keine UI-Schaltfläche soll als fertige Funktion erscheinen, ohne dass eine echte Aktion dahinterliegt.
