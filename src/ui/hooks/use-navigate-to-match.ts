import { useNavigate } from 'react-router';
import type { NavigateOptions } from 'react-router';
import { buildMatchPath } from 'csdm/ui/routes-paths';

export function useNavigateToMatch() {
  const navigate = useNavigate();

  return async (checksum: string, options?: NavigateOptions) => {
    const matchPath = buildMatchPath(checksum);
    await navigate(matchPath, options);
  };
}
