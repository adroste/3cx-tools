"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPhonebookPatcherYealink = exports.startPhonebookPatcherYealink = exports.updatePhonebookYealink = exports.buildPhonebookYealink = void 0;
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const config_1 = require("../config");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const TAG = '[Phonebook Yealink]';
const xmlTemplate = (body) => `
<?xml version="1.0" encoding="utf-8"?>
<XXXIPPhoneDirectory clearlight="true">
  <Title>Phonelist</Title>
  <Prompt>Prompt</Prompt>
  ${body}
</XXXIPPhoneDirectory>
`;
function buildPhonebookYealink(phonebook) {
    let body = '';
    for (const entry of phonebook) {
        const phoneNumberOrder = (0, config_1.getConfig)().phoneNumberOrder;
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
exports.buildPhonebookYealink = buildPhonebookYealink;
function updatePhonebookYealink(phonebook) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const xml = buildPhonebookYealink(phonebook);
        const provisionDir = (0, phonebook_1.getProvisionDirPath)();
        const path = (0, path_1.join)(provisionDir, 'yealink_phonebook.xml');
        yield (0, promises_1.writeFile)(path, xml, 'utf-8');
        console.log(TAG, 'yealink phonebook updated');
    });
}
exports.updatePhonebookYealink = updatePhonebookYealink;
function startPhonebookPatcherYealink() {
    console.log(TAG, 'patcher started');
    updatePhonebookYealink((0, phonebook_1.getPhonebook)());
    (0, phonebook_1.onPhonebookChange)(updatePhonebookYealink);
}
exports.startPhonebookPatcherYealink = startPhonebookPatcherYealink;
function stopPhonebookPatcherYealink() {
    console.log(TAG, 'patcher stopped');
    (0, phonebook_1.offPhonebookChange)(updatePhonebookYealink);
}
exports.stopPhonebookPatcherYealink = stopPhonebookPatcherYealink;
//# sourceMappingURL=phonebook-yealink.js.map