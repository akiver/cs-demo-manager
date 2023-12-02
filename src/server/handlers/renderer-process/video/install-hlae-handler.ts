import { downloadHlae } from 'csdm/node/video/hlae/download-hlae';
import { getDefaultHlaeInstallationFolderPath } from 'csdm/node/video/hlae/hlae-location';
import { handleError } from '../../handle-error';

export async function installHlaeHandler() {
  try {
    const installationFolderPath = getDefaultHlaeInstallationFolderPath();
    const version = await downloadHlae(installationFolderPath);

    return version;
  } catch (error) {
    handleError(error, 'Error while installing HLAE');
  }
}
