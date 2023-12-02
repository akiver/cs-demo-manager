import { useGrenadesState } from '../use-grenades-state';
import type { GrenadesFinderState } from './grenades-finder-reducer';

export function useGrenadesFinderState(): GrenadesFinderState {
  const state = useGrenadesState();

  return state.finder;
}
