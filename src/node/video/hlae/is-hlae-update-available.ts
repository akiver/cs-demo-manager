import { getInstalledHlaeVersion } from './get-installed-hlae-version';
import { checkForHlaeUpdate } from './check-for-hlae-update';

export async function isHlaeUpdateAvailable(): Promise<boolean> {
  const currentVersion = await getInstalledHlaeVersion();
  if (currentVersion === undefined) {
    return false;
  }

  const isUpdateAvailable = await checkForHlaeUpdate(currentVersion);

  return isUpdateAvailable;
}
