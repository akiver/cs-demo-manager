import { useValveState } from './use-valve-state';

export function useMatches() {
  const state = useValveState();

  return state.matches;
}
