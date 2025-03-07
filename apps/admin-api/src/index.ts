import dotenv from 'dotenv'
// get config vars
dotenv.config();

import aedes from 'aedes';
import http from 'http';
import WebSocket, { Server } from 'ws';
import net from 'net';
import app from './api'
import {generateEvent} from 'app/bundles/library'
const aedesInstance = new aedes();

const server = http.createServer(app);

// Crea un WebSocket server
const wss = new Server({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  const stream = WebSocket.createWebSocketStream(ws, { decodeStrings: false });
  aedesInstance.handle(stream as any);
});

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/websocket') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
      socket.destroy();
  }
});

server.listen(3002, () => {
  console.log(`Express server listening at http://localhost:${3002}`);
});

const mqttServer = net.createServer((socket) => {
  aedesInstance.handle(socket);
});

mqttServer.listen(1883, () => {
  console.log('MQTT server listening on port 1883');
});

// generateEvent({
//   path: 'services/start/adminapi', //event type: / separated event category: files/create/file, files/create/dir, devices/device/online
//   from: 'api', // system entity where the event was generated (next, api, cmd...)
//   user: 'system', // the original user that generates the action, 'system' if the event originated in the system itself
//   payload: {}, // event payload, event-specific data
// })