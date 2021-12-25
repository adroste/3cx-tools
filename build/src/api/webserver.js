"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebServer = exports.httpServer = void 0;
const tslib_1 = require("tslib");
const http = require("http");
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
        io = new Server(exports.httpServer);
        const port = getConfig().wsApiPort;
        yield promisedHttpListen(exports.httpServer, port);
        console.log(TAG, `WS/HTTP server listening on port ${port}`);
        setListener();
    });
}
exports.startWebServer = startWebServer;
//# sourceMappingURL=webserver.js.map