import { roundNumber } from 'csdm/common/math/round-number';
import { useComputeRequiredGigabyte } from './use-compute-require-gigabyte';
import type { Sequence } from 'csdm/common/types/sequence';

export function useGetSequencesRequiredDiskSpace() {
  const computeRequiredGigabyte = useComputeRequiredGigabyte();

  return (sequences: Sequence[], tickrate: number) => {
    let diskSpace = 0;
    for (const sequence of sequences) {
      diskSpace += computeRequiredGigabyte(sequence.startTick, sequence.endTick, tickrate);
    }

    return roundNumber(diskSpace, 2);
  };
}
