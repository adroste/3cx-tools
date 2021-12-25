"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offActiveCallsChange = exports.onActiveCallsChange = exports.stopMonitorActiveCalls = exports.monitorActiveCalls = exports.getActiveCalls = exports.checkActiveCalls = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const connection_1 = require("../api/connection");
const config_1 = require("../config");
const lodash_1 = require("lodash");
const TAG = '[Active Calls Monitor]';
const activeCallsMonitor = new events_1.EventEmitter();
let checkInterval, activeCalls;
function checkActiveCalls() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const nextActiveCalls = yield connection_1.api.dashboardClient.getActiveCalls();
        if ((0, lodash_1.isEqual)(activeCalls, nextActiveCalls))
            return;
        activeCalls = nextActiveCalls;
        activeCallsMonitor.emit('change', activeCalls);
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