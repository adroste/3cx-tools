"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAsService = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = require("./path");
const util_1 = require("util");
const promises_1 = require("fs/promises");
const exec = (0, util_1.promisify)(child_process_1.exec);
const TAG = '[Service Installer]';
const serviceTemplate = `
[Unit]
Description=3cx-tools-server - custom plugins, tools for 3CX
Documentation=https://github.com/adroste/3cx-tools
After=network.target

[Service]
Environment=NODE_ENV=production
Environment=IS_SERVICE=true
Type=simple
User=root
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
`;
function installAsService() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (process.env.IS_SERVICE) {
            console.log(TAG, 'running as service.');
            return;
        }
        else if (process.env.NO_SERVICE) {
            console.log(TAG, 'service init skipped');
            return;
        }
        console.log(TAG, 'installing as systemd service');
        yield (0, promises_1.writeFile)((0, path_1.getPath)().serviceInstallPath, serviceTemplate, 'utf-8');
        if (process.env.NODE_ENV === 'development') {
            console.log(TAG, 'skipped systemd init because app runs in development mode (NODE_ENV == "development")');
            return;
        }
        yield exec('sudo systemctl daemon-reload');
        yield exec('sudo systemctl stop 3cx-tools-server');
        yield exec('sudo systemctl start 3cx-tools-server');
        yield exec('sudo systemctl enable 3cx-tools-server');
        console.log(TAG, 'systemd service enabled and started, exiting this instance.\nView service logs by typing: sudo journalctl -u 3cx-tools-server.service');
        process.exit();
    });
}
exports.installAsService = installAsService;
//# sourceMappingURL=systemd.js.map