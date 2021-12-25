"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../database");
const call_logs_1 = require("./call-logs");
const config_1 = require("../config");
beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, config_1.loadConfig)();
    yield (0, database_1.initDb)();
}));
describe('call-logs', () => {
    it('should update call logs without error', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        yield expect((0, call_logs_1.updateCallLogs)()).resolves.toBeUndefined();
    }));
    it('should include at least one correct element', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        expect.assertions(7);
        yield (0, call_logs_1.updateCallLogs)();
        const callLogs = (0, call_logs_1.getCallLogs)();
        expect(callLogs[0]).toBeTruthy();
        expect(callLogs[0].id).toBeTruthy();
        expect(callLogs[0].direction).toBeTruthy();
        expect(callLogs[0].endTime).toBeTruthy();
        expect(callLogs[0].startTime).toBeTruthy();
        expect(callLogs[0].extCaller).toBeTruthy();
        expect(callLogs[0].segments[0]).toBeTruthy();
    }));
});
afterAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDb)();
}));
//# sourceMappingURL=call-logs.test.js.map