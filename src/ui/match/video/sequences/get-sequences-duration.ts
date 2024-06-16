import { roundNumber } from 'csdm/common/math/round-number';
import type { Sequence } from 'csdm/common/types/sequence';

export function getSequencesDuration(sequences: Sequence[], tickrate: number) {
  let duration = 0;
  for (const sequence of sequences) {
    duration += (sequence.endTick - sequence.startTick) / tickrate;
  }

  return roundNumber(duration);
}
