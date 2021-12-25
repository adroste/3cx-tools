"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const config_1 = require("../config");
const socket_io_client_1 = require("socket.io-client");
const ws_api_1 = require("./ws-api");
const web_server_1 = require("../web-server");
beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, config_1.loadConfig)();
    yield (0, web_server_1.startWebServer)();
    (0, ws_api_1.initWsApi)();
}));
describe('ws-api', () => {
    it('ws connection from a client', () => {
        expect.assertions(1);
        const io = new socket_io_client_1.Manager(`ws://localhost:${(0, config_1.getConfig)().httpPort}`, {
            autoConnect: false,
            path: '/3cx-tools/socket.io',
        });
        return new Promise(resolve => {
            io.connect(err => {
                expect(err).toBeUndefined();
                resolve(undefined);
            });
        });
    });
});
//# sourceMappingURL=ws-api.test.js.map