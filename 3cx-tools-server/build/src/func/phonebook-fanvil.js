"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPhonebookPatcherFanvil = exports.startPhonebookPatcherFanvil = exports.updatePhonebookFanvil = exports.buildPhonebookFanvil = void 0;
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const TAG = '[Phonebook Fanvil]';
const xmlTemplate = (body) => `
<?xml version="1.0" encoding="UTF-8"?>
<FanvilIPPhoneDirectory>
  <Title>3CX Phonebook</Title>
  ${body}
</FanvilIPPhoneDirectory>
`;
function buildPhonebookFanvil(phonebook) {
    let body = '';
    for (const entry of phonebook) {
        const phonenumbers = phonebook_1.PHONE_NUMBER_PROPS.map(p => entry[p]).filter(x => x);
        if (!entry.displayName || phonenumbers.length === 0)
            continue;
        body += '  <DirectoryEntry>\n';
        body += `   <Name>${entry.displayName}</Name>\n`;
        let mobileEntry = false, telephoneEntry = false;
        phonenumbers.forEach(nr => {
            if (!mobileEntry && entry.mobile === nr) {
                body += `   <Mobile>${nr}</Mobile>\n`;
                mobileEntry = true;
            }
            else if (!telephoneEntry) {
                body += `   <Telephone>${nr}</Telephone>\n`;
                telephoneEntry = true;
            }
            else {
                body += `   <Other>${nr}</Other>\n`;
            }
        });
        body += '  </DirectoryEntry>\n';
    }
    return xmlTemplate(body.trim()).trim();
}
exports.buildPhonebookFanvil = buildPhonebookFanvil;
function updatePhonebookFanvil(phonebook) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const xml = buildPhonebookFanvil(phonebook);
        const provisionDir = (0, phonebook_1.getProvisionDirPath)();
        const path = (0, path_1.join)(provisionDir, 'fanvil_phonebook.xml');
        yield (0, promises_1.writeFile)(path, xml, 'utf-8');
        console.log(TAG, 'fanvil phonebook updated');
    });
}
exports.updatePhonebookFanvil = updatePhonebookFanvil;
function startPhonebookPatcherFanvil() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, 'patcher started');
        updatePhonebookFanvil((0, phonebook_1.getPhonebook)());
        (0, phonebook_1.onPhonebookChange)(updatePhonebookFanvil);
    });
}
exports.startPhonebookPatcherFanvil = startPhonebookPatcherFanvil;
function stopPhonebookPatcherFanvil() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, 'patcher stopped');
        (0, phonebook_1.offPhonebookChange)(updatePhonebookFanvil);
    });
}
exports.stopPhonebookPatcherFanvil = stopPhonebookPatcherFanvil;
//# sourceMappingURL=phonebook-fanvil.js.map