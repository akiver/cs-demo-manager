import { useValveState } from './use-valve-state';

export function useCurrentSteamId() {
  const state = useValveState();

  if (state.currentSteamId === undefined) {
    throw new Error('Current player SteamID not found for Valve downloads');
  }

  return state.currentSteamId;
}
