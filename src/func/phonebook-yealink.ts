import { PhonebookEntry, getPhonebook, getProvisionDirPath, offPhonebookChange, onPhonebookChange } from './phonebook';

import { getConfig } from '../config';
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
    const phoneNumberOrder = getConfig().phoneNumberOrder;
    const phonenumbers = phoneNumberOrder.map(p => entry[p]).filter(x => x);
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

export async function updatePhonebookYealink(phonebook: PhonebookEntry[]) {
  const xml = buildPhonebookYealink(phonebook);

  const provisionDir = getProvisionDirPath();
  const path = join(provisionDir, 'yealink_phonebook.xml');
  await writeFile(path, xml, 'utf-8');
  
  console.log(TAG, 'yealink phonebook updated');
}

export function startPhonebookPatcherYealink() {
  console.log(TAG, 'patcher started');
  updatePhonebookYealink(getPhonebook());
  onPhonebookChange(updatePhonebookYealink);
}

export function stopPhonebookPatcherYealink() {
  console.log(TAG, 'patcher stopped');
  offPhonebookChange(updatePhonebookYealink);
}