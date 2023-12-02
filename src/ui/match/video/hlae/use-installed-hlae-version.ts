import { useHlaeState } from 'csdm/ui/match/video/hlae/use-hlae-state';

export function useInstalledHlaeVersion(): string | undefined {
  const hlaeState = useHlaeState();

  return hlaeState.version;
}
