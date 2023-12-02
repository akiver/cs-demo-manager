import { usePlayerState } from './use-player-state';

export function usePlayer() {
  const { player } = usePlayerState();

  if (player === undefined) {
    throw new Error('player not defined');
  }

  return player;
}
