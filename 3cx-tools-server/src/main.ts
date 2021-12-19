import consoleStamp from 'console-stamp';
import { initDb } from './database';
import { installAsService } from './systemd';
import { installWebclientCallOverviewPanel } from './webclient-call-overview-panel';
import { loadPathConfig } from './path';
import { runPhonebookPatcher } from './phonebook';

const banner = String.raw`
   _____ _______  __    ______            __    
  |__  // ____/ |/ /   /_  __/___  ____  / /____
   /_ </ /    |   /     / / / __ \/ __ \/ / ___/
 ___/ / /___ /   |     / / / /_/ / /_/ / (__  ) 
/____/\____//_/|_|    /_/  \____/\____/_/____/  
`;
console.log(banner);

consoleStamp(console); // add timestamp to log output

(async () => {
  await loadPathConfig();
  await installAsService();
  await initDb();
  installWebclientCallOverviewPanel();
  runPhonebookPatcher();
})();