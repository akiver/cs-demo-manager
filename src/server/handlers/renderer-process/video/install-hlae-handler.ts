import { handleError } from '../../handle-error';
import { installHlae } from 'csdm/node/video/hlae/install-hlae';

export async function installHlaeHandler() {
  try {
    const version = await installHlae();

    return version;
  } catch (error) {
    handleError(error, 'Error while installing HLAE');
  }
}
