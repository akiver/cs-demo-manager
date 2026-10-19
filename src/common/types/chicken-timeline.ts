import type { TimelinePosition } from 'csdm/common/types/timeline-position';

// Positions of a chicken during a round sorted by tick.
// A position is stored only when it changes, the last one is when the chicken disappeared or when the round ended.
export type ChickenTimeline = {
  positions: TimelinePosition[];
};
