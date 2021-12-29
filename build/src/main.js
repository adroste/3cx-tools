"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const systemd_1 = require("./systemd");
const nginx_proxy_snippet_1 = require("./nginx-proxy-snippet");
const commander_1 = require("commander");
const connection_1 = require("./api/connection");
const console_stamp_1 = require("console-stamp");
const database_1 = require("./database");
const dial_code_api_1 = require("./dial-code-api/dial-code-api");
const ws_api_1 = require("./api/ws-api");
const webclient_call_overview_panel_1 = require("./webclient-call-overview-panel");
const config_1 = require("./config");
const active_calls_1 = require("./func/active-calls");
const call_logs_1 = require("./func/call-logs");
const phonebook_1 = require("./func/phonebook");
const caller_id_1 = require("./func/caller-id");
const phonebook_fanvil_1 = require("./func/phonebook-fanvil");
const phonebook_snom_1 = require("./func/phonebook-snom");
const phonebook_yealink_1 = require("./func/phonebook-yealink");
const web_server_1 = require("./web-server");
const banner = String.raw `
   _____ _______  __    ______            __    
  |__  // ____/ |/ /   /_  __/___  ____  / /____
   /_ </ /    |   /     / / / __ \/ __ \/ / ___/
 ___/ / /___ /   |     / / / /_/ / /_/ / (__  ) 
/____/\____//_/|_|    /_/  \____/\____/_/____/  
`;
console.log(banner);
console.log(`Service '3cx-tools-server' is: ${(0, systemd_1.checkIfServiceIsRunning)() ? 'ACTIVE' : 'NOT ACTIVE'}`);
console.log('\n');
(0, console_stamp_1.default)(console);
const program = new commander_1.Command();
program
    .name("npm run start --")
    .usage("[command]");
program.addHelpText('after', `
Example call:
  $ npm run start -- install`);
program
    .command('install')
    .description('Installs service (systemd)')
    .action(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, systemd_1.installAsService)();
}));
program
    .command('uninstall')
    .description('Stops and removes service (systemd)')
    .action(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, systemd_1.uninstallService)();
    yield (0, nginx_proxy_snippet_1.uninstallNginxProxySnippet)();
}));
program
    .command('run-as-service')
    .description('Starts the app as service')
    .action(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    console.log('running as service');
    yield (0, database_1.initDb)();
    yield (0, nginx_proxy_snippet_1.installNginxProxySnippet)();
    yield (0, connection_1.connectTo3cxApi)();
    yield (0, phonebook_1.monitorPhonebook)();
    yield (0, caller_id_1.startCallerId)();
    (0, phonebook_yealink_1.startPhonebookPatcherYealink)();
    (0, phonebook_fanvil_1.startPhonebookPatcherFanvil)();
    (0, phonebook_snom_1.startPhonebookPatcherSnom)();
    (0, active_calls_1.monitorActiveCalls)();
    (0, call_logs_1.monitorCallLogs)();
    (0, webclient_call_overview_panel_1.installWebclientCallOverviewPanel)();
    yield (0, web_server_1.startWebServer)();
    (0, ws_api_1.initWsApi)();
    (0, dial_code_api_1.initDialCodeApi)();
}));
(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, config_1.loadConfig)();
    program.parse();
}))();
//# sourceMappingURL=main.js.map