import { PHONE_NUMBER_PROPS, PhonebookEntry } from './phonebook';

import { join } from 'path';
import { writeFile } from 'fs/promises';

const TAG = '[Phonebook Fanvil]';

// spec see https://www.fanvil.com/Uploads/Temp/download/20191226/5e0454ec2e7f0.pdf pages 8/9
const xmlTemplate = (body: string) => `
<?xml version="1.0" encoding="UTF-8"?>
<FanvilIPPhoneDirectory>
  <Title>3CX Phonebook</Title>
  ${body}
</FanvilIPPhoneDirectory>
`;

export function buildPhonebookFanvil(phonebook: PhonebookEntry[]) {
  let body = '';
  for (const entry of phonebook) {
    const phonenumbers = PHONE_NUMBER_PROPS.map(p => entry[p]).filter(x => x);
    if (!entry.displayName || phonenumbers.length === 0)
      continue;

    body += '  <DirectoryEntry>\n';
    body += `   <Name>${entry.displayName}</Name>\n`;

    // make sure that <Mobile> and <Telephone> entry are only added once
    let mobileEntry = false, telephoneEntry = false; 
    phonenumbers.forEach(nr => {
      if (!mobileEntry && entry.mobile === nr) {
        body += `   <Mobile>${nr}</Mobile>\n`;
        mobileEntry = true;
      } else if (!telephoneEntry) {
        body += `   <Telephone>${nr}</Telephone>\n`;
        telephoneEntry = true;
      } else {
        body += `   <Other>${nr}</Other>\n`;
      }
    });

    body += '  </DirectoryEntry>\n';
  }
  return xmlTemplate(body.trim()).trim();
}

export async function updatePhonebookFanvil(phonebook: PhonebookEntry[], provisionDir: string) {
  const xml = buildPhonebookFanvil(phonebook);

  const path = join(provisionDir, 'fanvil_phonebook.xml');
  await writeFile(path, xml, 'utf-8');
  
  console.log(TAG, 'fanvil phonebook updated');
}