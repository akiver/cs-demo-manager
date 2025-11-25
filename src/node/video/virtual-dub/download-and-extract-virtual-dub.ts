import fs from 'fs-extra';
import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { getVirtualDubFolderPath } from './get-virtual-dub-folder-path';
import { getVirtualDubVersionFilePath } from './get-virtual-dub-version-file-path';
import { VIRTUALDUB_VERSION } from './virtual-dub-version';
import { isWindows } from 'csdm/node/os/is-windows';

async function writeVersionFile(version: string) {
  const versionFilePath = getVirtualDubVersionFilePath();
  await fs.writeFile(versionFilePath, version);
}

export async function downloadAndExtractVirtualDub() {
  if (isWindows) {
    throw new Error('VirtualDub is available only on Windows');
  }

  const zipFilename =
    process.arch === 'x64' ? `VirtualDub-${VIRTUALDUB_VERSION}-AMD64` : `VirtualDub-${VIRTUALDUB_VERSION}`;
  const zipUrl = `https://freefr.dl.sourceforge.net/project/virtualdub/virtualdub-win/1.10.4.35491/${zipFilename}.zip`;
  const virtualDubFolderPath = getVirtualDubFolderPath();
  await downloadAndExtractZipArchive(zipUrl, virtualDubFolderPath);
  await writeVersionFile(VIRTUALDUB_VERSION);

  return VIRTUALDUB_VERSION;
}
