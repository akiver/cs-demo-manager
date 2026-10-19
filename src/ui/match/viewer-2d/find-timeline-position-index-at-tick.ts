import type { TimelinePosition } from 'csdm/common/types/timeline-position';
import { findLastIndexAtOrBeforeTick } from 'csdm/common/array/find-last-index-at-or-before-tick';

// Returns the index of the entity (grenade, chicken...) position at the given tick, -1 if the entity doesn't exist at
// this tick.
// Positions are stored only when they change, the position at a tick is the last one at or before it.
export function findTimelinePositionIndexAtTick(positions: TimelinePosition[], tick: number) {
  const lastPosition = positions.at(-1);
  if (lastPosition === undefined || tick > lastPosition.tick) {
    return -1;
  }

  return findLastIndexAtOrBeforeTick(positions, tick);
}
