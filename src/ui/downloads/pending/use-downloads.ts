import { usePendingDownloadsState } from './use-pending-downloads-state';

export function useDownloads() {
  const downloadsState = usePendingDownloadsState();

  return downloadsState.downloads;
}
