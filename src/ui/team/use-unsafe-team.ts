import { useTeamState } from './use-team-state';

export function useUnsafeTeam() {
  const { team } = useTeamState();

  return team;
}
