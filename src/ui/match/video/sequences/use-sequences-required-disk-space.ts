import { useCurrentMatch } from '../../use-current-match';
import { useCurrentMatchSequences } from './use-current-match-sequences';
import { useGetSequencesRequiredDiskSpace } from './use-get-sequences-required-disk-space';

export function useSequencesRequiredDiskSpace() {
  const sequences = useCurrentMatchSequences();
  const match = useCurrentMatch();
  const getRequiredDiskSpace = useGetSequencesRequiredDiskSpace();

  return getRequiredDiskSpace(sequences, match.tickrate);
}
