import { downloadHlae } from 'csdm/node/video/hlae/download-hlae';
import { getHlaeFolderPath } from 'csdm/node/video/hlae/hlae-location';
import { handleError } from '../../handle-error';

export async function updateHlaeHandler() {
  try {
    const installationFolderPath = await getHlaeFolderPath();
    const version = await downloadHlae(installationFolderPath);

    return version;
  } catch (error) {
    handleError(error, 'Error while updating HLAE');
  }
}
