import { usePlayersState } from './use-players-state';

export function usePlayers() {
  const state = usePlayersState();

  return state.entities;
}
