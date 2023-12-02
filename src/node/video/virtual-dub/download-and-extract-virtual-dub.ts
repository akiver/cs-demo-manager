import fs from 'fs-extra';
import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { getVirtualDubFolderPath } from './get-virtual-dub-folder-path';
import { getVirtualDubVersionFilePath } from './get-virtual-dub-version-file-path';
import { VIRTUALDUB_VERSION } from './virtual-dub-version';

async function writeVersionFile(version: string) {
  const versionFilePath: string = getVirtualDubVersionFilePath();
  await fs.writeFile(versionFilePath, version);
}

export async function downloadAndExtractVirtualDub(): Promise<string> {
  const zipFilename: string =
    process.arch === 'x64' ? `VirtualDub-${VIRTUALDUB_VERSION}-AMD64` : `VirtualDub-${VIRTUALDUB_VERSION}`;
  const zipUrl: string = `https://freefr.dl.sourceforge.net/project/virtualdub/virtualdub-win/1.10.4.35491/${zipFilename}.zip`;
  const virtualDubFolderPath: string = getVirtualDubFolderPath();
  await downloadAndExtractZipArchive(zipUrl, virtualDubFolderPath);
  await writeVersionFile(VIRTUALDUB_VERSION);

  return VIRTUALDUB_VERSION;
}
