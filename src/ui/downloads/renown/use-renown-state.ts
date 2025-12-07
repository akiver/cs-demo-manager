import { useDownloadsState } from 'csdm/ui/downloads/use-downloads-state';

export function useRenownState() {
  const state = useDownloadsState();

  return state.renown;
}
