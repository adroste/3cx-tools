import { PHONE_NUMBER_PROPS, PhonebookEntry } from './phonebook';

import { join } from 'path';
import { writeFile } from 'fs/promises';

const TAG = '[Phonebook Yealink]';

const xmlTemplate = (body: string) => `
<?xml version="1.0" encoding="utf-8"?>
<XXXIPPhoneDirectory clearlight="true">
  <Title>Phonelist</Title>
  <Prompt>Prompt</Prompt>
  ${body}
</XXXIPPhoneDirectory>
`;

export function buildPhonebookYealink(phonebook: PhonebookEntry[]) {
  let body = '';
  for (const entry of phonebook) {
    const phonenumbers = PHONE_NUMBER_PROPS.map(p => entry[p]).filter(x => x);
    if (!entry.displayName || phonenumbers.length === 0)
      continue;

    body += '  <DirectoryEntry>\n';
    body += `   <Name>${entry.displayName}</Name>\n`;
    phonenumbers.forEach(nr => {
      body += `   <Telephone>${nr}</Telephone>\n`;
    });
    body += '  </DirectoryEntry>\n';
  }
  return xmlTemplate(body.trim()).trim();
}

export async function updatePhonebookYealink(phonebook: PhonebookEntry[], provisionDir: string) {
  const xml = buildPhonebookYealink(phonebook);

  const path = join(provisionDir, 'yealink_phonebook.xml');
  await writeFile(path, xml, 'utf-8');
  
  console.log(TAG, 'yealink phonebook updated');
}