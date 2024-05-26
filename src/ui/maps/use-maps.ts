import { useMemo } from 'react';
import { useMapsState } from './use-maps-state';

export function useMaps() {
  const state = useMapsState();

  return useMemo(() => {
    return state.entities;
  }, [state]);
}
