import { usePlayerState } from './use-player-state';

export function useUnsafePlayer() {
  const { player } = usePlayerState();

  return player;
}
