"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebServer = exports.httpServer = void 0;
const tslib_1 = require("tslib");
const http = require("http");
const config_1 = require("../config");
const TAG = '[Web Server]';
function promisedHttpListen(server, port) {
    return new Promise((resolve, reject) => {
        server.on('listening', resolve);
        server.on('error', reject);
        server.listen(port);
    });
}
function startWebServer() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        exports.httpServer = http.createServer();
        const port = (0, config_1.getConfig)().httpPort;
        yield promisedHttpListen(exports.httpServer, port);
        console.log(TAG, `HTTP server listening on port ${port}`);
    });
}
exports.startWebServer = startWebServer;
//# sourceMappingURL=web-server.js.map