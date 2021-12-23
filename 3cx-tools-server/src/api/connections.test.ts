import { closeDb, initDb } from '../database';

import { connectTo3cxApi } from './connection';
import { loadConfig } from '../config';

beforeAll(async () => {
  await loadConfig();
  await initDb();
});

describe('3cx REST Api', () => {
  it('should connect without error', async () => {
    expect.assertions(1);
    return expect(connectTo3cxApi()).resolves.toBeUndefined();
  });
});

afterAll(async () => {
  await closeDb();
});