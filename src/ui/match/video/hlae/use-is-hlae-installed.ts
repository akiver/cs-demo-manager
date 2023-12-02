import { useHlaeState } from 'csdm/ui/match/video/hlae/use-hlae-state';

export function useIsHlaeInstalled(): boolean {
  const hlaeState = useHlaeState();

  return hlaeState.version !== undefined;
}
