import { useCurrentMatch } from './use-current-match';

export function useCurrentMatchChecksum(): string {
  const match = useCurrentMatch();

  return match.checksum;
}
