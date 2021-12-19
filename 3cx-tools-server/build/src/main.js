"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_stamp_1 = require("console-stamp");
const database_1 = require("./database");
const systemd_1 = require("./systemd");
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
(0, console_stamp_1.default)(console);
(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    yield (0, path_1.loadPathConfig)();
    yield (0, systemd_1.installAsService)();
    yield (0, database_1.initDb)();
    (0, webclient_call_overview_panel_1.installWebclientCallOverviewPanel)();
    (0, phonebook_1.runPhonebookPatcher)();
}))();
//# sourceMappingURL=main.js.map