import { useValveState } from './use-valve-state';

export function useErrorCode() {
  const state = useValveState();

  return state.errorCode;
}
