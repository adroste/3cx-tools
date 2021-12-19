"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = exports.getDb = void 0;
const tslib_1 = require("tslib");
const pg_1 = require("pg");
const path_1 = require("./path");
const fs_extra_1 = require("fs-extra");
let pool;
function getDb() {
    if (!pool)
        throw new Error('database pool was not initialized');
    return pool;
}
exports.getDb = getDb;
function initDb() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const tcxConfig = yield (0, fs_extra_1.readJson)((0, path_1.getPath)().configJson);
        pool = new pg_1.Pool({
            user: tcxConfig.DbUser,
            host: tcxConfig.DbHost,
            database: tcxConfig.DbName,
            password: tcxConfig.DbPassword,
            port: parseInt(tcxConfig.DbPort),
        });
    });
}
exports.initDb = initDb;
//# sourceMappingURL=database.js.map