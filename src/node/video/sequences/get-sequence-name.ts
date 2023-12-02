import type { Sequence } from 'csdm/common/types/sequence';

export function getSequenceName(sequence: Sequence) {
  return `${sequence.number}-sequence`;
}
