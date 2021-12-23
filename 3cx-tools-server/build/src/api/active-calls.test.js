"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const active_calls_1 = require("./active-calls");
const database_1 = require("../database");
const connection_1 = require("./connection");
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
afterAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDb)();
}));
//# sourceMappingURL=active-calls.test.js.map