import { checkActiveCalls, offActiveCallsChange, onActiveCallsChange } from './active-calls';
import { closeDb, initDb } from '../database';

import { connectTo3cxApi } from './connection';
import { loadConfig } from '../config';

beforeAll(async () => {
  await loadConfig();
  await initDb();
  await connectTo3cxApi();
});

describe('active-calls', () => {
  it('should fetch active-calls without error', async () => {
    expect.assertions(1);
    return new Promise<void>(resolve => {
      const handler = (activeCalls: unknown) => {
        expect(activeCalls).toBeTruthy();
        offActiveCallsChange(handler);
        resolve();
      }
      onActiveCallsChange(handler);
      checkActiveCalls();
    });
  });
});

afterAll(async () => {
  await closeDb();
});