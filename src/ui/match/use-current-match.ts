import { useUnsafeCurrentMatch } from './use-unsafe-current-match';

export function useCurrentMatch() {
  const match = useUnsafeCurrentMatch();

  if (match === null) {
    throw new Error('Current match not defined');
  }

  return match;
}
