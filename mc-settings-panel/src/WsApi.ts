import { Socket, io } from 'socket.io-client';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4848/' 
  : window.location.origin;

export const CALL_LOG_LIMIT = 1000;

export const RECV_MSG = {
  connect: 'connect',
  connectError: 'connect_error',
  disconnect: 'disconnect',
} as const;

export const SEND_MSG = {
} as const;

export class WsApi {
  socket: Socket;

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
}