import { findLastIndexAtOrBeforeTick } from 'csdm/common/array/find-last-index-at-or-before-tick';

// Returns the index of the timeline item (grenade position, inferno convex hull...) at the given tick, -1 if the entity
// doesn't exist at this tick.
// Items are stored only when they change, the item at a tick is the last one at or before it. The last item is when the
// entity disappeared.
export function findTimelineIndexAtTick(items: { tick: number }[], tick: number) {
  const lastItem = items.at(-1);
  if (lastItem === undefined || tick > lastItem.tick) {
    return -1;
  }

  return findLastIndexAtOrBeforeTick(items, tick);
}
