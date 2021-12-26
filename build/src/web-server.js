"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebServer = exports.httpServer = void 0;
const tslib_1 = require("tslib");
const cors = require("cors");
const express = require("express");
const http = require("http");
const config_1 = require("./config");
const TAG = '[Web Server]';
let app;
function promisedHttpListen(server, port) {
    return new Promise((resolve, reject) => {
        server.on('listening', resolve);
        server.on('error', reject);
        server.listen(port);
    });
}
function startWebServer() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        setupExpress();
        exports.httpServer = http.createServer(app);
        const port = (0, config_1.getConfig)().httpPort;
        yield promisedHttpListen(exports.httpServer, port);
        console.log(TAG, `HTTP server listening on port ${port}`);
    });
}
exports.startWebServer = startWebServer;
function setupExpress() {
    app = express();
    app.use(cors({
        origin: true,
        credentials: true,
    }));
    app.use('/3cx-tools/call-overview-panel', express.static((0, config_1.getConfig)().webclientCallOverviewPanelBuildDir));
}
//# sourceMappingURL=web-server.js.map