import { roundNumber } from 'csdm/common/math/round-number';
import { useComputeRequiredGigabyte } from './use-compute-require-gigabyte';
import { useCurrentMatchSequences } from './use-current-match-sequences';

export function useSequencesRequiredDiskSpace() {
  const sequences = useCurrentMatchSequences();
  const computeRequiredGigabyte = useComputeRequiredGigabyte();

  let diskSpace = 0;
  for (const sequence of sequences) {
    diskSpace += computeRequiredGigabyte(sequence.startTick, sequence.endTick);
  }

  return roundNumber(diskSpace, 2);
}
