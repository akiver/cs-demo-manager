import { useMapsState } from './use-maps-state';

export function useMaps() {
  const state = useMapsState();

  return state.entities;
}
