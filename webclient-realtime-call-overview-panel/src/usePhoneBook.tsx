import { useCallback, useContext, useEffect, useState } from 'react';

import { IContactSettings } from '@adroste/3cx-api/dist/settings/phonebook';
import { IPhonebookEntry } from '@adroste/3cx-api';
import { cxContext } from './CxContext';

export interface ILookupTable {
  [key: string]: IPhonebookEntry
}

export interface CallerId {
  display: string,
  phoneBookEntry?: IPhonebookEntry,
  phoneNumber?: string,
}

export type CallerOutputFormat = 'FirstNameLastName' | 'LastNameFirstName';
const DEFAULT_RESOLVE_LENGTH = 6;

export function getResolveLength(settings: IContactSettings): number {
  return parseInt(settings.ResolvingLength?._value || '') || DEFAULT_RESOLVE_LENGTH;
}

export function getOutputFormat(settings: IContactSettings): CallerOutputFormat {
  if (settings.DisplayType?.selected === 'TypeOfPhoneBookDisplay.FirstNameLastName')
    return 'FirstNameLastName';
  return 'LastNameFirstName'; // default
}

export function getPhoneNumberFromCallerId(callerId: string) {
  // format can be for instance: "Name name (+123456789)", "(123495)", "+4359090132"
  const test = /(^|\()([+]?\d{2,})($|\)$)/;
  const match = test.exec(callerId);
  if (match)
    return match[2];
  return undefined;
}

export function createLookupTable(entries: IPhonebookEntry[], settings: IContactSettings): ILookupTable {
  const len = getResolveLength(settings);
  const table: ILookupTable = {};
  
  for (let entry of entries) {
    let prop: keyof IPhonebookEntry;
    for (prop in entry) {
      if (typeof entry[prop] === 'string' && prop.length >= len) {
        table[entry[prop].slice(-len)] = entry;
      }
    }
  }

  return table;
}

export function resolveCallerFromTable(callerId: string, lookupTable: ILookupTable, settings: IContactSettings): CallerId {
  const len = getResolveLength(settings);
  const outputFormat = getOutputFormat(settings);
  const phoneNumber = getPhoneNumberFromCallerId(callerId);
  if (phoneNumber && phoneNumber.length >= len) {
    const entry: IPhonebookEntry | undefined = lookupTable[phoneNumber.slice(-len)];
    if (entry) {
      let parts: string[], join: string;
      if (outputFormat === 'FirstNameLastName') {
        parts = [entry.FirstName, entry.LastName];
        join = ' ';
      } else {
        parts = [entry.LastName, entry.FirstName];
        join = ', ';
      }

      return {
        phoneBookEntry: entry,
        phoneNumber,
        display: `${parts.filter(x => x).join(join)} (${phoneNumber})`
      };
    }
  }
  return { display: callerId, phoneNumber };
}

export function usePhoneBook(): [(callerId: string) => CallerId, () => Promise<void>] {
  const { api, settingsApi } = useContext(cxContext);
  const [lookupTable, setLookupTable] = useState<ILookupTable>();
  const [settings, setSettings] = useState<IContactSettings>();

  const reloadContacts = useCallback(async () => {
    if (!api || !settings)
      return;
    const pb = await api.getContactList(99999, 0);
    const table = createLookupTable(pb, settings);
    setLookupTable(table);
  }, [api, settings]);

  useEffect(() => {
    reloadContacts();
  }, [reloadContacts]);

  useEffect(() => {
    if (!api || !settingsApi)
      return;
    (async () => {
      const s = await settingsApi.getContactSettings();
      setSettings(s);
    })();
  }, [api, settingsApi]);

  const resolveCaller = useCallback((callerId: string) => {
    if (!lookupTable || !settings)
      return { display: callerId };
    return resolveCallerFromTable(callerId, lookupTable, settings);
  }, [lookupTable, settings]);

  return [resolveCaller, reloadContacts];
}