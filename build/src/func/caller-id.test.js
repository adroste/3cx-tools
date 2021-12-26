"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const phonebook_1 = require("./phonebook");
const database_1 = require("../database");
const caller_id_1 = require("./caller-id");
const config_1 = require("../config");
beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, config_1.loadConfig)();
    yield (0, database_1.initDb)();
    yield (0, phonebook_1.monitorPhonebook)();
    yield (0, caller_id_1.startCallerId)();
}));
describe('caller-id', () => {
    it('should return a phonebook entry', () => {
        expect.assertions(1);
        const phonebook = (0, phonebook_1.getPhonebook)();
        function findNr() {
            for (const e of phonebook) {
                for (const p of phonebook_1.PHONE_NUMBER_PROPS) {
                    if (e[p])
                        return [e, p];
                }
            }
            return [null, null];
        }
        const [entry, prop] = findNr();
        if (!entry || !prop)
            throw new Error('no phonebook entry');
        const res = (0, caller_id_1.resolveCaller)(entry[prop]);
        expect(res).toEqual(entry);
    });
});
afterAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDb)();
}));
//# sourceMappingURL=caller-id.test.js.map