# American Dispatch

**Emergency Communications Simulator** – browserbasiertes 2D-Multiplayer-Leitstellenspiel im amerikanischen Stil mit deutscher Benutzeroberfläche.

## Produktionsbetrieb: Linux + AMP

Der Produktionsserver läuft als Node.js-Anwendung unter Linux und wird über AMP verwaltet.

- Node.js 24
- `npm install`
- Start: `npm start`
- Bind: `0.0.0.0`
- Standard-Port: `7778`
- HTTP + WebSocket: `ws://<server-ip>:7778/ws`
- Healthcheck: `http://<server-ip>:7778/health`

### 🖥️ Lokal öffnen

**[▶ American Dispatch auf localhost:7778 öffnen](http://localhost:7778)**

> Der Link funktioniert, wenn der Server auf deinem eigenen PC/Server läuft und Port `7778` verwendet.

GitHub Pages ist nicht mehr der Produktionspfad.

## Feature-Reparatur

Die aktuelle Hauptversion repariert die Bedienung von AGENCY, BUILD, RANKS und WORLD sowie die XP-Anzeige nach abgeschlossenen Einsätzen.
