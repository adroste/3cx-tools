import { readJson } from 'fs-extra';

const TAG = '[Config loader]';

export interface Config {
  // PBX paths
  pbxConfigJsonFile: string,
  provisioningDir: string,
  webclientDir: string,

  // app paths
  nginxProxySnippetInstallFile: string,
  serviceInstallFile: string,
  webclientCallOverviewPanelBuildDir: string,

  // runtime config
  activeCallsCheckIntervalMs: number,
  httpPort: number,
}

let config: Config;

export async function loadConfig() {
  const defaultConf = await readJson('./config.default.json');
  let devConf, localConf;
  if (process.env.NODE_ENV === 'development')
    devConf = await readJson('./config.dev.json');
  try {
    localConf = await readJson('./config.local.json');
  } catch (_) {
    console.log(TAG, 'no local config (config.local.json) detected, using default values');
  }

  config = {
    ...defaultConf,
    ...devConf,
    ...localConf,
  };

  console.log(TAG, 'config loaded');
}

export function getConfig(): Config {
  if (!config)
    throw new Error('config was not loaded')
  return config;
}