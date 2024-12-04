import { useBlocker } from 'react-router';

export function useBlockNavigation(isNavigationBlocked: boolean) {
  const blocker = useBlocker(isNavigationBlocked);

  return blocker;
}
