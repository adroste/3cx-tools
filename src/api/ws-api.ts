import { ActiveCall, getActiveCalls, offActiveCallsChange, onActiveCallsChange } from '../func/active-calls';
import { CallLog, getCallLogs, offCallLogs, onCallLogs } from '../func/call-logs';
import { checkDnPassword, checkDnReporterAccess } from './auth';

import { Server } from 'socket.io';
import { httpServer } from '../web-server';

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

export function initWsApi() {
  io = new Server(httpServer, {
    path: '/3cx-tools/socket.io',
    cors: {
      origin: true,
      credentials: true,
    }
  });
  console.log(TAG, `WS api listening...`);

  // authenticator middleware
  io.use(async (socket, next) => {
    const username = socket.handshake.auth.username || '';
    const password = socket.handshake.auth.password || '';
    if (
      await checkDnReporterAccess(username)
      && await checkDnPassword(username, password)
    ) {
      next(); // auth successful
    } else {
      next(new Error('authentication failed'));
      socket.disconnect();
    }
  });

  setListener();
}

function setListener() {
  io.on('connection', socket => {

    // active calls

    let subscribedActiveCalls = false;

    function sendActiveCalls(activeCalls: ActiveCall[]) {
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
    

    // cleanup

    socket.on('disconnect', () => {
      offActiveCallsChange(sendActiveCalls);
      offCallLogs(sendCallLogs);
    });

  });
}