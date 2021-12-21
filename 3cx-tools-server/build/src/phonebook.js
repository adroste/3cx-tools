"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPhonebookPatcher = exports.PHONE_NUMBER_PROPS = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const database_1 = require("./database");
const path_1 = require("./path");
const path_2 = require("path");
const promises_1 = require("fs/promises");
const phonebook_fanvil_1 = require("./phonebook-fanvil");
const phonebook_snom_1 = require("./phonebook-snom");
const phonebook_yealink_1 = require("./phonebook-yealink");
const TAG = '[Phonebook]';
exports.PHONE_NUMBER_PROPS = [
    'mobile',
    'private',
    'business',
    'mobile2',
    'private2',
    'business2',
    'extra',
];
function queryDisplayNameFormat() {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query('SELECT * FROM public.parameter WHERE idparameter=163');
        const rows = res.rows;
        return ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) === '0'
            ? 'FirstNameLastName'
            : 'LastNameFirstName';
    });
}
function getDisplayName(firstName, lastName, format) {
    let parts, sep;
    if (format === 'FirstNameLastName') {
        parts = [firstName, lastName];
        sep = ' ';
    }
    else {
        parts = [lastName, firstName];
        sep = ', ';
    }
    return parts.filter(x => x).join(sep);
}
function getProvisionDirPath() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const files = yield (0, promises_1.readdir)((0, path_1.getPath)().provisioningDir, { withFileTypes: true });
        const dirs = files.filter(f => f.isDirectory());
        if (dirs.length !== 1)
            throw new Error('provisioning dir does not contain exactly one directory');
        return (0, path_2.join)((0, path_1.getPath)().provisioningDir, dirs[0].name);
    });
}
function queryPhonebook() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query('SELECT * FROM public.phonebook');
        const rows = res.rows;
        const displayFormat = yield queryDisplayNameFormat();
        const entries = rows.map(r => ({
            id: r.idphonebook,
            displayName: getDisplayName(r.firstname, r.lastname, displayFormat),
            firstName: r.firstname,
            lastName: r.lastname,
            company: r.company,
            mobile: r.phonenumber,
            mobile2: r.pv_an0,
            private: r.pv_an1,
            private2: r.pv_an2,
            business: r.pv_an3,
            business2: r.pv_an4,
            email: r.pv_an5,
            extra: r.pv_an6,
            fax: r.pv_an7,
            fax2: r.pv_an8,
        }));
        return entries;
    });
}
let fileWatcher;
function registerFileWatcher() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, 'watching phonebook files...');
        const debouncedRun = (0, lodash_1.debounce)((0, lodash_1.debounce)(runPhonebookPatcher, 10000, { leading: true, trailing: false }), 3000);
        fileWatcher = (0, fs_1.watch)(yield getProvisionDirPath(), (_, filename) => {
            if (filename.includes('phonebook'))
                debouncedRun();
        });
    });
}
function runPhonebookPatcher() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const provisionDir = yield getProvisionDirPath();
        const phonebook = yield queryPhonebook();
        yield (0, phonebook_yealink_1.updatePhonebookYealink)(phonebook, provisionDir);
        yield (0, phonebook_fanvil_1.updatePhonebookFanvil)(phonebook, provisionDir);
        yield (0, phonebook_snom_1.updatePhonebookSnom)(phonebook, provisionDir);
        console.log(TAG, 'phonebooks updated');
        if (!fileWatcher)
            registerFileWatcher();
    });
}
exports.runPhonebookPatcher = runPhonebookPatcher;
//# sourceMappingURL=phonebook.js.map