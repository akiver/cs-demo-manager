import type { Sequence } from 'csdm/common/types/sequence';

/**
 * Make sure 2 sequences are not overlapping, this is required because:
 * - When skipping between sequences with the skip_ahead command, sounds like "CT win" are still audible when it fast forward to the next round.
 *   It could be avoided using commands to stop / start demo playback like demo_togglepause but it doesn't solve the second point.
 * - Executing commands through a VDM file implies that at "starttick" parameter commands will be executed EVERY TIME at this tick.
 *   So if 2 sequences are overlapping, there will be a fast forwarding whereas the first sequence is not yet done.
 * An other solution would be to generate a new VDM file for each sequences and restart the demo playback but creating 2 sequences really close to each other
 * will slow down the recording time because of game restarts and is an edge case.
 */
export function areSequencesOverlapping(
  currentSequence: Sequence,
  previousSequence: Sequence | undefined,
  nextSequence: Sequence | undefined,
  demoTickrate: number,
): boolean {
  const minimumSecondsBetweenTwoSequences = 2;
  const ticksRequiredBetweenTwoSequences = demoTickrate * minimumSecondsBetweenTwoSequences;

  let isOverlappingPreviousSequence = false;
  if (previousSequence !== undefined) {
    isOverlappingPreviousSequence =
      previousSequence.endTick + ticksRequiredBetweenTwoSequences > currentSequence.startTick;
  }

  let isOverlappingNextSequence = false;
  if (nextSequence !== undefined) {
    isOverlappingNextSequence = nextSequence.startTick - currentSequence.endTick < ticksRequiredBetweenTwoSequences;
  }

  return isOverlappingPreviousSequence || isOverlappingNextSequence;
}
