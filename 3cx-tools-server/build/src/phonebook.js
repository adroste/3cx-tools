"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPhonebookPatcher = exports.PHONE_NUMBER_PROPS = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const database_1 = require("./database");
const path_1 = require("./path");
const path_2 = require("path");
const promises_1 = require("fs/promises");
const lodash_1 = require("lodash");
const phonebook_yealink_1 = require("./phonebook-yealink");
exports.PHONE_NUMBER_PROPS = [
    'mobile',
    'mobile2',
    'private',
    'private2',
    'business',
    'business2',
    'extra',
];
const TAG = '[Phonebook]';
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
        const entries = rows.map(r => ({
            id: r.idphonebook,
            firstname: r.firstname,
            lastname: r.lastname,
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
        const throttledRun = (0, lodash_1.throttle)(runPhonebookPatcher, 3000);
        fileWatcher = (0, fs_1.watch)(yield getProvisionDirPath(), (_, filename) => {
            console.log('pwatcher1', filename);
            if (filename.includes('phonebook'))
                throttledRun();
        });
    });
}
function runPhonebookPatcher() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log('runp');
        const provisionDir = yield getProvisionDirPath();
        const phonebook = yield queryPhonebook();
        yield (0, phonebook_yealink_1.updatePhonebookYealink)(phonebook, provisionDir);
        console.log(TAG, 'phonebooks updated');
        if (!fileWatcher)
            registerFileWatcher();
    });
}
exports.runPhonebookPatcher = runPhonebookPatcher;
//# sourceMappingURL=phonebook.js.map