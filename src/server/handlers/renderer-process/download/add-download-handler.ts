import { downloadDemoQueue } from 'csdm/server/download-queue';
import type { Download } from 'csdm/common/download/download-types';
import { handleError } from '../../handle-error';

export async function addDownloadHandler(download: Download) {
  try {
    await downloadDemoQueue.addDownload(download);
  } catch (error) {
    handleError(error, 'Error while adding download');
  }
}
