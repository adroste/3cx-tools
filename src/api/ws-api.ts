import * as http from 'http';

import { CallLog, getCallLogs, offCallLogs, onCallLogs } from '../func/call-logs';
import { getActiveCalls, offActiveCallsChange, onActiveCallsChange } from '../func/active-calls';

import { IActiveCalls } from '@adroste/3cx-api';
import { Server } from 'socket.io';
import { getConfig } from '../config';

const TAG = '[Websocket API]';

export const RECV_MSG = {
  subscribeActiveCalls: 'subscribeActiveCalls',
  unsubscribeActiveCalls: 'unsubscribeActiveCalls',
  subscribeCallLogs: 'subscribeCallLogs',
  unsubscribeCallLogs: 'unsubscribeCallLogs',
} as const;

export const SEND_MSG = {
  activeCalls: 'activeCalls',
  callLogs: 'callLogs',
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

    // active calls

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


    // call logs

    let subscribedCallLogs = false;

    function sendCallLogs(callLogs: CallLog[]) {
      socket.emit(SEND_MSG.callLogs, callLogs)
    }

    socket.on(RECV_MSG.subscribeCallLogs, () => {
      if (subscribedCallLogs)
        return; 
      subscribedCallLogs = true;
      onCallLogs(sendCallLogs);
      sendCallLogs(getCallLogs());
    });

    socket.on(RECV_MSG.unsubscribeCallLogs, () => {
      offCallLogs(sendCallLogs);
      subscribedCallLogs = false;
    });
    
  });
}