import { downloadDemoQueue } from 'csdm/server/download-queue';
import { handleError } from '../../handle-error';

export async function abortDownloadsHandler() {
  try {
    downloadDemoQueue.abortDownloads();
    return Promise.resolve();
  } catch (error) {
    handleError(error, 'Error while aborting downloads');
  }
}
