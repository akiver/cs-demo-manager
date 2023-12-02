import { useValveState } from './use-valve-state';

export function useStatus() {
  const state = useValveState();

  return state.status;
}
