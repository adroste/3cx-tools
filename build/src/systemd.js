"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfServiceIsRunning = exports.uninstallService = exports.installAsService = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const config_1 = require("./config");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
const TAG = '[Service Installer]';
const serviceTemplate = `
[Unit]
Description=3cx-tools-server - custom plugins, tools for 3CX
Documentation=https://github.com/adroste/3cx-tools
After=network.target

[Service]
Environment=NODE_ENV=production
Type=simple
User=root
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/npm run start -- run-as-service
Restart=on-failure

[Install]
WantedBy=multi-user.target
`;
function installAsService() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, `installing as systemd service to "${(0, config_1.getConfig)().serviceInstallFile}"`);
        yield (0, promises_1.writeFile)((0, config_1.getConfig)().serviceInstallFile, serviceTemplate, 'utf-8');
        if (process.env.NODE_ENV === 'development') {
            console.log(TAG, 'skipped systemd init because app runs in development mode (NODE_ENV == "development")');
            return;
        }
        yield exec('sudo systemctl daemon-reload');
        yield exec('sudo systemctl stop 3cx-tools-server');
        yield exec('sudo systemctl start 3cx-tools-server');
        yield exec('sudo systemctl enable 3cx-tools-server');
        console.log(TAG, 'systemd service enabled and started.\nView service logs by typing: sudo journalctl -u 3cx-tools-server.service');
    });
}
exports.installAsService = installAsService;
function uninstallService() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        console.log(TAG, 'removing systemd service');
        try {
            if (process.env.NODE_ENV === 'development') {
                console.log(TAG, 'skipped systemd changes because app runs in development mode (NODE_ENV == "development")');
            }
            else {
                yield exec('sudo systemctl stop 3cx-tools-server');
                yield exec('sudo systemctl disable 3cx-tools-server');
            }
            yield (0, promises_1.unlink)((0, config_1.getConfig)().serviceInstallFile);
            console.log(TAG, 'systemd service stopped, disabled and removed.');
        }
        catch (err) {
            console.log(TAG, 'error removing service, maybe the service is already stopped/removed');
        }
    });
}
exports.uninstallService = uninstallService;
function checkIfServiceIsRunning() {
    try {
        (0, child_process_1.execSync)('systemctl is-active --quiet service', { stdio: 'ignore' });
        return true;
    }
    catch (_) {
        return false;
    }
}
exports.checkIfServiceIsRunning = checkIfServiceIsRunning;
//# sourceMappingURL=systemd.js.map