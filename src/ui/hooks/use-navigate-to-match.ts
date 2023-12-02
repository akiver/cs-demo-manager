import { useNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { buildMatchPath } from 'csdm/ui/routes-paths';

export function useNavigateToMatch() {
  const navigate = useNavigate();

  return (checksum: string, options?: NavigateOptions) => {
    const matchPath = buildMatchPath(checksum);
    navigate(matchPath, options);
  };
}
