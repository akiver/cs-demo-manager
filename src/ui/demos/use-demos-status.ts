import { useDemosState } from './use-demos-state';

export function useDemosStatus() {
  const demosState = useDemosState();

  return demosState.status;
}
