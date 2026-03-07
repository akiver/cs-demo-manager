import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';
import { isMac } from 'csdm/node/os/is-mac';

export function getDefaultFfmpegInstallationPath() {
  return path.join(getAppFolderPath(), 'ffmpeg');
}

export function getDefaultFfmpegExecutablePath() {
  const ffmpegFolderPath = getDefaultFfmpegInstallationPath();

  if (isMac) {
    return path.join(ffmpegFolderPath, 'ffmpeg');
  }

  return path.join(ffmpegFolderPath, 'bin', isWindows ? 'ffmpeg.exe' : 'ffmpeg');
}

export async function getFfmpegExecutablePath() {
  const { video } = await getSettings();
  const { ffmpegSettings } = video;
  if (ffmpegSettings.customLocationEnabled && ffmpegSettings.customExecutableLocation !== '') {
    return ffmpegSettings.customExecutableLocation;
  }

  return getDefaultFfmpegExecutablePath();
}
