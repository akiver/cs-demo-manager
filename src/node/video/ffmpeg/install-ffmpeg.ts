import fs from 'fs-extra';
import path from 'node:path';
import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { fetchLastFfmpegVersion } from './fetch-last-ffmpeg-version';
import { downloadAndExtractXzArchive } from 'csdm/node/filesystem/download-and-extract-xz-archive';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';
import { isLinux } from 'csdm/node/os/is-linux';
import { getDefaultFfmpegInstallationPath, getDefaultFfmpegExecutablePath } from './ffmpeg-location';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

function getArchiveName(version: string) {
  switch (true) {
    case isWindows:
      return `ffmpeg-n${version}-latest-win64-gpl-${version}.zip`;
    case isMac:
      return `ffmpeg-${version}.zip`;
    default:
      return `ffmpeg-n${version}-latest-linux64-gpl-${version}.tar.xz`;
  }
}

function getArchiveUrl(archiveName: string) {
  switch (true) {
    case isMac:
      return `https://evermeet.cx/ffmpeg/${archiveName}.zip`;
    default:
      return `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/${archiveName}`;
  }
}

export async function installFfmpeg(): Promise<string> {
  const lastVersion = await fetchLastFfmpegVersion();
  const archiveName = getArchiveName(lastVersion);
  const archiveUrl = getArchiveUrl(archiveName);

  const ffmpegFolderPath = getDefaultFfmpegInstallationPath();
  const extractArchivePath = isWindows ? getAppFolderPath() : ffmpegFolderPath;

  if (isLinux) {
    await downloadAndExtractXzArchive(archiveUrl, extractArchivePath);
  } else {
    await downloadAndExtractZipArchive(archiveUrl, extractArchivePath);
  }

  if (isWindows) {
    await fs.move(path.join(extractArchivePath, archiveName), ffmpegFolderPath, {
      overwrite: true,
    });
  } else {
    const ffmpegExecutablePath = getDefaultFfmpegExecutablePath();
    await fs.chmod(ffmpegExecutablePath, 0o755);
  }
  const versionWithoutDate = lastVersion.split('-')[0];

  return versionWithoutDate;
}
