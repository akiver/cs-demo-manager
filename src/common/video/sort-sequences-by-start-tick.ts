import type { Sequence } from 'csdm/common/types/sequence';

export function sortSequencesByStartTick(sequences: Sequence[]) {
  const sortedSequencesByStartTick: Sequence[] = [...sequences].sort((currentSequence, nextSequence) => {
    if (currentSequence.startTick < nextSequence.startTick) {
      return -1;
    }

    if (currentSequence.startTick > nextSequence.startTick) {
      return 1;
    }

    return 0;
  });

  return sortedSequencesByStartTick;
}
