"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParameter = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../database");
function queryParameter(parameter) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query(`SELECT value FROM public.parameter WHERE name = $1`, [parameter]);
        const rows = res.rows;
        return ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) || undefined;
    });
}
exports.queryParameter = queryParameter;
//# sourceMappingURL=parameter.js.map