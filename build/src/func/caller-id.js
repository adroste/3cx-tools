"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCallerId = exports.startCallerId = exports.updateCallerId = exports.resolveCaller = exports.createLookupTable = void 0;
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const parameter_1 = require("./parameter");
const TAG = '[Caller ID]';
const DEFAULT_RESOLVE_LENGTH = 6;
let lookupTable = {};
let resolveLength = DEFAULT_RESOLVE_LENGTH;
function queryCallerIdResolveLength() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const val = yield (0, parameter_1.queryParameter)('PHONEBOOK_MIN_MATCH');
        return (val && parseInt(val)) || DEFAULT_RESOLVE_LENGTH;
    });
}
function createLookupTable(phonebook) {
    const table = {};
    for (const entry of phonebook) {
        for (const prop of phonebook_1.PHONE_NUMBER_PROPS) {
            const nr = entry[prop];
            if (typeof nr === 'string') {
                table[nr.slice(-resolveLength)] = entry;
            }
        }
    }
    return table;
}
exports.createLookupTable = createLookupTable;
function resolveCaller(phoneNumber) {
    if (!phoneNumber)
        return null;
    return lookupTable[phoneNumber.slice(-resolveLength)] || null;
}
exports.resolveCaller = resolveCaller;
function updateCallerId(phonebook) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        resolveLength = yield queryCallerIdResolveLength();
        lookupTable = createLookupTable(phonebook);
    });
}
exports.updateCallerId = updateCallerId;
function startCallerId() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, 'started');
        yield updateCallerId((0, phonebook_1.getPhonebook)());
        (0, phonebook_1.onPhonebookChange)(updateCallerId);
    });
}
exports.startCallerId = startCallerId;
function stopCallerId() {
    console.log(TAG, 'stopped');
    lookupTable = {};
    (0, phonebook_1.offPhonebookChange)(updateCallerId);
}
exports.stopCallerId = stopCallerId;
//# sourceMappingURL=caller-id.js.map