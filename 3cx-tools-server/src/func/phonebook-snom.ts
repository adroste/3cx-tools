import { PHONE_NUMBER_PROPS, PhonebookEntry } from './phonebook';

import { join } from 'path';
import { writeFile } from 'fs/promises';

type SnomNumberType = 'sip' | 'mobile' | 'fixed' | 'home' | 'business';

const TAG = '[Phonebook Snom]';

// spec see https://service.snom.com/display/wiki/%3Ctbook%3E%2C%3Cphone-book%3E+tag#
const xmlTemplate = (body: string) => `
<?xml version="1.0" encoding="utf-8"?>
<tbook complete="true">
  ${body}
</tbook>
`;

function getNumberType(key: keyof PhonebookEntry): SnomNumberType {
  switch (key) {
    case 'mobile':
    case 'mobile2':
      return 'mobile';
    case 'private':
    case 'private2':
      return 'home';
    case 'business':
    case 'business2':
    default:
      return 'business';
  }
}

function getContactInfoXml(entry: PhonebookEntry) {
  let contactInfoXml = '';

  if (entry.firstName)
    contactInfoXml += `    <first_name>${entry.firstName}</first_name>\n`;
  if (entry.lastName)
    contactInfoXml += `    <last_name>${entry.lastName}</last_name>\n`;
  if (entry.company)
    contactInfoXml += `    <organization>${entry.company}</organization>\n`;
  if (entry.email)
    contactInfoXml += `    <email>${entry.email}</email>\n`;

  return contactInfoXml;
}

export function buildPhonebookSnom(phonebook: PhonebookEntry[]) {
  let body = '';
  for (const entry of phonebook) {
    const usedKeys = PHONE_NUMBER_PROPS.filter(key => entry[key]);
    const phoneNumberCount = usedKeys.length;
    if ((!entry.firstName && !entry.lastName) || phoneNumberCount === 0)
      continue;

    if (phoneNumberCount === 1) {
      const key = usedKeys[0];
      body += `  <item context="active">\n`;
      body += getContactInfoXml(entry);
      body += `    <number>${entry[key]}</number>\n`;
      body += `    <number_type>${getNumberType(key)}</number_type>\n`;
      body += '  </item>\n';
    } else {
      // snom phonebooks-entries cannot have multiple number entries
      // unless we define a MASTER entry and add the phone numbers in special 
      // entries marked as 'Member_Alias' 
      const uniqueNumber = entry[usedKeys[0]];
      body += `  <item context="" type="MASTER">\n`;
      body += getContactInfoXml(entry);
      body += `    <number>${uniqueNumber}</number>\n`;
      body += '  </item>\n';

      usedKeys.forEach(key => {
        body += `  <item context="active">\n`;
        body += `    <first_name>Member_Alias</first_name>\n`;
        body += `    <last_name>${uniqueNumber}</last_name>\n`;
        body += `    <number>${entry[key]}</number>\n`;
        body += `    <number_type>${getNumberType(key)}</number_type>\n`;
        body += '  </item>\n';
      });
    }
  }
  return xmlTemplate(body.trim()).trim();
}

export async function updatePhonebookSnom(phonebook: PhonebookEntry[], provisionDir: string) {
  const xml = buildPhonebookSnom(phonebook);

  const path = join(provisionDir, 'snom_phonebook.xml');
  await writeFile(path, xml, 'utf-8');

  console.log(TAG, 'snom phonebook updated');
}