import fs from 'fs-extra';
import path from 'node:path';
import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { fetchLastFfmpegRelease } from './fetch-last-ffmpeg-version';
import { downloadAndExtractXzArchive } from 'csdm/node/filesystem/download-and-extract-xz-archive';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';
import { isLinux } from 'csdm/node/os/is-linux';
import { getDefaultFfmpegInstallationPath, getDefaultFfmpegExecutablePath } from './ffmpeg-location';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

function getArchiveUrl(assetName: string) {
  switch (true) {
    case isMac:
      return `https://evermeet.cx/ffmpeg/${assetName}`;
    default:
      return `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/${assetName}`;
  }
}

export async function installFfmpeg(): Promise<string> {
  const { version: lastVersion, assetName } = await fetchLastFfmpegRelease();
  const archiveUrl = getArchiveUrl(assetName);

  const ffmpegFolderPath = getDefaultFfmpegInstallationPath();
  const extractArchivePath = isWindows ? getAppFolderPath() : ffmpegFolderPath;

  if (isLinux) {
    await downloadAndExtractXzArchive(archiveUrl, extractArchivePath);
  } else {
    await downloadAndExtractZipArchive(archiveUrl, extractArchivePath);
  }

  if (isWindows) {
    const extractedFolderName = assetName.replace(/\.zip$/, '');
    await fs.move(path.join(extractArchivePath, extractedFolderName), ffmpegFolderPath, {
      overwrite: true,
    });
  } else {
    const ffmpegExecutablePath = getDefaultFfmpegExecutablePath();
    await fs.chmod(ffmpegExecutablePath, 0o755);
  }
  const versionWithoutDate = lastVersion.split('-')[0];

  return versionWithoutDate;
}
