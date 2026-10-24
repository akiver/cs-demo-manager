import type { HostageState } from 'csdm/common/types/counter-strike';
import type { TimelinePosition } from 'csdm/common/types/timeline-position';

type HostageTimelineState = {
  tick: number;
  state: HostageState;
};

// Positions and states of a hostage during a round sorted by tick, they are stored only when they change.
// The last position is when the hostage disappeared or when the round ended.
export type HostageTimeline = {
  positions: TimelinePosition[];
  states: HostageTimelineState[];
};
