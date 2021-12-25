import { getConfig, loadConfig } from '../config';

import { Manager } from 'socket.io-client';
import { initWsApi } from './ws-api';

beforeAll(async () => {
  await loadConfig();
  await initWsApi();
})

describe('ws-api', () => {
  it('ws connection from a client', () => {
    expect.assertions(1);
    const io = new Manager(`ws://localhost:${getConfig().wsApiPort}`, { autoConnect: false });
    return new Promise(resolve => {
      io.connect(err => {
        expect(err).toBeUndefined();
        resolve(undefined);
      });
    })
  });
});