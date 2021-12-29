import { checkActiveCalls, createCallerInfoFromCallerId, offActiveCallsChange, onActiveCallsChange } from './active-calls';
import { closeDb, initDb } from '../database';

import { connectTo3cxApi } from '../api/connection';
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

describe('active-calls callerId parsing', () => {
  it('should parse format: +4912341234', () => {
    const info = createCallerInfoFromCallerId('+4912341234');
    expect(info.phoneNumber).toBe('+4912341234');
    expect(info.displayName).toBeUndefined();
  });

  it('should parse format: Nick Sample (001231234)', () => {
    const info = createCallerInfoFromCallerId('Nick Sample (001231234)');
    expect(info.phoneNumber).toBe('001231234');
    expect(info.displayName).toBe('Nick Sample');
  });

  it('should parse format: (100)', () => {
    const info = createCallerInfoFromCallerId('(100)');
    expect(info.phoneNumber).toBe('100');
    expect(info.displayName).toBeUndefined();
  });

  it('should prefer number in parenthesis and parse format: 112 113 (100)', () => {
    const info = createCallerInfoFromCallerId('112 113 (100)');
    expect(info.phoneNumber).toBe('100');
    expect(info.displayName).toBe('112 113');
  });

  it('should parse format: 10 My Extension', () => {
    const info = createCallerInfoFromCallerId('10 My Extension');
    expect(info.phoneNumber).toBe('10');
    expect(info.displayName).toBe('My Extension');
  });

  it('should parse format: 10 My Fav Nr Is 55', () => {
    const info = createCallerInfoFromCallerId('10 My Fav Nr Is 55');
    expect(info.phoneNumber).toBe('10');
    expect(info.displayName).toBe('My Fav Nr Is 55');
  });

  it('should parse dial code numbers: 10001 Service A - 11 (*91234)', () => {
    const info = createCallerInfoFromCallerId('10001 Service A - 11 (*91234)');
    expect(info.phoneNumber).toBe('*91234');
    expect(info.displayName).toBe('10001 Service A - 11');
  });
});

afterAll(async () => {
  await closeDb();
});