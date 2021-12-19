import { FSWatcher, watch } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { copy } from 'fs-extra';
import { exec } from 'child_process';
import { getPath } from './path';
import { join } from 'path';
import { promisify } from 'util';
import { throttle } from 'lodash';

const TAG = '[Call Overview Panel]';

async function copyBuild() {
  const panelAppPath = join(getPath().webclientDir, '/tcx-tools-panel-app');
  await copy(getPath().webclientCallOverviewPanelBuildDir, panelAppPath);
  await promisify(exec)(`chmod -R ugo+rw "${panelAppPath}"`);
}

async function patchIndexHtml() {
  const scriptTag = '<script src="/webclient/tcx-tools-panel-app/integrate-webclient.js"></script>';
  const indexHtmlPath = join(getPath().webclientDir, '/index.html');

  const html = await readFile(indexHtmlPath, 'utf-8');
  if (!html.includes(scriptTag)) {
    const newHtml = html.replace('</body>', `${scriptTag}</body>`)
    await writeFile(indexHtmlPath, newHtml, 'utf-8');
  }
}

let fileWatcher: FSWatcher;
function registerFileWatcher() {
  console.log(TAG, 'watching for file modifications...')
  const throttledInstall = throttle(installWebclientCallOverviewPanel, 10000);
  fileWatcher = watch(getPath().webclientDir, () => {
    throttledInstall();
  });
}

export async function installWebclientCallOverviewPanel() {
  await copyBuild();
  await patchIndexHtml();
  console.log(TAG, 'installed');
  if (!fileWatcher)
    registerFileWatcher();
}