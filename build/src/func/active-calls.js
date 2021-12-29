"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offActiveCallsChange = exports.onActiveCallsChange = exports.stopMonitorActiveCalls = exports.monitorActiveCalls = exports.getActiveCalls = exports.checkActiveCalls = exports.parseActiveCalls = exports.createCallerInfoFromCallerId = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const connection_1 = require("../api/connection");
const config_1 = require("../config");
const lodash_1 = require("lodash");
const caller_id_1 = require("./caller-id");
const TAG = '[Active Calls Monitor]';
const activeCallsMonitor = new events_1.EventEmitter();
let checkInterval, activeCalls;
function getPhoneNumberFromCallerId(callerId) {
    const test1 = /\(([+*]?\d{2,})\)$/;
    const test2 = /^([+*]?\d{2,})/;
    const match1 = test1.exec(callerId);
    const match2 = test2.exec(callerId);
    return (match1 === null || match1 === void 0 ? void 0 : match1[1]) || (match2 === null || match2 === void 0 ? void 0 : match2[1]) || undefined;
}
function stripPhoneNumberFromCallerId(callerId, phoneNumber) {
    return callerId
        .replace(phoneNumber, '')
        .replace('()', '')
        .trim();
}
function createCallerInfoFromCallerId(callerId) {
    const phoneNumber = getPhoneNumberFromCallerId(callerId);
    if (!phoneNumber)
        return { displayName: callerId };
    const entry = (0, caller_id_1.resolveCaller)(phoneNumber);
    const callerIdWithoutNr = stripPhoneNumberFromCallerId(callerId, phoneNumber);
    return {
        displayName: (entry === null || entry === void 0 ? void 0 : entry.displayName) || callerIdWithoutNr || undefined,
        phoneNumber,
        phoneBookId: (entry === null || entry === void 0 ? void 0 : entry.id) || undefined,
    };
}
exports.createCallerInfoFromCallerId = createCallerInfoFromCallerId;
function parseActiveCalls(activeCalls) {
    return activeCalls.map((c) => ({
        id: c.Id,
        establishedAt: c.EstablishedAt,
        from: createCallerInfoFromCallerId(c.Caller),
        lastChangeStatus: c.LastChangeStatus,
        status: c.Status,
        to: createCallerInfoFromCallerId(c.Callee),
    }));
}
exports.parseActiveCalls = parseActiveCalls;
function checkActiveCalls() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let nextActiveCallsRaw;
        try {
            nextActiveCallsRaw = yield connection_1.api.dashboardClient.getActiveCalls();
        }
        catch (err) {
            console.error(TAG, 'active calls check failed', err);
            return;
        }
        const nextActiveCalls = parseActiveCalls(nextActiveCallsRaw);
        if ((0, lodash_1.isEqual)(activeCalls, nextActiveCalls))
            return;
        activeCalls = nextActiveCalls;
        activeCallsMonitor.emit('change', nextActiveCalls);
    });
}
exports.checkActiveCalls = checkActiveCalls;
function getActiveCalls() {
    return activeCalls;
}
exports.getActiveCalls = getActiveCalls;
function monitorActiveCalls() {
    checkInterval = setInterval(checkActiveCalls, (0, config_1.getConfig)().activeCallsCheckIntervalMs);
    console.log(TAG, 'started');
}
exports.monitorActiveCalls = monitorActiveCalls;
function stopMonitorActiveCalls() {
    clearInterval(checkInterval);
    console.log(TAG, 'stopped');
}
exports.stopMonitorActiveCalls = stopMonitorActiveCalls;
function onActiveCallsChange(listener) {
    activeCallsMonitor.on('change', listener);
}
exports.onActiveCallsChange = onActiveCallsChange;
function offActiveCallsChange(listener) {
    activeCallsMonitor.off('change', listener);
}
exports.offActiveCallsChange = offActiveCallsChange;
//# sourceMappingURL=active-calls.js.map