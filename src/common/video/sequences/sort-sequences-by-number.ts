import type { Sequence } from 'csdm/common/types/sequence';

export function sortSequencesByNumber(sequences: Sequence[]) {
  return sequences.toSorted((sequenceA, sequenceB) => sequenceA.number - sequenceB.number);
}
