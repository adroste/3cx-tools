import * as http from 'http';

import { getActiveCalls, offActiveCallsChange, onActiveCallsChange } from './active-calls';

import { IActiveCalls } from '@adroste/3cx-api';
import { Server } from 'socket.io';
import { getConfig } from '../config';

const TAG = '[Websocket API]';

export const RECV_MSG = {
  subscribeActiveCalls: 'subscribeActiveCalls',
  unsubscribeActiveCalls: 'unsubscribeActiveCalls',
  subscribeCallHistory: 'subscribeCallHistory',
  unsubscribeCallHistory: 'unsubscribeCallHistory',
} as const;

export const SEND_MSG = {
  activeCalls: 'activeCalls',
  callHistory: 'callHistory',
} as const;

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

    let subscribedActiveCalls = false;

    function sendActiveCalls(activeCalls: IActiveCalls[]) {
      socket.emit(SEND_MSG.activeCalls, activeCalls)
    }

    socket.on(RECV_MSG.subscribeActiveCalls, () => {
      if (subscribedActiveCalls)
        return; 
      subscribedActiveCalls = true;
      onActiveCallsChange(sendActiveCalls);
      sendActiveCalls(getActiveCalls());
    });

    socket.on(RECV_MSG.unsubscribeActiveCalls, () => {
      offActiveCallsChange(sendActiveCalls);
      subscribedActiveCalls = false;
    });
    
  });
}