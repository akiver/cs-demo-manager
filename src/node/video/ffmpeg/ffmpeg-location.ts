import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';

export function getDefaultFfmpegInstallationPath() {
  return path.join(getAppFolderPath(), 'ffmpeg');
}

export function getDefaultFfmpegExecutablePath() {
  const ffmpegFolderPath = getDefaultFfmpegInstallationPath();
  if (isWindows) {
    // The FFmpeg executable is located inside a "bin" folder on Windows
    return path.join(ffmpegFolderPath, 'bin', 'ffmpeg.exe');
  }

  return path.join(ffmpegFolderPath, 'ffmpeg');
}

export async function getFfmpegExecutablePath() {
  const { video } = await getSettings();
  const { ffmpegSettings } = video;
  if (ffmpegSettings.customLocationEnabled && ffmpegSettings.customExecutableLocation !== '') {
    return ffmpegSettings.customExecutableLocation;
  }

  return getDefaultFfmpegExecutablePath();
}
