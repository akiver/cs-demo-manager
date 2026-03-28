import { useNavigate } from 'react-router';
import { buildTeamPath } from 'csdm/ui/routes-paths';

export function useNavigateToTeam() {
  const navigate = useNavigate();

  return async (name: string) => {
    await navigate(buildTeamPath(name));
  };
}
