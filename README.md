# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Lokaler Test

**Wichtig:** GitHub kann keinen `localhost`-Server auf deinem PC starten. Der Link unten ist deshalb nur eine lokale Adresse für deinen eigenen Rechner.

### ▶ [LOCALHOST TEST](http://localhost:5173/)

Wenn du lokal testest, läuft die Entwicklungsoberfläche über Vite auf Port `5173`. Für diesen Frontend-Test brauchst du keinen AMP-Server und keinen öffentlichen Server.

## Produktionsbetrieb: Linux + AMP

Der Produktionsserver läuft als Node.js-Anwendung unter Linux und wird über AMP verwaltet.

- Node.js 24
- `npm install`
- Start: `npm start`
- Bind: `0.0.0.0`
- Standard-Port: `7778`
- HTTP + WebSocket: `ws://<server-ip>:7778/ws`
- Healthcheck: `http://<server-ip>:7778/health`

GitHub Pages ist nicht mehr der Produktionspfad.

## Feature-Reparatur

Die aktuelle Hauptversion repariert die Bedienung von AGENCY, BUILD, RANKS und WORLD sowie die XP-Anzeige nach abgeschlossenen Einsätzen.
