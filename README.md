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

GitHub Pages ist nicht mehr der Produktionspfad.
