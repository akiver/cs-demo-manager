import type { Sequence } from 'csdm/common/types/sequence';
import { areSequencesOverlapping } from 'csdm/common/video/are-sequences-overlapping';
import { SequencesAreOverlapping } from 'csdm/node/video/errors/sequences-are-overlapping';

export function assertSequencesAreNotOverlapping(sequences: Sequence[], demoTickRate: number) {
  for (let sequenceIndex = 0; sequenceIndex < sequences.length; sequenceIndex++) {
    const currentSequence = sequences[sequenceIndex];
    const nextSequence = sequenceIndex === sequences.length - 1 ? undefined : sequences[sequenceIndex + 1];
    const previousSequence = sequences[sequenceIndex - 1];

    const isOverlapping = areSequencesOverlapping(currentSequence, previousSequence, nextSequence, demoTickRate);
    if (isOverlapping) {
      throw new SequencesAreOverlapping();
    }
  }
}
