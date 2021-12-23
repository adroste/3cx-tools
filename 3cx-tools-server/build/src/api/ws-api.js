"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWsApi = exports.io = void 0;
const tslib_1 = require("tslib");
const http = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("../config");
const TAG = '[Websocket API]';
let httpServer;
function promisedHttpListen(server, port) {
    return new Promise((resolve, reject) => {
        server.on('listening', resolve);
        server.on('error', reject);
        server.listen(port);
    });
}
function initWsApi() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        httpServer = http.createServer();
        exports.io = new socket_io_1.Server(httpServer);
        const port = (0, config_1.getConfig)().wsApiPort;
        yield promisedHttpListen(httpServer, port);
        console.log(TAG, `WS/HTTP server listening on port ${port}`);
        setListener();
    });
}
exports.initWsApi = initWsApi;
function setListener() {
    exports.io.on('connection', socket => {
        console.log('Socket connected: %s', socket.id);
    });
}
//# sourceMappingURL=ws-api.js.map