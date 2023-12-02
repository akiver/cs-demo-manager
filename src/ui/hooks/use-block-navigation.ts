import { useBlocker } from 'react-router-dom';

export function useBlockNavigation(isNavigationBlocked: boolean) {
  const blocker = useBlocker(isNavigationBlocked);

  return blocker;
}
