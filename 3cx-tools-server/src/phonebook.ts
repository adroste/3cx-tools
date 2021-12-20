import { FSWatcher, watch } from 'fs';

import { debounce } from 'lodash';
import { getDb } from './database';
import { getPath } from './path';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { updatePhonebookFanvil } from './phonebook-fanvil';
import { updatePhonebookYealink } from './phonebook-yealink';

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
  firstname?: string,
  lastname?: string,
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
 * Order by importance / display order.
 * These numbers are copied to the telephone (if possible).
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

const TAG = '[Phonebook]';

async function getProvisionDirPath() {
  const files = await readdir(getPath().provisioningDir, { withFileTypes: true });
  const dirs = files.filter(f => f.isDirectory());
  if (dirs.length !== 1)
    throw new Error('provisioning dir does not contain exactly one directory');
  return join(getPath().provisioningDir, dirs[0].name);
}

async function queryPhonebook() {
  const res = await getDb().query('SELECT * FROM public.phonebook');
  const rows = res.rows as PhonebookRow[];
  const entries: PhonebookEntry[] = rows.map(r => ({
    id: r.idphonebook,
    firstname: r.firstname,
    lastname: r.lastname,
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
  return entries;
}

let fileWatcher: FSWatcher;
async function registerFileWatcher() {
  console.log(TAG, 'watching phonebook files...');
  // The "Double Debounce":
  // outer debounce: group and wait for multiple file changes in directory
  const debouncedRun = debounce(
    // inner debounce: prevent infinite recursion when writing a watched file/folder
    debounce(runPhonebookPatcher, 10000, { leading: true, trailing: false })
  , 3000);
  // we update the phonebooks everytime we detect a change from 3cx
  // this works because as of v18.0.3 3cx also updates all the 
  // phonebook files when we change a hidden number of a contact 
  // (like the business or private ones)
  fileWatcher = watch(await getProvisionDirPath(), (_, filename) => {
    if (filename.includes('phonebook'))
      debouncedRun();
  });
}

export async function runPhonebookPatcher() {
  const provisionDir = await getProvisionDirPath();
  const phonebook = await queryPhonebook();

  await updatePhonebookYealink(phonebook, provisionDir);
  await updatePhonebookFanvil(phonebook, provisionDir);

  console.log(TAG, 'phonebooks updated');
  if (!fileWatcher)
    registerFileWatcher();
}