import type { Sequence } from 'csdm/common/types/sequence';

export function sortSequencesByStartTick(sequences: Sequence[]) {
  return sequences.toSorted((currentSequence, nextSequence) => {
    if (currentSequence.startTick < nextSequence.startTick) {
      return -1;
    }

    if (currentSequence.startTick > nextSequence.startTick) {
      return 1;
    }

    return currentSequence.number - nextSequence.number;
  });
}
