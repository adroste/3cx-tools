import { stat, unlink, writeFile } from 'fs/promises';

import { exec as cbExec } from 'child_process';
import { getConfig } from './config';
import { promisify } from 'util';

const exec = promisify(cbExec);

const TAG = '[Nginx Proxy Snippet Installer]';

const proxySnippetTemplate = (httpPort: number) => `
location ~ ^/3cx-tools {
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

export async function installNginxProxySnippet() {
  if (await stat(getConfig().nginxProxySnippetInstallFile).then(() => true, () => false)) {
    console.log(TAG, `nginx proxy snippet already installed, skipping install`);
    return;
  }
    
  await writeFile(getConfig().nginxProxySnippetInstallFile, proxySnippetTemplate(getConfig().httpPort), 'utf-8');
  console.log(TAG, `installed nginx proxy snippet to "${getConfig().nginxProxySnippetInstallFile}"`);

  if (process.env.NODE_ENV === 'development') {
    console.log(TAG, 'skipped systemd nginx reload because app runs in development mode (NODE_ENV == "development")');
    return;
  }

  await exec('sudo systemctl restart nginx');
  console.log(TAG, 'reloaded service nginx');
}

export async function uninstallNginxProxySnippet() {
  await unlink(getConfig().nginxProxySnippetInstallFile);
  console.log(TAG, `removed nginx proxy snippet from "${getConfig().nginxProxySnippetInstallFile}"`);

  if (process.env.NODE_ENV === 'development') {
    console.log(TAG, 'skipped systemd nginx reload because app runs in development mode (NODE_ENV == "development")');
    return;
  }

  await exec('sudo systemctl restart nginx');
  console.log(TAG, 'reloaded service nginx');
}