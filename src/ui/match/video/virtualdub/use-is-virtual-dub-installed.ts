import { useVirtualDubState } from 'csdm/ui/match/video/virtualdub/use-virtual-dub-state';

export function useIsVirtualDubInstalled() {
  const virtualDubState = useVirtualDubState();

  return virtualDubState.version !== undefined;
}
