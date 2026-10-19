import { describe, it, expect } from 'vite-plus/test';
import type { TimelinePosition } from 'csdm/common/types/timeline-position';
import { findTimelinePositionIndexAtTick } from './find-timeline-position-index-at-tick';

function buildPositions(ticks: number[]): TimelinePosition[] {
  return ticks.map((tick) => ({ tick, x: tick, y: 0, z: 0 }));
}

describe('findTimelinePositionIndexAtTick', () => {
  const positions = buildPositions([100, 101, 160]);

  it('should return the index of the position stored at the tick', () => {
    expect(findTimelinePositionIndexAtTick(positions, 100)).toBe(0);
    expect(findTimelinePositionIndexAtTick(positions, 101)).toBe(1);
    expect(findTimelinePositionIndexAtTick(positions, 160)).toBe(2);
  });

  it('should return the index of the last position before the tick when the entity did not move', () => {
    expect(findTimelinePositionIndexAtTick(positions, 130)).toBe(1);
  });

  it('should return -1 when the entity does not exist at the tick', () => {
    expect(findTimelinePositionIndexAtTick(positions, 99)).toBe(-1);
    expect(findTimelinePositionIndexAtTick(positions, 161)).toBe(-1);
    expect(findTimelinePositionIndexAtTick(buildPositions([]), 100)).toBe(-1);
  });
});
