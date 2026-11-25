import path from 'node:path';
import { analyzeDemo, type Options as AnalyzeOptions } from '@akiver/cs-demo-analyzer';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoHeader } from 'csdm/node/demo/get-demo-header';
import { getDemoMapNameFromHeader } from 'csdm/node/demo/get-demo-from-file-path';
import { prepareMapGeometry } from 'csdm/node/map-geometry/prepare-map-geometry';
import { CorruptedDemoError } from './corrupted-demo-error';

type RunDemoAnalyzerOptions = Omit<AnalyzeOptions, 'format' | 'executablePath' | 'mapGeometryFolderPath'> & {
  onMapGeometryDownload?: (mapName: string) => void;
};

// Returns the folder containing the collision geometry of the demo's map used to compute the time to damage/kill.
async function getMapGeometryFolderPath(
  demoPath: string,
  onMapGeometryDownload: RunDemoAnalyzerOptions['onMapGeometryDownload'],
) {
  try {
    const settings = await getSettings();
    if (!settings.analyze.computeTimeToDamage) {
      return undefined;
    }

    const header = await getDemoHeader(demoPath);
    // Map geometry is only available for CS2 demos.
    if (header.filestamp === 'HL2DEMO') {
      return undefined;
    }

    return await prepareMapGeometry({
      mapName: getDemoMapNameFromHeader(header),
      onDownloadStart: onMapGeometryDownload,
    });
  } catch (error) {
    logger.error('Failed to get the map geometry folder path');
    logger.error(error);
    return undefined;
  }
}

export async function runDemoAnalyzer({ onMapGeometryDownload, ...options }: RunDemoAnalyzerOptions): Promise<void> {
  const executablePath = path.join(getStaticFolderPath(), isWindows ? 'csda.exe' : 'csda');
  const mapGeometryFolderPath = await getMapGeometryFolderPath(options.demoPath, onMapGeometryDownload);

  await analyzeDemo({
    ...options,
    executablePath,
    mapGeometryFolderPath,
    format: 'csdm',
    onStderr: (data) => {
      options.onStderr?.(data);
      if (data.includes('ErrUnexpectedEndOfDemo')) {
        throw new CorruptedDemoError();
      }
    },
  });
}
