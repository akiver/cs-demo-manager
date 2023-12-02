import { useValveState } from './use-valve-state';

export function useSelectedSteamId() {
  const state = useValveState();
  const selectedSteamId = state.selectedSteamId;
  if (!selectedSteamId) {
    throw new Error('Selected SteamID not defined');
  }

  return selectedSteamId;
}
