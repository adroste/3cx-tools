import { PHONE_NUMBER_PROPS, PhonebookEntry, getPhonebook, offPhonebookChange, onPhonebookChange } from './phonebook';

import { queryParameter } from '../utils/parameter';

const TAG = '[Caller ID]';
const DEFAULT_RESOLVE_LENGTH = 6;
let lookupTable: CallerIdLookupTable = {};
let resolveLength = DEFAULT_RESOLVE_LENGTH;

export interface CallerIdLookupTable {
  [key: string]: PhonebookEntry
}

async function queryCallerIdResolveLength(): Promise<number> {
  const val = await queryParameter('PHONEBOOK_MIN_MATCH');
  return (val && parseInt(val)) || DEFAULT_RESOLVE_LENGTH;
}

export function createLookupTable(phonebook: PhonebookEntry[]): CallerIdLookupTable {
  const table: CallerIdLookupTable = {};
  
  for (const entry of phonebook) {
    // let prop: keyof PhonebookEntry;
    for (const prop of PHONE_NUMBER_PROPS) {
      const nr = entry[prop];
      if (typeof nr === 'string') {
        table[nr.slice(-resolveLength)] = entry;
      }
    }
  }

  return table;
}

export function resolveCaller(phoneNumber?: string): PhonebookEntry | null {
  if (!phoneNumber)
    return null;
  return lookupTable[phoneNumber.slice(-resolveLength)] || null;
}

export async function updateCallerId(phonebook: PhonebookEntry[]) {
  resolveLength = await queryCallerIdResolveLength();
  lookupTable = createLookupTable(phonebook);
}

export async function startCallerId() {
  console.log(TAG, 'started');
  await updateCallerId(getPhonebook());
  onPhonebookChange(updateCallerId);
}

export function stopCallerId() {
  console.log(TAG, 'stopped');
  lookupTable = {};
  offPhonebookChange(updateCallerId);
}