"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offDialCodeAction = exports.onDialCodeAction = exports.initDialCodeApi = void 0;
const active_calls_1 = require("../func/active-calls");
const events_1 = require("events");
const connection_1 = require("./connection");
const config_1 = require("../config");
const TAG = '[Dial Code API]';
const dialCodeApiActionEmitter = new events_1.EventEmitter();
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
        dialCodeApiActionEmitter.emit(action.type, action);
    });
}
function initDialCodeApi() {
    (0, active_calls_1.onActiveCallsChange)(handleActiveCalls);
    console.log(TAG, `loaded`);
}
exports.initDialCodeApi = initDialCodeApi;
function onDialCodeAction(type, listener) {
    dialCodeApiActionEmitter.on(type, listener);
}
exports.onDialCodeAction = onDialCodeAction;
function offDialCodeAction(type, listener) {
    dialCodeApiActionEmitter.off(type, listener);
}
exports.offDialCodeAction = offDialCodeAction;
//# sourceMappingURL=dial-code-api.js.map