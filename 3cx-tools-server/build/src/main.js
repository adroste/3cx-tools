"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const systemd_1 = require("./systemd");
const commander_1 = require("commander");
const console_stamp_1 = require("console-stamp");
const database_1 = require("./database");
const webclient_call_overview_panel_1 = require("./webclient-call-overview-panel");
const path_1 = require("./path");
const phonebook_1 = require("./phonebook");
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
}));
program
    .command('run-as-service')
    .description('Starts the app as service')
    .action(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    console.log('running as service');
    yield (0, database_1.initDb)();
    (0, webclient_call_overview_panel_1.installWebclientCallOverviewPanel)();
    (0, phonebook_1.runPhonebookPatcher)();
}));
(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, path_1.loadPathConfig)();
    program.parse();
}))();
//# sourceMappingURL=main.js.map