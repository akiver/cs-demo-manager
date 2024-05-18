import { useTeamsState } from './use-teams-state';

export function useTeams() {
  const state = useTeamsState();

  return state.entities;
}
