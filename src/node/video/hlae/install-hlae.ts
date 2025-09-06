import { downloadHlae } from './download-hlae';
import { getDefaultHlaeInstallationFolderPath } from './hlae-location';

export async function installHlae() {
  const installationFolderPath = getDefaultHlaeInstallationFolderPath();
  const version = await downloadHlae(installationFolderPath);

  return version;
}
