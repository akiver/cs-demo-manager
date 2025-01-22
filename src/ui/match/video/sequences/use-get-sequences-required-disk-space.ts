import { useComputeRequiredBytes } from './use-compute-require-bytes';
import type { Sequence } from 'csdm/common/types/sequence';

export function useGetSequencesRequiredDiskSpace() {
  const computeRequiredBytes = useComputeRequiredBytes();

  return (sequences: Sequence[], tickrate: number) => {
    let bytes = 0;
    for (const sequence of sequences) {
      bytes += computeRequiredBytes(sequence.startTick, sequence.endTick, tickrate);
    }

    return bytes;
  };
}
