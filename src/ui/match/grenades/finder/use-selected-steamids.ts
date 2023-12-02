import { useGrenadesFinderState } from './use-grenades-finder-state';

export function useSelectedSteamIds() {
  const state = useGrenadesFinderState();

  return state.steamIds;
}
