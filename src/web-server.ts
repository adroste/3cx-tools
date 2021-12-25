import * as http from 'http';

import { getConfig } from './config';

const TAG = '[Web Server]';
export let httpServer: http.Server;

function promisedHttpListen(server: http.Server, port: number) {
  return new Promise((resolve, reject) => {
    server.on('listening', resolve);
    server.on('error', reject);
    server.listen(port);
  });
}

export async function startWebServer() {
  httpServer = http.createServer(); 

  const port = getConfig().httpPort;
  await promisedHttpListen(httpServer, port);
  console.log(TAG, `HTTP server listening on port ${port}`);
}