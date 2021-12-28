"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWebclientCallOverviewPanel = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const lodash_1 = require("lodash");
const config_1 = require("./config");
const path_1 = require("path");
const TAG = '[Call Overview Panel]';
function patchIndexHtml() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const scriptTag = '<script src="/3cx-tools/call-overview-panel/integrate-webclient.js"></script>';
        const indexHtmlPath = (0, path_1.join)((0, config_1.getConfig)().webclientDir, '/index.html');
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
    const debouncedInstall = (0, lodash_1.debounce)((0, lodash_1.debounce)(installWebclientCallOverviewPanel, 10000, { leading: true, trailing: false }), 3000);
    fileWatcher = (0, fs_1.watch)((0, config_1.getConfig)().webclientDir, () => {
        debouncedInstall();
    });
}
function installWebclientCallOverviewPanel() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield patchIndexHtml();
        console.log(TAG, 'installed');
        if (!fileWatcher)
            registerFileWatcher();
    });
}
exports.installWebclientCallOverviewPanel = installWebclientCallOverviewPanel;
//# sourceMappingURL=webclient-call-overview-panel.js.map