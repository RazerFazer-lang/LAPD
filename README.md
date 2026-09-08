# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## AMP / Linux Produktionsbetrieb

Das Projekt ist für **CubeCoders AMP – NodeJS App Runner** vorbereitet. Die AMP-Konfiguration ist absichtlich so aufgebaut wie bei einer klassischen produktionsfertigen Node-App: AMP lädt das Git-Repository, führt einmalig das Setup-Skript aus und startet anschließend die bereits gebaute JavaScript-Datei.

### AMP-Konfiguration

| AMP-Feld | Wert |
|---|---|
| **App Download Type** | `Git repo` |
| **App Download Source** | `https://github.com/RazerFazer-lang/LAPD.git` |
| **Git Repo Branch** | `main` |
| **Git Repo Username** | leer |
| **Git Repo Password/Token** | leer |
| **Node.js Release Stream** | `24` |
| **Node.js Version** | `24.x` / aktuelle Node-24-Version |
| **npm Install Type** | `None` |
| **Run App Setup Commands** | **AN** |
| **App Setup Commands** | `node scripts/amp-setup.mjs` |
| **Run App Pre-start Commands** | **AUS** |
| **App Name** | `dist/server/index.js` |
| **App Installation Location** | leer lassen |
| **Node.js Command Line Arguments** | leer |
| **App Command Line Arguments** | leer |

Das Setup-Skript installiert die Abhängigkeiten und führt den Produktions-Build aus. Danach existiert die AMP-Startdatei `dist/server/index.js`.

### Netzwerk

Der Server bindet standardmäßig auf:

- `HOST=0.0.0.0`
- `PORT=7778`
- HTTP: `http://<server-ip>:7778`
- WebSocket: `ws://<server-ip>:7778/ws`
- Healthcheck: `http://<server-ip>:7778/health`

Falls AMP eigene Port-/Environment-Einstellungen erzwingt, können `HOST=0.0.0.0` und `PORT=7778` als App-Environment-Variablen gesetzt werden.

### Wichtig für AMP

Der Vite-Client und der Multiplayer-Server werden gemeinsam gebaut. Das Produktions-Build erzeugt:

```text
dist/
├── index.html
├── assets/
└── server/
    └── index.js
```

Damit kann AMP direkt `dist/server/index.js` starten. Der Node-Server liefert gleichzeitig das Frontend aus `dist/` und stellt den WebSocket-Endpunkt `/ws` bereit.

## Lokaler Test

Für die Entwicklung auf dem eigenen PC:

```bash
npm install
npm run dev
```

Danach ist die Vite-Oberfläche unter `http://localhost:5173` erreichbar. Für einen produktionsnahen lokalen Test:

```bash
npm install
npm run build
npm start
```

Dann läuft das komplette Spiel unter `http://localhost:7778`.
