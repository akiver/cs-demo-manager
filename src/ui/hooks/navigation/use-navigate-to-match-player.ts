import { useNavigate } from 'react-router-dom';
import { buildMatchPlayerPath } from 'csdm/ui/routes-paths';

export function useNavigateToMatchPlayer() {
  const navigate = useNavigate();

  return (checksum: string, steamId: string) => {
    return navigate(buildMatchPlayerPath(checksum, steamId));
  };
}
