import { useHlaeState } from 'csdm/ui/match/video/hlae/use-hlae-state';

export function useIsHlaeUpdateAvailable(): boolean {
  const hlaeState = useHlaeState();

  return hlaeState.isUpdateAvailable;
}
