"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordIvr = void 0;
const tslib_1 = require("tslib");
const active_calls_1 = require("../func/active-calls");
const promises_1 = require("fs/promises");
const connection_1 = require("../api/connection");
const config_1 = require("../config");
const path_1 = require("path");
const MAX_WAIT_FOR_CALL_SEC = 5 * 60;
function waitForRecordCallFinished(phoneNumber) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                (0, active_calls_1.offActiveCallsChange)(handler);
                reject(new Error(`max wait time (${MAX_WAIT_FOR_CALL_SEC} seconds) elapsed`));
            }, MAX_WAIT_FOR_CALL_SEC * 1000);
            (0, active_calls_1.onActiveCallsChange)(handler);
            let callId;
            function handler(activeCalls) {
                const call = activeCalls.find(c => c.to.phoneNumber === phoneNumber
                    && c.from.phoneNumber === phoneNumber);
                if (call && !callId) {
                    callId = call.id;
                }
                else if (!call && callId) {
                    clearTimeout(timeout);
                    (0, active_calls_1.offActiveCallsChange)(handler);
                    resolve();
                }
            }
        });
    });
}
function getIvrSettings(ivrExt) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const ivrList = yield connection_1.api.consoleClient.getIVRList();
        const ivr = ivrList.find(ivr => (ivr === null || ivr === void 0 ? void 0 : ivr.Number.toString()) === ivrExt.toString());
        if (!ivr)
            throw new Error(`IVR with extension number ${ivrExt} not found`);
        return connection_1.api.consoleClient.getIVRSettings(ivr.Id);
    });
}
function recordIvr(action, call) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const recordWithExtensionNr = call.from.phoneNumber;
        if (!recordWithExtensionNr)
            throw new Error(`Caller number is undefined`);
        const properFileName = action.fileName.toLowerCase().endsWith('.wav')
            ? action.fileName
            : action.fileName + '.wav';
        let ivrSettings = yield getIvrSettings(action.ivrExt);
        const tempName = properFileName + '-tmp-' + Date.now() + '.wav';
        const waitForCall = waitForRecordCallFinished(recordWithExtensionNr);
        yield connection_1.api.consoleClient.recordFile({
            ExtId: recordWithExtensionNr,
            Id: ivrSettings.Id.toString(),
            Name: tempName,
            PropertyPath: "[{\"Name\":\"Prompt\"}]",
            ObjectId: ivrSettings.ActiveObject.Id,
        });
        yield waitForCall;
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        try {
            yield (0, promises_1.stat)((0, path_1.join)((0, config_1.getConfig)().ivrPromptsDir, tempName));
        }
        catch (err) {
            return;
        }
        yield (0, promises_1.rename)((0, path_1.join)((0, config_1.getConfig)().ivrPromptsDir, tempName), (0, path_1.join)((0, config_1.getConfig)().ivrPromptsDir, properFileName));
        ivrSettings = yield getIvrSettings(action.ivrExt);
        yield connection_1.api.consoleClient.updateIVRSettings({
            PropertyValue: "Empty.wav",
            Path: {
                ObjectId: ivrSettings.Id.toString(),
                PropertyPath: [{ Name: "Prompt" }],
            }
        });
        yield connection_1.api.consoleClient.saveIVRSettings(ivrSettings.Id.toString());
        ivrSettings = yield getIvrSettings(action.ivrExt);
        yield connection_1.api.consoleClient.updateIVRSettings({
            PropertyValue: properFileName,
            Path: {
                ObjectId: ivrSettings.Id.toString(),
                PropertyPath: [{ Name: "Prompt" }],
            }
        });
        yield connection_1.api.consoleClient.saveIVRSettings(ivrSettings.Id.toString());
    });
}
exports.recordIvr = recordIvr;
//# sourceMappingURL=ivr.js.map