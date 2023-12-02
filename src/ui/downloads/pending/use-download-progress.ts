import { usePendingDownloadsState } from './use-pending-downloads-state';

export function useDownloadProgress() {
  const downloadState = usePendingDownloadsState();

  return downloadState.progress;
}
