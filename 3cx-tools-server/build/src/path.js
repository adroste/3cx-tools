"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPath = exports.loadPathConfig = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
let pathConfig;
function loadPathConfig() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const path = process.env.NODE_ENV === 'development'
            ? './path.dev.json'
            : './path.prod.json';
        pathConfig = yield (0, fs_extra_1.readJson)(path);
    });
}
exports.loadPathConfig = loadPathConfig;
function getPath() {
    if (!pathConfig)
        throw new Error('path config was not loaded');
    return pathConfig;
}
exports.getPath = getPath;
//# sourceMappingURL=path.js.map