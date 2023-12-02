import { usePlayerState } from '../use-player-state';

export function useSelectedMatchChecksums() {
  const { selectedMatchChecksums } = usePlayerState();

  return selectedMatchChecksums;
}
