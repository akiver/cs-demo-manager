import { useNavigate } from 'react-router';
import { buildPlayerPath } from 'csdm/ui/routes-paths';

export function useNavigateToPlayer() {
  const navigate = useNavigate();

  return async (steamId: string) => {
    await navigate(buildPlayerPath(steamId));
  };
}
