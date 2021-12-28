import { FSWatcher, watch } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { debounce } from 'lodash';
import { getConfig } from './config';
import { join } from 'path';

const TAG = '[Call Overview Panel]';

async function patchIndexHtml() {
  const scriptTag = '<script src="/3cx-tools/call-overview-panel/integrate-webclient.js"></script>';
  const indexHtmlPath = join(getConfig().webclientDir, '/index.html');

  const html = await readFile(indexHtmlPath, 'utf-8');
  if (!html.includes(scriptTag)) {
    const newHtml = html.replace('</body>', `${scriptTag}</body>`)
    await writeFile(indexHtmlPath, newHtml, 'utf-8');
  }
}

let fileWatcher: FSWatcher;
function registerFileWatcher() {
  console.log(TAG, 'watching for file modifications...')
  // The "Double Debounce":
  // outer debounce: group and wait for multiple file changes in directory
  const debouncedInstall = debounce(
    // inner debounce: prevent infinite recursion when writing a watched file/folder
    debounce(installWebclientCallOverviewPanel, 10000, { leading: true, trailing: false })
  , 3000);
  fileWatcher = watch(getConfig().webclientDir, () => {
    debouncedInstall();
  });
}

export async function installWebclientCallOverviewPanel() {
  await patchIndexHtml();
  console.log(TAG, 'installed');
  if (!fileWatcher)
    registerFileWatcher();
}