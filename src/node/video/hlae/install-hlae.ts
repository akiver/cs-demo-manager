import { isWindows } from 'csdm/node/os/is-windows';
import { downloadHlae } from './download-hlae';
import { getDefaultHlaeInstallationFolderPath } from './hlae-location';

export async function installHlae() {
  if (!isWindows) {
    throw new Error('HLAE is available only on Windows');
  }

  const installationFolderPath = getDefaultHlaeInstallationFolderPath();
  const version = await downloadHlae(installationFolderPath);

  return version;
}
