"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallNginxProxySnippet = exports.installNginxProxySnippet = void 0;
const tslib_1 = require("tslib");
const promises_1 = require("fs/promises");
const child_process_1 = require("child_process");
const config_1 = require("./config");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
const TAG = '[Nginx Proxy Snippet Installer]';
const proxySnippetTemplate = (httpPort) => `
location ^~ /3cx-tools/ {
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "0";
  add_header Content-Security-Policy "default-src 'self' 'unsafe-inline'; img-src 'self' data:;";
  add_header Strict-Transport-Security max-age=15768000;

  proxy_pass          http://localhost:${httpPort};
  proxy_http_version  1.1;
  proxy_set_header    Upgrade $http_upgrade;
  proxy_set_header    Connection $connection_upgrade;
  proxy_set_header    Host $host:$server_port;

  proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
}
`;
function installNginxProxySnippet() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (yield (0, promises_1.stat)((0, config_1.getConfig)().nginxProxySnippetInstallFile).then(() => true, () => false)) {
            console.log(TAG, `nginx proxy snippet already installed, skipping install`);
            return;
        }
        yield (0, promises_1.writeFile)((0, config_1.getConfig)().nginxProxySnippetInstallFile, proxySnippetTemplate((0, config_1.getConfig)().httpPort), 'utf-8');
        console.log(TAG, `installed nginx proxy snippet to "${(0, config_1.getConfig)().nginxProxySnippetInstallFile}"`);
        if (process.env.NODE_ENV === 'development') {
            console.log(TAG, 'skipped systemd nginx reload because app runs in development mode (NODE_ENV == "development")');
            return;
        }
        yield exec('sudo systemctl restart nginx');
        console.log(TAG, 'reloaded service nginx');
    });
}
exports.installNginxProxySnippet = installNginxProxySnippet;
function uninstallNginxProxySnippet() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, promises_1.unlink)((0, config_1.getConfig)().nginxProxySnippetInstallFile);
        console.log(TAG, `removed nginx proxy snippet from "${(0, config_1.getConfig)().nginxProxySnippetInstallFile}"`);
        if (process.env.NODE_ENV === 'development') {
            console.log(TAG, 'skipped systemd nginx reload because app runs in development mode (NODE_ENV == "development")');
            return;
        }
        yield exec('sudo systemctl restart nginx');
        console.log(TAG, 'reloaded service nginx');
    });
}
exports.uninstallNginxProxySnippet = uninstallNginxProxySnippet;
//# sourceMappingURL=nginx-proxy-snippet.js.map