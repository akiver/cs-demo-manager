import { useTeamState } from './use-team-state';

export function useTeam() {
  const { team } = useTeamState();

  if (!team) {
    throw new Error('team not defined');
  }

  return team;
}
