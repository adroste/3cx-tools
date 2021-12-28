import { exec as cbExec, execSync } from 'child_process';
import { unlink, writeFile } from 'fs/promises';

import { getConfig } from './config';
import { promisify } from 'util';

const exec = promisify(cbExec);

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


export async function installAsService() {
  console.log(TAG, `installing as systemd service to "${getConfig().serviceInstallFile}"`);
  await writeFile(getConfig().serviceInstallFile, serviceTemplate, 'utf-8');

  if (process.env.NODE_ENV === 'development') {
    console.log(TAG, 'skipped systemd init because app runs in development mode (NODE_ENV == "development")');
    return;
  }

  await exec('sudo systemctl daemon-reload');
  await exec('sudo systemctl stop 3cx-tools-server');
  await exec('sudo systemctl start 3cx-tools-server');
  await exec('sudo systemctl enable 3cx-tools-server');
  console.log(TAG, 'systemd service enabled and started.\nView service logs by typing: sudo journalctl -u 3cx-tools-server.service');
}

export async function uninstallService() {
  console.log(TAG, 'removing systemd service');

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(TAG, 'skipped systemd changes because app runs in development mode (NODE_ENV == "development")');
    } else {
        await exec('sudo systemctl stop 3cx-tools-server');
        await exec('sudo systemctl disable 3cx-tools-server');
    }

    await unlink(getConfig().serviceInstallFile);
    console.log(TAG, 'systemd service stopped, disabled and removed.');
  } catch (err) {
    console.log(TAG, 'error removing service, maybe the service is already stopped/removed')
  }
}

export function checkIfServiceIsRunning() {
  try {
    execSync('systemctl is-active --quiet service', { stdio: 'ignore' });
    return true; // exit code 0 => service is running;
  } catch (_) {
    return false; // other exit codes
  }
}