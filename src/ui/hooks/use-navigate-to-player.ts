import { useNavigate } from 'react-router-dom';
import { buildPlayerPath } from 'csdm/ui/routes-paths';

export function useNavigateToPlayer() {
  const navigate = useNavigate();

  return (steamId: string) => {
    navigate(buildPlayerPath(steamId));
  };
}
