"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const active_calls_1 = require("./active-calls");
const database_1 = require("../database");
const connection_1 = require("../api/connection");
const config_1 = require("../config");
beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, config_1.loadConfig)();
    yield (0, database_1.initDb)();
    yield (0, connection_1.connectTo3cxApi)();
}));
describe('active-calls', () => {
    it('should fetch active-calls without error', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        return new Promise(resolve => {
            const handler = (activeCalls) => {
                expect(activeCalls).toBeTruthy();
                (0, active_calls_1.offActiveCallsChange)(handler);
                resolve();
            };
            (0, active_calls_1.onActiveCallsChange)(handler);
            (0, active_calls_1.checkActiveCalls)();
        });
    }));
});
describe('active-calls callerId parsing', () => {
    it('should parse format: +4912341234', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('+4912341234');
        expect(info.phoneNumber).toBe('+4912341234');
        expect(info.displayName).toBeUndefined();
    });
    it('should parse format: Nick Sample (001231234)', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('Nick Sample (001231234)');
        expect(info.phoneNumber).toBe('001231234');
        expect(info.displayName).toBe('Nick Sample');
    });
    it('should parse format: (100)', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('(100)');
        expect(info.phoneNumber).toBe('100');
        expect(info.displayName).toBeUndefined();
    });
    it('should prefer number in parenthesis and parse format: 112 113 (100)', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('112 113 (100)');
        expect(info.phoneNumber).toBe('100');
        expect(info.displayName).toBe('112 113');
    });
    it('should parse format: 10 My Extension', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('10 My Extension');
        expect(info.phoneNumber).toBe('10');
        expect(info.displayName).toBe('My Extension');
    });
    it('should parse format: 10 My Fav Nr Is 55', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('10 My Fav Nr Is 55');
        expect(info.phoneNumber).toBe('10');
        expect(info.displayName).toBe('My Fav Nr Is 55');
    });
    it('should parse dial code numbers: 10001 Service A - 11 (*91234)', () => {
        const info = (0, active_calls_1.createCallerInfoFromCallerId)('10001 Service A - 11 (*91234)');
        expect(info.phoneNumber).toBe('*91234');
        expect(info.displayName).toBe('10001 Service A - 11');
    });
});
afterAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDb)();
}));
//# sourceMappingURL=active-calls.test.js.map