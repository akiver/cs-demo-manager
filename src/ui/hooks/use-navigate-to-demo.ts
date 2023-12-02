import type { NavigateOptions } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { buildDemoPath } from 'csdm/ui/routes-paths';

export function useNavigateToDemo() {
  const navigate = useNavigate();

  return (demoFilePath: string, options?: NavigateOptions) => {
    const demoPath = buildDemoPath(demoFilePath);
    navigate(demoPath, options);
  };
}
