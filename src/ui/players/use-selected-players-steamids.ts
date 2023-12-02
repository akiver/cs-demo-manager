import { usePlayersState } from './use-players-state';

export function useSelectedPlayerSteamIds(): string[] {
  const state = usePlayersState();

  return state.selectedPlayerSteamIds;
}
