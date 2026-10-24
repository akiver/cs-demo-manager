import { describe, it, expect } from 'vite-plus/test';
import type { TimelinePosition } from 'csdm/common/types/timeline-position';
import { findTimelineIndexAtTick } from './find-timeline-index-at-tick';

function buildPositions(ticks: number[]): TimelinePosition[] {
  return ticks.map((tick) => ({ tick, x: tick, y: 0, z: 0 }));
}

describe('findTimelineIndexAtTick', () => {
  const positions = buildPositions([100, 101, 160]);

  it('should return the index of the position stored at the tick', () => {
    expect(findTimelineIndexAtTick(positions, 100)).toBe(0);
    expect(findTimelineIndexAtTick(positions, 101)).toBe(1);
    expect(findTimelineIndexAtTick(positions, 160)).toBe(2);
  });

  it('should return the index of the last position before the tick when the entity did not move', () => {
    expect(findTimelineIndexAtTick(positions, 130)).toBe(1);
  });

  it('should return -1 when the entity does not exist at the tick', () => {
    expect(findTimelineIndexAtTick(positions, 99)).toBe(-1);
    expect(findTimelineIndexAtTick(positions, 161)).toBe(-1);
    expect(findTimelineIndexAtTick(buildPositions([]), 100)).toBe(-1);
  });
});
