"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../database");
const connection_1 = require("./connection");
const path_1 = require("../path");
beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, path_1.loadPathConfig)();
    yield (0, database_1.initDb)();
}));
describe('3cx REST Api', () => {
    it('should connect without error', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        return expect((0, connection_1.connectTo3cxApi)()).resolves.toBeUndefined();
    }));
});
afterAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDb)();
}));
//# sourceMappingURL=connections.test.js.map