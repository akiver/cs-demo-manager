import type { Sequence } from 'csdm/common/types/sequence';

export function getNextSequenceNumber(sequences: Sequence[]) {
  const numbers = sequences.map((sequence) => sequence.number);
  if (numbers.length === 0) {
    return 1;
  }

  const highestNumber = Math.max(...numbers);

  return highestNumber + 1;
}
