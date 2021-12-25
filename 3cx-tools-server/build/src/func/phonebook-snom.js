"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPhonebookPatcherSnom = exports.startPhonebookPatcherSnom = exports.updatePhonebookSnom = exports.buildPhonebookSnom = void 0;
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const TAG = '[Phonebook Snom]';
const xmlTemplate = (body) => `
<?xml version="1.0" encoding="utf-8"?>
<tbook complete="true">
  ${body}
</tbook>
`;
function getNumberType(key) {
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
function getContactInfoXml(entry) {
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
function buildPhonebookSnom(phonebook) {
    let body = '';
    for (const entry of phonebook) {
        const usedKeys = phonebook_1.PHONE_NUMBER_PROPS.filter(key => entry[key]);
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
        }
        else {
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
exports.buildPhonebookSnom = buildPhonebookSnom;
function updatePhonebookSnom(phonebook, provisionDir) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const xml = buildPhonebookSnom(phonebook);
        const path = (0, path_1.join)(provisionDir, 'snom_phonebook.xml');
        yield (0, promises_1.writeFile)(path, xml, 'utf-8');
        console.log(TAG, 'snom phonebook updated');
    });
}
exports.updatePhonebookSnom = updatePhonebookSnom;
function startPhonebookPatcherSnom() {
    (0, phonebook_1.onPhonebookChange)(updatePhonebookSnom);
    console.log(TAG, 'patcher started');
}
exports.startPhonebookPatcherSnom = startPhonebookPatcherSnom;
function stopPhonebookPatcherSnom() {
    (0, phonebook_1.offPhonebookChange)(updatePhonebookSnom);
    console.log(TAG, 'patcher stopped');
}
exports.stopPhonebookPatcherSnom = stopPhonebookPatcherSnom;
//# sourceMappingURL=phonebook-snom.js.map