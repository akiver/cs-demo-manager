import { useTeamsState } from './use-teams-state';

export function useTeamsStatus() {
  const state = useTeamsState();

  return state.status;
}
