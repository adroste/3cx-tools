import { PhonebookEntry, getPhonebook, getProvisionDirPath, offPhonebookChange, onPhonebookChange } from './phonebook';

import { getConfig } from '../config';
import { join } from 'path';
import { writeFile } from 'fs/promises';

const TAG = '[Phonebook Fanvil]';

// spec see https://www.fanvil.com/Uploads/Temp/download/20191226/5e0454ec2e7f0.pdf pages 8/9
const xmlTemplate = (body: string) => `
<?xml version="1.0" encoding="utf-8"?>
<PhoneBook>
  ${body}
</PhoneBook>
`;

export function buildPhonebookFanvil(phonebook: PhonebookEntry[]) {
  let body = '';
  for (const entry of phonebook) {
    const phoneNumberOrder = getConfig().phoneNumberOrder;
    let phonenumbers = phoneNumberOrder.map(p => entry[p]).filter(x => x);
    if (!entry.displayName || phonenumbers.length === 0)
      continue;

    // & signs are not supported by fanvil phones => replace them with +
    (Object.keys(entry) as Array<keyof typeof entry>).forEach((e) => {
      if (typeof entry[e] === 'string')
        (entry[e] as string) = (entry[e] as string).replace(/&/g, '+');
    })

    body += '  <DirectoryEntry>\n';
    body += `   <Name>${entry.displayName}</Name>\n`;

    // fanvil only supports 3 numbers per entry;
    if (entry.mobile) {
      body += `   <Mobile>${entry.mobile}</Mobile>\n`;
      phonenumbers = phonenumbers.filter(nr => nr !== entry.mobile);
      if (phonenumbers[0])
        body += `   <Telephone>${phonenumbers[0]}</Telephone>\n`;
      if (phonenumbers[1])
        body += `   <Other>${phonenumbers[1]}</Other>\n`;
    } else {
      if (phonenumbers[0])
        body += `   <Telephone>${phonenumbers[0]}</Telephone>\n`;
      if (phonenumbers[1])
        body += `   <Mobile>${phonenumbers[1]}</Mobile>\n`;
      if (phonenumbers[2]) 
        body += `   <Other>${phonenumbers[2]}</Other>\n`;
    }

    body += '  </DirectoryEntry>\n';
  }
  return xmlTemplate(body.trim()).trim();
}

export async function updatePhonebookFanvil(phonebook: PhonebookEntry[]) {
  const xml = buildPhonebookFanvil(phonebook);

  const provisionDir = getProvisionDirPath();
  const path = join(provisionDir, 'fanvil_phonebook.xml');
  await writeFile(path, xml, 'utf-8');
  
  console.log(TAG, 'fanvil phonebook updated');
}

export async function startPhonebookPatcherFanvil() {
  console.log(TAG, 'patcher started');
  updatePhonebookFanvil(getPhonebook());
  onPhonebookChange(updatePhonebookFanvil);
}

export async function stopPhonebookPatcherFanvil() {
  console.log(TAG, 'patcher stopped');
  offPhonebookChange(updatePhonebookFanvil);
}