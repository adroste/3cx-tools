import { checkIfServiceIsRunning, installAsService, uninstallService } from './systemd';
import { installNginxProxySnippet, uninstallNginxProxySnippet } from './nginx-proxy-snippet';

import { Command } from 'commander';
import { connectTo3cxApi } from './api/connection';
import consoleStamp from 'console-stamp';
import { initDb } from './database';
import { initDialCodeApi } from './dial-code-api/dial-code-api';
import { initWsApi } from './api/ws-api';
import { installWebclientCallOverviewPanel } from './webclient-call-overview-panel';
import { loadConfig } from './config';
import { monitorActiveCalls } from './func/active-calls';
import { monitorCallLogs } from './func/call-logs';
import { monitorPhonebook } from './func/phonebook';
import { startCallerId } from './func/caller-id';
import { startPhonebookPatcherFanvil } from './func/phonebook-fanvil';
import { startPhonebookPatcherSnom } from './func/phonebook-snom';
import { startPhonebookPatcherYealink } from './func/phonebook-yealink';
import { startWebServer } from './web-server';

const banner = String.raw`
   _____ _______  __    ______            __    
  |__  // ____/ |/ /   /_  __/___  ____  / /____
   /_ </ /    |   /     / / / __ \/ __ \/ / ___/
 ___/ / /___ /   |     / / / /_/ / /_/ / (__  ) 
/____/\____//_/|_|    /_/  \____/\____/_/____/  
`;
console.log(banner);
console.log(`Service '3cx-tools-server' is: ${checkIfServiceIsRunning() ? 'ACTIVE' : 'NOT ACTIVE'}`);
console.log('\n');

consoleStamp(console); // add timestamp to log output

const program = new Command();
program
  .name("npm run start --")
  .usage("[command]");

program.addHelpText('after', `
Example call:
  $ npm run start -- install`);

program
  .command('install')
  .description('Installs service (systemd)')
  .action(async () => {
    await installAsService();
  });

program
  .command('uninstall')
  .description('Stops and removes service (systemd)')
  .action(async () => {
    await uninstallService();
    await uninstallNginxProxySnippet();
  });

program
  .command('run-as-service')
  .description('Starts the app as service')
  .action(async () => {
    console.log('running as service');
    // core
    await initDb();
    await installNginxProxySnippet();
    await connectTo3cxApi()


    // func modules
    await monitorPhonebook();
    await startCallerId();
    startPhonebookPatcherYealink();
    startPhonebookPatcherFanvil();
    startPhonebookPatcherSnom();
    monitorActiveCalls();
    monitorCallLogs();
    installWebclientCallOverviewPanel();

    // api
    await startWebServer();
    initWsApi();
    initDialCodeApi();
  });

(async () => {
  await loadConfig();
  program.parse();
})();