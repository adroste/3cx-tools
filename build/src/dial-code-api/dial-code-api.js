"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAction = exports.initDialCodeApi = exports.DialCodeActionTypes = void 0;
const tslib_1 = require("tslib");
const active_calls_1 = require("../func/active-calls");
const ivr_1 = require("./ivr");
const connection_1 = require("../api/connection");
const config_1 = require("../config");
const TAG = '[Dial Code API]';
exports.DialCodeActionTypes = {
    RECORD_IVR: 'RecordIvr',
};
function parseValueRangeStringList(input) {
    function createRange(start, end) {
        if (isNaN(start) || isNaN(end) || end - start < 0)
            return [];
        return Array.from(new Array(end - start + 1), (_, i) => i + start);
    }
    const numbers = [];
    for (const raw of input.split(',')) {
        const nums = raw.split('-').map(n => parseInt(n));
        if (nums.some(isNaN))
            continue;
        if (nums.length === 2) {
            numbers.push(...createRange(nums[0], nums[1]));
        }
        else {
            numbers.push(nums[0]);
        }
    }
    return numbers;
}
function handleActiveCalls(activeCalls) {
    const codes = (0, config_1.getConfig)().dialCodes || {};
    activeCalls.forEach((call) => {
        if (!call.to.phoneNumber || !call.from.phoneNumber)
            return;
        const action = codes[call.to.phoneNumber];
        if (!action)
            return;
        if (action.allowedExtensions.trim() !== '*') {
            const allowed = parseValueRangeStringList(action.allowedExtensions);
            if (!allowed.includes(parseInt(call.from.phoneNumber)))
                return;
        }
        connection_1.api.dashboardClient.dropActiveCall(call.id);
        executeAction(action, call);
    });
}
function initDialCodeApi() {
    (0, active_calls_1.onActiveCallsChange)(handleActiveCalls);
    console.log(TAG, `listening for calls...`);
}
exports.initDialCodeApi = initDialCodeApi;
function executeAction(action, call) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, `execute action "${action.type}", dial code: "${call.to.phoneNumber}", caller: "${call.from.phoneNumber}"`);
        try {
            switch (action.type) {
                case exports.DialCodeActionTypes.RECORD_IVR:
                    yield (0, ivr_1.recordIvr)(action, call);
                    break;
                default:
                    console.error(TAG, 'dial code action unknown: ', action.type);
                    return;
            }
        }
        catch (err) {
            console.error(TAG, 'dial code action failed', err);
        }
    });
}
exports.executeAction = executeAction;
//# sourceMappingURL=dial-code-api.js.map