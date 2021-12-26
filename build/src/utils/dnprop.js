"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDnPropValue = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../database");
function queryDnPropValue(dn, propName) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query(`
SELECT p.name, p.value 
FROM dn
LEFT JOIN public.dnprop p
	on dn.iddn = p.fkiddn
WHERE dn.value = $1 AND p.name = $2
`, [dn, propName]);
        const rows = res.rows;
        return ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) || undefined;
    });
}
exports.queryDnPropValue = queryDnPropValue;
//# sourceMappingURL=dnprop.js.map