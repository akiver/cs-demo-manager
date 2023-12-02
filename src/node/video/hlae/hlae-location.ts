import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { getSettings } from 'csdm/node/settings/get-settings';

export function getDefaultHlaeInstallationFolderPath(): string {
  return path.join(getAppFolderPath(), 'hlae');
}

export async function getHlaeFolderPath(): Promise<string> {
  const { video } = await getSettings();
  const { hlae } = video;
  if (hlae.customLocationEnabled && hlae.customExecutableLocation !== '') {
    return path.dirname(hlae.customExecutableLocation);
  }

  return getDefaultHlaeInstallationFolderPath();
}

export function getDefaultHlaeExecutablePath(): string {
  const hlaeFolderPath = getDefaultHlaeInstallationFolderPath();

  return path.join(hlaeFolderPath, 'hlae.exe');
}

export async function getHlaeExecutablePath(): Promise<string> {
  const hlaeFolderPath = await getHlaeFolderPath();

  return path.join(hlaeFolderPath, 'hlae.exe');
}
