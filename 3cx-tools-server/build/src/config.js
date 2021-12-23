"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.loadConfig = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const TAG = '[Config loader]';
let config;
function loadConfig() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const defaultConf = yield (0, fs_extra_1.readJson)('./config.default.json');
        let devConf, localConf;
        if (process.env.NODE_ENV === 'development')
            devConf = yield (0, fs_extra_1.readJson)('./config.dev.json');
        try {
            localConf = yield (0, fs_extra_1.readJson)('./config.local.json');
        }
        catch (_) {
            console.log(TAG, 'no local config (config.local.json) detected, using default values');
        }
        config = Object.assign(Object.assign(Object.assign({}, defaultConf), devConf), localConf);
        console.log(TAG, 'config loaded');
    });
}
exports.loadConfig = loadConfig;
function getConfig() {
    if (!config)
        throw new Error('config was not loaded');
    return config;
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map