import { getConfig, loadConfig } from '../config';

import { Manager } from 'socket.io-client';
import { initWsApi } from './ws-api';
import { startWebServer } from '../web-server';

beforeAll(async () => {
  await loadConfig();
  await startWebServer();
  initWsApi();
})

describe('ws-api', () => {
  it('ws connection from a client', () => {
    expect.assertions(1);
    const io = new Manager(`ws://localhost:${getConfig().httpPort}`, { 
      autoConnect: false, 
      path: '/3cx-tools/socket.io',
    });
    return new Promise(resolve => {
      io.connect(err => {
        expect(err).toBeUndefined();
        resolve(undefined);
      });
    })
  });
});