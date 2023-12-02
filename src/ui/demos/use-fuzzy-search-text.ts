import { useDemosState } from './use-demos-state';

export function useFuzzySearchText(): string {
  const state = useDemosState();

  return state.fuzzySearchText;
}
