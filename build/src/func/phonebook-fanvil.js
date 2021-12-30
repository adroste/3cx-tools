"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPhonebookPatcherFanvil = exports.startPhonebookPatcherFanvil = exports.updatePhonebookFanvil = exports.buildPhonebookFanvil = void 0;
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const TAG = '[Phonebook Fanvil]';
const xmlTemplate = (body) => `
<?xml version="1.0" encoding="utf-8"?>
<PhoneBook>
  ${body}
</PhoneBook>
`;
function buildPhonebookFanvil(phonebook) {
    let body = '';
    for (const entry of phonebook) {
        let phonenumbers = phonebook_1.PHONE_NUMBER_PROPS.map(p => entry[p]).filter(x => x);
        if (!entry.displayName || phonenumbers.length === 0)
            continue;
        body += '  <DirectoryEntry>\n';
        body += `   <Name>${entry.displayName}</Name>\n`;
        if (entry.mobile) {
            body += `   <Mobile>${entry.mobile}</Mobile>\n`;
            phonenumbers = phonenumbers.filter(nr => nr !== entry.mobile);
            if (phonenumbers[0])
                body += `   <Telephone>${phonenumbers[0]}</Telephone>\n`;
            if (phonenumbers[1])
                body += `   <Other>${phonenumbers[1]}</Other>\n`;
        }
        else {
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