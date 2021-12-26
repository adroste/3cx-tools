"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDnReporterAccess = exports.checkDnPassword = void 0;
const tslib_1 = require("tslib");
const dnprop_1 = require("../utils/dnprop");
function checkDnPassword(dn, password) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const dbPw = yield (0, dnprop_1.queryDnPropValue)(dn, 'SERVICES_ACCESS_PASSWORD');
        return dbPw ? password === dbPw : false;
    });
}
exports.checkDnPassword = checkDnPassword;
function checkDnReporterAccess(dn) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const reporterAccess = yield (0, dnprop_1.queryDnPropValue)(dn, 'REPORTER_ACCESS');
        return reporterAccess === '1';
    });
}
exports.checkDnReporterAccess = checkDnReporterAccess;
//# sourceMappingURL=auth.js.map