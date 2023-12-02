import { useDownloadsState } from '../use-downloads-state';

export function useValveState() {
  const state = useDownloadsState();

  return state.valve;
}
