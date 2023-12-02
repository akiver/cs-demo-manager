import { useValveState } from './use-valve-state';

export function useSelectedMatchId() {
  const state = useValveState();
  const { selectedMatchId } = state;
  if (selectedMatchId === undefined) {
    throw new Error('Selected Valve match id not defined');
  }

  return selectedMatchId;
}
