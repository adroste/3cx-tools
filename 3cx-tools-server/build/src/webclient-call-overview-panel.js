"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWebclientCallOverviewPanel = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
const path_1 = require("./path");
const path_2 = require("path");
const util_1 = require("util");
const lodash_1 = require("lodash");
const TAG = '[Call Overview Panel]';
function copyBuild() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const panelAppPath = (0, path_2.join)((0, path_1.getPath)().webclientDir, '/tcx-tools-panel-app');
        yield (0, fs_extra_1.copy)((0, path_1.getPath)().webclientCallOverviewPanelBuildDir, panelAppPath);
        yield (0, util_1.promisify)(child_process_1.exec)(`chmod -R ugo+rw "${panelAppPath}"`);
    });
}
function patchIndexHtml() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const scriptTag = '<script src="/webclient/tcx-tools-panel-app/integrate-webclient.js"></script>';
        const indexHtmlPath = (0, path_2.join)((0, path_1.getPath)().webclientDir, '/index.html');
        const html = yield (0, promises_1.readFile)(indexHtmlPath, 'utf-8');
        if (!html.includes(scriptTag)) {
            const newHtml = html.replace('</body>', `${scriptTag}</body>`);
            yield (0, promises_1.writeFile)(indexHtmlPath, newHtml, 'utf-8');
        }
    });
}
let fileWatcher;
function registerFileWatcher() {
    console.log(TAG, 'watching for file modifications...');
    const throttledInstall = (0, lodash_1.throttle)(installWebclientCallOverviewPanel, 3000);
    fileWatcher = (0, fs_1.watch)((0, path_1.getPath)().webclientDir, () => {
        throttledInstall();
    });
}
function installWebclientCallOverviewPanel() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield copyBuild();
        yield patchIndexHtml();
        console.log(TAG, 'installed');
        if (!fileWatcher)
            registerFileWatcher();
    });
}
exports.installWebclientCallOverviewPanel = installWebclientCallOverviewPanel;
//# sourceMappingURL=webclient-call-overview-panel.js.map