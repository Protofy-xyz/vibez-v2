import dotenv from 'dotenv'
// get config vars
dotenv.config();

import aedes from 'aedes';
import http from 'http';
import WebSocket, { Server } from 'ws';
import net from 'net';
import app from './api'
import {generateEvent} from 'app/bundles/library'

const server = http.createServer(app);

server.listen(3001, () => {
  console.log(`Express server listening at http://localhost:${3001}`);
});

// generateEvent({
//   path: 'services/start/api', //event type: / separated event category: files/create/file, files/create/dir, devices/device/online
//   from: 'api', // system entity where the event was generated (next, api, cmd...)
//   user: 'system', // the original user that generates the action, 'system' if the event originated in the system itself
//   payload: {}, // event payload, event-specific data
// })



  
