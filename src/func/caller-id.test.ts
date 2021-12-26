import { PHONE_NUMBER_PROPS, getPhonebook, monitorPhonebook } from './phonebook';
import { closeDb, initDb } from '../database';
import { resolveCaller, startCallerId } from './caller-id';

import { loadConfig } from '../config';

beforeAll(async () => {
  await loadConfig();
  await initDb();
  await monitorPhonebook();
  await startCallerId();
});

describe('caller-id', () => {
  it('should return a phonebook entry', () => {
    expect.assertions(1);
    const phonebook = getPhonebook();
    function findNr() {
      for (const e of phonebook) {
        for (const p of PHONE_NUMBER_PROPS) {
          if (e[p])
            return [e, p] as const;
        }
      }
      return [null, null] as const;
    }
    const [entry, prop] = findNr();
    if (!entry || !prop)
      throw new Error('no phonebook entry');
    const res = resolveCaller(entry[prop]);
    expect(res).toEqual(entry);
  });
});

afterAll(async () => {
  await closeDb();
});