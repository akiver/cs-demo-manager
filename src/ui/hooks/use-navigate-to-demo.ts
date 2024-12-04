import type { NavigateOptions } from 'react-router';
import { useNavigate } from 'react-router';
import { buildDemoPath } from 'csdm/ui/routes-paths';

export function useNavigateToDemo() {
  const navigate = useNavigate();

  return (demoFilePath: string, options?: NavigateOptions) => {
    const demoPath = buildDemoPath(demoFilePath);
    navigate(demoPath, options);
  };
}
