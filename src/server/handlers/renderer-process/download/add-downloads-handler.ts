import { downloadDemoQueue } from 'csdm/server/download-queue';
import type { Download } from 'csdm/common/download/download-types';
import { handleError } from '../../handle-error';

export async function addDownloadsHandler(downloads: Download[]) {
  try {
    await downloadDemoQueue.addDownloads(downloads);
  } catch (error) {
    handleError(error, 'Error while adding downloads');
  }
}
