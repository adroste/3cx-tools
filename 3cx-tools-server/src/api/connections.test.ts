import { closeDb, initDb } from '../database';

import { connectTo3cxApi } from './connection';
import { loadPathConfig } from '../path';

beforeAll(async () => {
  await loadPathConfig();
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