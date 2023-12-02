import { buildDownloadFromShareCode } from 'csdm/node/download/build-download-from-share-code';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { handleError } from '../../handle-error';

export async function addDownloadFromShareCodeHandler(shareCode: string) {
  try {
    const download = await buildDownloadFromShareCode(shareCode);
    await downloadDemoQueue.addDownload(download);
  } catch (error) {
    handleError(error, `Error while adding demo download from share code ${shareCode}`);
  }
}
