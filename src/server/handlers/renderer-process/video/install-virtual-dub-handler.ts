import { downloadAndExtractVirtualDub } from 'csdm/node/video/virtual-dub/download-and-extract-virtual-dub';
import { handleError } from '../../handle-error';

export async function installVirtualDubHandler() {
  try {
    const version = await downloadAndExtractVirtualDub();

    return version;
  } catch (error) {
    handleError(error, 'Error while installing VirtualDub');
  }
}
