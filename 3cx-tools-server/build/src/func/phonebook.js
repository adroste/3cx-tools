"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offPhonebookChange = exports.onPhonebookChange = exports.stopMonitorPhonebook = exports.monitorPhonebook = exports.updatePhonebook = exports.PHONE_NUMBER_PROPS = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const events_1 = require("events");
const lodash_1 = require("lodash");
const config_1 = require("../config");
const database_1 = require("../database");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const TAG = '[Phonebook Monitor]';
const phonebookMonitor = new events_1.EventEmitter();
let fileWatcher;
let phonebook = [];
let provisionDir;
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
        const res = yield (0, database_1.getDb)().query(`SELECT value FROM public.parameter WHERE name='PHONEBOOK_LAST_FIRST'`);
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
        const files = yield (0, promises_1.readdir)((0, config_1.getConfig)().provisioningDir, { withFileTypes: true });
        const dirs = files.filter(f => f.isDirectory());
        if (dirs.length !== 1)
            throw new Error('provisioning dir does not contain exactly one directory');
        return (0, path_1.join)((0, config_1.getConfig)().provisioningDir, dirs[0].name);
    });
}
function queryPhonebook() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query('SELECT * FROM public.phonebook WHERE fkiddn IS NULL');
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
function registerFileWatcher() {
    const debouncedRun = (0, lodash_1.debounce)((0, lodash_1.debounce)(updatePhonebook, 10000, { leading: true, trailing: false }), 3000);
    fileWatcher = (0, fs_1.watch)(provisionDir, (_, filename) => {
        if (filename.includes('phonebook'))
            debouncedRun();
    });
}
function updatePhonebook() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        phonebook = yield queryPhonebook();
        phonebookMonitor.emit('phonebook', phonebook, provisionDir);
    });
}
exports.updatePhonebook = updatePhonebook;
function monitorPhonebook() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        provisionDir = yield getProvisionDirPath();
        registerFileWatcher();
        console.log(TAG, 'watching phonebook files...');
    });
}
exports.monitorPhonebook = monitorPhonebook;
function stopMonitorPhonebook() {
    fileWatcher === null || fileWatcher === void 0 ? void 0 : fileWatcher.close();
    fileWatcher = null;
    console.log(TAG, 'stopped');
}
exports.stopMonitorPhonebook = stopMonitorPhonebook;
function onPhonebookChange(listener) {
    phonebookMonitor.on('phonebook', listener);
}
exports.onPhonebookChange = onPhonebookChange;
function offPhonebookChange(listener) {
    phonebookMonitor.off('phonebook', listener);
}
exports.offPhonebookChange = offPhonebookChange;
//# sourceMappingURL=phonebook.js.map