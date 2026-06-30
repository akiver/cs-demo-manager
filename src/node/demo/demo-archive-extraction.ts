import path from 'node:path';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'fs-extra';
import StreamZip from 'node-stream-zip';
import bz2 from 'unbzip2-stream';
import type { ArchiveFormat } from 'csdm/common/types/archive-format';

export type DemoArchiveEntry = {
  // Name (path) of the .dem entry inside the archive. For single-stream archives (.gz/.bz2) it's the demo file name.
  entryName: string;
  // Path where the demo is extracted on the filesystem, flat next to the archive.
  destinationPath: string;
  // Name (path) of the sibling .dem.info entry inside the archive, if any (Valve demos only).
  infoFileName?: string;
};

export function buildArchiveSearchPatterns(formats: ArchiveFormat[], includeSubFolders: boolean): string[] {
  return formats.map((format) => {
    return includeSubFolders ? `**/*.${format}` : `*.${format}`;
  });
}

// Lists the demos held by the archive that are not yet extracted next to it.
// queuedDestinationPaths is used to avoid queuing the same destination path twice (e.g. two demos in different
// sub-folders of a .zip that flatten to the same destination path).
export async function getDemosToExtractFromArchive(
  archivePath: string,
  queuedDestinationPaths: Set<string> = new Set(),
): Promise<DemoArchiveEntry[]> {
  const extension = path.extname(archivePath).toLowerCase();

  // .zip may hold several demos. Extract them flat next to the archive so demos in sub-folders are also discovered.
  if (extension === '.zip') {
    const demosToExtract: DemoArchiveEntry[] = [];
    const zip = new StreamZip.async({ file: archivePath });
    try {
      const entries = await zip.entries();
      const destinationFolderPath = path.dirname(archivePath);

      for (const entry of Object.values(entries)) {
        if (entry.isDirectory || !entry.name.toLowerCase().endsWith('.dem')) {
          continue;
        }

        const destinationPath = path.join(destinationFolderPath, path.basename(entry.name));
        // Different entries (e.g. same file name in different sub-folders) may flatten to the same destination path.
        // Skip the duplicates instead of letting one silently overwrite another during extraction.
        if (queuedDestinationPaths.has(destinationPath)) {
          continue;
        }

        const alreadyExtracted = await fs.pathExists(destinationPath);
        if (alreadyExtracted) {
          continue;
        }

        queuedDestinationPaths.add(destinationPath);

        const demoToExtract: DemoArchiveEntry = { entryName: entry.name, destinationPath };

        // Valve demos may ship with a sibling .dem.info file holding match metadata, extract it too.
        const infoFileName = `${entry.name}.info`;
        if (entries[infoFileName]) {
          demoToExtract.infoFileName = infoFileName;
        }

        demosToExtract.push(demoToExtract);
      }
    } finally {
      await zip.close();
    }

    return demosToExtract;
  }

  // .gz/.bz2 hold a single compressed demo; its extracted name is the archive name minus the compression extension
  // (e.g. match.dem.gz -> match.dem).
  const destinationPath = archivePath.slice(0, -extension.length);
  const isDemFile = destinationPath.toLowerCase().endsWith('.dem');
  const isQueued = queuedDestinationPaths.has(destinationPath);
  if (!isDemFile || isQueued || (await fs.pathExists(destinationPath))) {
    return [];
  }

  queuedDestinationPaths.add(destinationPath);

  return [{ entryName: path.basename(destinationPath), destinationPath }];
}

export async function extractDemosFromArchive(
  archivePath: string,
  demosToExtract: DemoArchiveEntry[],
  onExtractingDemo?: () => void,
): Promise<void> {
  if (demosToExtract.length === 0) {
    return;
  }

  const extension = path.extname(archivePath).toLowerCase();

  if (extension === '.zip') {
    const zip = new StreamZip.async({ file: archivePath });
    try {
      for (const { entryName, destinationPath, infoFileName } of demosToExtract) {
        onExtractingDemo?.();
        const tempDestinationPath = `${destinationPath}.tmp`;
        try {
          await zip.extract(entryName, tempDestinationPath);
          await fs.rename(tempDestinationPath, destinationPath);
        } catch (error) {
          await fs.remove(tempDestinationPath);
          throw error;
        }
        if (infoFileName) {
          await zip.extract(infoFileName, `${destinationPath}.info`);
        }
      }
    } finally {
      await zip.close();
    }

    return;
  }

  const [{ destinationPath }] = demosToExtract;
  onExtractingDemo?.();
  const decompressStream = extension === '.bz2' ? bz2() : zlib.createGunzip();
  const tempDestinationPath = `${destinationPath}.tmp`;
  try {
    await pipeline(createReadStream(archivePath), decompressStream, createWriteStream(tempDestinationPath));
    await fs.rename(tempDestinationPath, destinationPath);
  } catch (error) {
    await fs.remove(tempDestinationPath);
    throw error;
  }
}
