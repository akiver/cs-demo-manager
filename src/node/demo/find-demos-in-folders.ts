import { glob } from 'csdm/node/filesystem/glob';
import type { Folder } from '../settings/settings';
import { uniqueArray } from 'csdm/common/array/unique-array';
import { getSettings } from 'csdm/node/settings/get-settings';
import type { ArchiveFormat } from 'csdm/common/types/archive-format';
import {
  extractDemosFromArchive,
  buildArchiveSearchPatterns,
  getDemosToExtractFromArchive,
  type DemoArchiveEntry,
} from './demo-archive-extraction';

type ExtractDemosProgress = (extractingDemoNumber: number, demoToExtractCount: number) => void;
type ScanArchivesProgress = (scannedArchiveNumber: number, archiveCount: number) => void;

export type FindDemosProgressCallbacks = {
  onScanArchivesProgress?: ScanArchivesProgress;
  onExtractDemosProgress?: ExtractDemosProgress;
};

async function findArchivesInFolders(folders: Folder[], formats: ArchiveFormat[]): Promise<string[]> {
  const archivePaths: string[] = [];
  for (const folder of folders) {
    const patterns = buildArchiveSearchPatterns(formats, folder.includeSubFolders);
    const paths = await glob(patterns, {
      cwd: folder.path,
      absolute: true,
    });
    archivePaths.push(...paths);
  }

  return uniqueArray(archivePaths);
}

type ExtractDemosFromArchivesArgs = FindDemosProgressCallbacks & {
  folders: Folder[];
  formats: ArchiveFormat[];
};

async function extractDemosFromArchives({
  folders,
  formats,
  onScanArchivesProgress,
  onExtractDemosProgress,
}: ExtractDemosFromArchivesArgs) {
  if (formats.length === 0) {
    return;
  }

  const archivePaths = await findArchivesInFolders(folders, formats);
  if (archivePaths.length === 0) {
    return;
  }

  // Resolve the demos that still need to be extracted upfront so the progress reflects the actual
  // number of demos to extract and not the number of archives (most of which may already be extracted).
  const archives: { archivePath: string; demosToExtract: DemoArchiveEntry[] }[] = [];
  let demoToExtractCount = 0;
  // Shared across all archives so two archives that resolve to the same destination path (e.g. same demo file name)
  // aren't both queued for extraction, which would let the second extraction silently overwrite the first.
  const queuedDestinationPaths = new Set<string>();
  let scannedArchiveNumber = 0;
  for (const archivePath of archivePaths) {
    try {
      const demosToExtract = await getDemosToExtractFromArchive(archivePath, queuedDestinationPaths);
      if (demosToExtract.length > 0) {
        archives.push({ archivePath, demosToExtract });
        demoToExtractCount += demosToExtract.length;
      }
    } catch (error) {
      logger.error(`Error while reading archive ${archivePath}`);
      logger.error(error);
    } finally {
      scannedArchiveNumber += 1;
      onScanArchivesProgress?.(scannedArchiveNumber, archivePaths.length);
    }
  }

  if (demoToExtractCount === 0) {
    return;
  }

  let extractedDemoCount = 0;
  for (const { archivePath, demosToExtract } of archives) {
    let extractedFromArchive = 0;
    try {
      await extractDemosFromArchive(archivePath, demosToExtract, () => {
        extractedFromArchive += 1;
        onExtractDemosProgress?.(extractedDemoCount + extractedFromArchive, demoToExtractCount);
      });
    } catch (error) {
      logger.error(`Error while extracting demos from archive ${archivePath}`);
      logger.error(error);
    } finally {
      // Count the whole archive whether it fully succeeded or failed partway, so progress reaches 100%.
      extractedDemoCount += demosToExtract.length;
      onExtractDemosProgress?.(extractedDemoCount, demoToExtractCount);
    }
  }
}

export async function findDemosInFolders(folders: Folder[], progressCallbacks: FindDemosProgressCallbacks = {}) {
  // Extract demos from compressed archives found in the folders, if any. This is done before searching for demos so
  // that demos in archives are also discovered. Only the archive formats enabled in the settings are extracted.
  const settings = await getSettings();
  await extractDemosFromArchives({
    folders,
    formats: settings.autoExtractDemosFromArchives,
    ...progressCallbacks,
  });

  const demoPaths: string[] = [];
  for (const folder of folders) {
    const pattern = folder.includeSubFolders ? '**/*.dem' : '*.dem';
    const files = await glob(pattern, {
      cwd: folder.path,
      absolute: true,
    });
    demoPaths.push(...files);
  }

  return uniqueArray(demoPaths);
}
