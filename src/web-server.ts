import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';

import { getConfig } from './config';

const TAG = '[Web Server]';
export let httpServer: http.Server;
let app: express.Express;

function promisedHttpListen(server: http.Server, port: number) {
  return new Promise((resolve, reject) => {
    server.on('listening', resolve);
    server.on('error', reject);
    server.listen(port);
  });
}

export async function startWebServer() {
  setupExpress();
  httpServer = http.createServer(app); 

  const port = getConfig().httpPort;
  await promisedHttpListen(httpServer, port);
  console.log(TAG, `HTTP server listening on port ${port}`);
}

function setupExpress() {
  app = express();
  app.use(cors({
    origin:true,
    credentials: true,
  }));
  app.use('/3cx-tools/call-overview-panel' , express.static(getConfig().webclientCallOverviewPanelBuildDir));
  app.use('/3cx-tools/mc-settings-panel' , express.static(getConfig().mcSettingsPanelBuildDir));
}