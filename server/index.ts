import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { initialGameState, type GameState } from '../src/game/state.js';
const state: GameState = structuredClone(initialGameState);
const http = createServer((_req,res)=>{ res.writeHead(200,{'content-type':'application/json'}); res.end(JSON.stringify({name:'American Dispatch', status:'online'})); });
const wss = new WebSocketServer({ server: http });
wss.on('connection', socket => {
  socket.send(JSON.stringify({ type:'STATE_SNAPSHOT', payload:state }));
  socket.on('message', raw => {
    try {
      const message = JSON.parse(raw.toString()) as { type?: string };
      if (message.type === 'PING') socket.send(JSON.stringify({type:'PONG', serverTime:Date.now()}));
    } catch { socket.send(JSON.stringify({type:'ERROR', message:'Ungültige Nachricht'})); }
  });
});
const port = Number(process.env.PORT ?? 8787);
http.listen(port,()=>console.log(`American Dispatch server listening on :${port}`));