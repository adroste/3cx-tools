import { CallLog, IActiveCalls } from './wsApiTypes';
import { Socket, io } from 'socket.io-client';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4848/' 
  : window.location.origin;

export const RECV_MSG = {
  connect: 'connect',
  connectError: 'connect_error',
  disconnect: 'disconnect',

  activeCalls: 'activeCalls',
  callLogs: 'callLogs',
} as const;

export const SEND_MSG = {
  subscribeActiveCalls: 'subscribeActiveCalls',
  unsubscribeActiveCalls: 'unsubscribeActiveCalls',
  subscribeCallLogs: 'subscribeCallLogs',
  unsubscribeCallLogs: 'unsubscribeCallLogs',
} as const;

export class WsApi {
  socket: Socket;
  subscribedActiveCalls = false;
  subscribedCallLogs = false;
  cache: { 
    activeCalls: IActiveCalls[], 
    callLogs: CallLog[] 
  } = {
    activeCalls: [], 
    callLogs: [] 
  };

  constructor(username: string, password: string) {
    this.socket = io(BACKEND_URL, {
      path: '/3cx-tools/socket.io',
      auth: {
        username,
        password,
      }
    });
  }

  close() {
    this.socket.close();
  }

  cacheActiveCalls(activeCalls: IActiveCalls[]) {
    this.cache.activeCalls = activeCalls;
  }

  subscribeActiveCalls(listener: (activeCalls: IActiveCalls[]) => void) {
    this.socket.on(RECV_MSG.activeCalls, listener);
    if (this.subscribedActiveCalls) {
      listener(this.cache.activeCalls);
    } else {
      this.socket.on(RECV_MSG.activeCalls, this.cacheActiveCalls);
      this.socket.emit(SEND_MSG.subscribeActiveCalls);
      this.subscribedActiveCalls = true;
    }
  }

  unsubscribeActiveCalls(listener: (activeCalls: IActiveCalls[]) => void) {
    this.socket.off(RECV_MSG.activeCalls, listener);
    if (!this.socket.listeners(RECV_MSG.activeCalls).some(l => l !== this.cacheActiveCalls)) {
      this.socket.emit(SEND_MSG.unsubscribeActiveCalls);
      this.socket.off(RECV_MSG.activeCalls, this.cacheActiveCalls);
      this.subscribedActiveCalls = false;
    }
  }

  cacheCallLogs(callLogs: CallLog[]) {
    this.cache.callLogs = callLogs;
  }

  subscribeCallLogs(listener: (callLogs: CallLog[]) => void) {
    this.socket.on(RECV_MSG.callLogs, listener);
    if (this.subscribedCallLogs) {
      listener(this.cache.callLogs);
    } else {
      this.socket.on(RECV_MSG.callLogs, this.cacheCallLogs);
      this.socket.emit(SEND_MSG.subscribeCallLogs);
      this.subscribedCallLogs = true;
    }
  }

  unsubscribeCallLogs(listener: (callLogs: CallLog[]) => void) {
    this.socket.off(RECV_MSG.callLogs, listener);
    if (!this.socket.listeners(RECV_MSG.callLogs).some(l => l !== this.cacheCallLogs)) {
      this.socket.emit(SEND_MSG.unsubscribeCallLogs);
      this.socket.off(RECV_MSG.callLogs, this.cacheCallLogs);
      this.subscribedCallLogs = false;
    }
  }
}