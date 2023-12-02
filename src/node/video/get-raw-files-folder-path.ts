import fs from 'fs-extra';
import path from 'node:path';
import { isWindows } from 'csdm/node/os/is-windows';
import type { VideoSettings } from 'csdm/node/settings/settings';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { getCsgoFolderPathOrThrow } from 'csdm/node/counter-strike/get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';

export async function getRawFilesFolderPath(settings: VideoSettings, demoFilePath: string) {
  const currentRawFilesFolderPath = settings.rawFilesFolderPath;

  const currentRawFilesFolderExists = await fs.pathExists(currentRawFilesFolderPath);
  if (currentRawFilesFolderPath !== '' && currentRawFilesFolderExists) {
    return currentRawFilesFolderPath;
  }

  let rawFilesFolderPath: string;
  if (isWindows) {
    rawFilesFolderPath = path.dirname(demoFilePath);
  } else {
    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CSGO);
    rawFilesFolderPath = path.join(csgoFolderPath, 'csgo');
  }
  await updateSettings({
    video: {
      rawFilesFolderPath,
    },
  });

  return rawFilesFolderPath;
}
