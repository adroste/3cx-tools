import { DialCodes } from './dial-code-api/dial-code-api';
import { PHONE_NUMBER_PROPS } from './func/phonebook';
import { getProperPath } from './util';
import { readJson } from 'fs-extra';

const TAG = '[Config loader]';

export interface Config {
  // PBX paths
  ivrPromptsDir: string,
  pbxConfigJsonFile: string,
  provisioningDir: string,
  webclientDir: string,

  // app paths
  mcSettingsPanelBuildDir: string,
  nginxProxySnippetInstallFile: string,
  serviceInstallFile: string,
  webclientCallOverviewPanelBuildDir: string,

  // runtime config
  activeCallsCheckIntervalMs: number,
  dialCodes: DialCodes,
  httpPort: number,
  phoneNumberOrder: Array<typeof PHONE_NUMBER_PROPS[number]>,
}

let config: Config;

function fixPaths(config: Config) {
  (Object.keys(config) as Array<keyof Config>).forEach(key => {
    if (typeof config[key] === 'string')
      (config[key] as string) = getProperPath(config[key] as string);
  });
  return config;
}

export async function loadConfig() {
  const defaultConf = await readJson(getProperPath('./config.default.json'));
  let devConf, localConf;
  if (process.env.NODE_ENV === 'development')
    devConf = await readJson(getProperPath('./config.dev.json'));
  try {
    localConf = await readJson(getProperPath('./config.local.json'));
  } catch (_) {
    console.log(TAG, 'no local config (config.local.json) detected, using default values');
  }

  const merged: Config = {
    ...defaultConf,
    ...devConf,
    ...localConf,
  };
  config = fixPaths(merged);
  console.log(TAG, 'config loaded', config);
}

export function getConfig(): Config {
  if (!config)
    throw new Error('config was not loaded')
  return config;
}