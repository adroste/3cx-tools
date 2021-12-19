import { exec as cbExec } from 'child_process';
import { getPath } from './path';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
const exec = promisify(cbExec);

const TAG = '[Service Installer]';

const serviceTemplate = `
[Unit]
Description=3cx-tools-server - custom plugins, tools for 3CX
Documentation=https://github.com/adroste/3cx-tools
After=network.target

[Service]
Environment=NODE_ENV=production
Environment=IS_SERVICE=true
Type=simple
User=root
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
`;


export async function installAsService() {
  if (process.env.IS_SERVICE) {
    console.log(TAG, 'running as service.');
    return;
  } else if (process.env.NO_SERVICE) {
    console.log(TAG, 'service init skipped');
    return;
  }

  console.log(TAG, 'installing as systemd service');
  await writeFile(getPath().serviceInstallPath, serviceTemplate, 'utf-8');

  if (process.env.NODE_ENV === 'development') {
    console.log(TAG, 'skipped systemd init because app runs in development mode (NODE_ENV == "development")');
    return;
  }

  await exec('sudo systemctl daemon-reload');
  await exec('sudo systemctl stop 3cx-tools-server');
  await exec('sudo systemctl start 3cx-tools-server');
  await exec('sudo systemctl enable 3cx-tools-server');
  console.log(TAG, 'systemd service enabled and started, exiting this instance.\nView service logs by typing: sudo journalctl -u 3cx-tools-server.service');
  process.exit();
}