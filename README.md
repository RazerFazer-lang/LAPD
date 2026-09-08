# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## AMP / Linux Produktionsbetrieb

Das Projekt ist für **CubeCoders AMP – NodeJS App Runner** vorbereitet. AMP lädt das Git-Repository und synchronisiert es vor jedem Start mit `main`, damit die laufende Instanz nicht auf einer alten UI-Version bleibt.

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
| **Run App Pre-start Commands** | **AN** |
| **App Pre-start Commands** | `node scripts/amp-update.mjs` |
| **App Name** | `dist/server/index.js` |
| **App Installation Location** | leer lassen |
| **Node.js Command Line Arguments** | leer |
| **App Command Line Arguments** | leer |

`amp-update.mjs` führt vor jedem Start `git pull --ff-only origin main`, `npm install` und den Produktions-Build aus. Dadurch werden neue GitHub-Versionen beim nächsten AMP-Neustart automatisch übernommen.

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

## GitHub-Spiel-Link

GitHub Pages dient als direkter Einstieg und öffnet die laufende HTTP-Spielinstanz. Der Multiplayer-Server selbst muss dafür auf AMP laufen.
