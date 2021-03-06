import { FSWatcher, watch } from 'fs';

import { EventEmitter } from 'events';
import { debounce } from 'lodash';
import { getConfig } from '../config';
import { getDb } from '../database';
import { join } from 'path';
import { queryParameter } from '../utils/parameter';
import { readdir } from 'fs/promises';

const TAG = '[Phonebook Monitor]';
const phonebookMonitor = new EventEmitter();
let fileWatcher: FSWatcher | null;
let phonebook: PhonebookEntry[] = [];
let provisionDir: string;

interface PhonebookRow {
  idphonebook: number,
  firstname?: string,
  lastname?: string,
  phonenumber?: string, // mobile
  fkidtenant?: number,
  fkiddn?: number,
  company?: string,
  tag?: string,
  pv_an0?: string, // mobile 2
  pv_an1?: string, // private
  pv_an2?: string, // private 2
  pv_an3?: string, // business
  pv_an4?: string, // business 2
  pv_an5?: string, // e-mail
  pv_an6?: string, // additional / extra numbers
  pv_an7?: string, // fax
  pv_an8?: string, // fax 2
  pv_an9?: string, // unknown unused???
  pv_contact_image?: string
}

export interface PhonebookEntry {
  id: number,
  displayName?: string,
  firstName?: string,
  lastName?: string,
  company?: string,
  mobile?: string,
  mobile2?: string,
  private?: string,
  private2?: string,
  business?: string,
  business2?: string,
  email?: string,
  extra?: string,
  fax?: string,
  fax2?: string,
}

/**
 * All props of PhonebookEntry that include phone numbers.
 * These numbers are copied to the telephone (if possible).
 * The order is specified in config.phoneNumberOrder
 */ 
export const PHONE_NUMBER_PROPS = [
  'mobile',
  'private',
  'business',
  'mobile2',
  'private2',
  'business2',
  'extra',
] as const;

export type DisplayNameFormat = 'FirstNameLastName' | 'LastNameFirstName';

async function queryDisplayNameFormat(): Promise<DisplayNameFormat> {
  const val = await queryParameter('PHONEBOOK_LAST_FIRST');
  return val === '0'
    ? 'FirstNameLastName'
    : 'LastNameFirstName';
}

function getDisplayName(firstName: string | undefined, lastName: string | undefined, format: DisplayNameFormat): string {
  let parts: (string | undefined)[], sep: string;
  if (format === 'FirstNameLastName') {
    parts = [firstName, lastName];
    sep = ' ';
  } else {
    parts = [lastName, firstName];
    sep = ', ';
  }
  return parts.filter(x=>x).join(sep);
}

async function detectProvisionDirPath() {
  const files = await readdir(getConfig().provisioningDir, { withFileTypes: true });
  const dirs = files.filter(f => f.isDirectory());
  if (dirs.length !== 1)
    throw new Error('provisioning dir does not contain exactly one directory');
  return join(getConfig().provisioningDir, dirs[0].name);
}

async function queryPhonebook() {
  // fkiddn = NULL means company phonebook only
  // fkiddn is set to a value when it's a value in a private phonebook
  const res = await getDb().query('SELECT * FROM public.phonebook WHERE fkiddn IS NULL');
  const rows = res.rows as PhonebookRow[];
  const displayFormat = await queryDisplayNameFormat();
  const entries: PhonebookEntry[] = rows.map(r => ({
    id: r.idphonebook,
    displayName: getDisplayName(r.firstname, r.lastname, displayFormat),
    firstName: r.firstname,
    lastName: r.lastname,
    company: r.company,
    mobile: r.phonenumber,
    mobile2: r.pv_an0,
    private: r.pv_an1,
    private2: r.pv_an2,
    business: r.pv_an3,
    business2: r.pv_an4,
    email: r.pv_an5,
    extra: r.pv_an6,
    fax: r.pv_an7,
    fax2: r.pv_an8,
  }));

  // sort by displayname (if possible)
  entries.sort((a, b) => a.displayName?.localeCompare(b.displayName || '') || 0);

  return entries;
}

function registerFileWatcher() {
  // The "Double Debounce":
  // outer debounce: group and wait for multiple file changes in directory
  const debouncedRun = debounce(
    // inner debounce: prevent infinite recursion when writing a watched file/folder
    debounce(updatePhonebook, 10000, { leading: true, trailing: false })
  , 3000);
  // we update the phonebooks everytime we detect a change from 3cx
  // this works because as of v18.0.3 3cx also updates all the 
  // phonebook files when we change a hidden number of a contact 
  // (like the business or private ones)
  fileWatcher = watch(provisionDir, (_, filename) => {
    if (filename.includes('phonebook'))
      debouncedRun();
  });
}

export async function updatePhonebook() {
  phonebook = await queryPhonebook();
  phonebookMonitor.emit('phonebook', phonebook);
}

export function getProvisionDirPath() {
  if (!provisionDir)
    throw new Error('provision dir is unknown (module was not initialized correctly)')
  return provisionDir;
}

export function getPhonebook() {
  return phonebook;
}

export async function monitorPhonebook() {
  provisionDir = await detectProvisionDirPath();
  await updatePhonebook();
  registerFileWatcher();
  console.log(TAG, 'watching phonebook files...');
}

export function stopMonitorPhonebook() {
  fileWatcher?.close();
  fileWatcher = null;
  console.log(TAG, 'stopped');
}

export function onPhonebookChange(listener: (phonebook: PhonebookEntry[]) => void) {
  phonebookMonitor.on('phonebook', listener);
}

export function offPhonebookChange(listener: (phonebook: PhonebookEntry[]) => void) {
  phonebookMonitor.off('phonebook', listener);
}