import * as http from 'http';

import { Server } from 'socket.io';
import { getConfig } from '../config';

const TAG = '[Websocket API]';


export let io: Server;
let httpServer: http.Server;

function promisedHttpListen(server: http.Server, port: number) {
  return new Promise((resolve, reject) => {
    server.on('listening', resolve);
    server.on('error', reject);
    server.listen(port);
  });
}

export async function initWsApi() {
  httpServer = http.createServer(); 
  io = new Server(httpServer);

  const port = getConfig().wsApiPort;
  await promisedHttpListen(httpServer, port);
  console.log(TAG, `WS/HTTP server listening on port ${port}`);

  setListener();
}

function setListener() {
  io.on('connection', socket => {
    console.log('Socket connected: %s', socket.id);
  });
}