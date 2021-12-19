import { readJson } from 'fs-extra';

export interface PathConfig {
  configJson: string,
  provisioningDir: string,
  serviceInstallPath: string,
  webclientCallOverviewPanelBuildDir: string,
  webclientDir: string,
}

let pathConfig: PathConfig;

export async function loadPathConfig() {
  const path = process.env.NODE_ENV === 'development'
    ? './path.dev.json'
    : './path.prod.json';
  pathConfig = await readJson(path);
}

export function getPath(): PathConfig {
  if (!pathConfig)
    throw new Error('path config was not loaded')
  return pathConfig;
}