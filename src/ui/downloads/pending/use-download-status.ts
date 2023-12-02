import { usePendingDownloadsState } from './use-pending-downloads-state';

export function useDownloadStatus() {
  const downloadStatus = usePendingDownloadsState();

  return downloadStatus.status;
}
