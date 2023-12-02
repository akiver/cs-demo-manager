import { useDownloadsState } from 'csdm/ui/downloads/use-downloads-state';
import type { PendingDownloadsState } from './pending-downloads-reducer';

export function usePendingDownloadsState(): PendingDownloadsState {
  const downloadsState = useDownloadsState();
  return downloadsState.pending;
}
