import { describe, it, expect } from 'vite-plus/test';
import { clampHeatmapTimeRange } from './clamp-heatmap-time-range';

describe('clampHeatmapTimeRange', () => {
  it('should keep a range inside the rounds duration', () => {
    expect(clampHeatmapTimeRange({ startSeconds: 10, endSeconds: 40 }, 60)).toEqual({
      startSeconds: 10,
      endSeconds: 40,
    });
  });

  it('should keep an open end', () => {
    expect(clampHeatmapTimeRange({ startSeconds: 10, endSeconds: null }, 60)).toEqual({
      startSeconds: 10,
      endSeconds: null,
    });
  });

  it('should open the end when it reaches the rounds duration', () => {
    expect(clampHeatmapTimeRange({ startSeconds: 10, endSeconds: 60 }, 60)).toEqual({
      startSeconds: 10,
      endSeconds: null,
    });
    expect(clampHeatmapTimeRange({ startSeconds: 10, endSeconds: 90 }, 60)).toEqual({
      startSeconds: 10,
      endSeconds: null,
    });
  });

  it('should clamp the start to the end', () => {
    expect(clampHeatmapTimeRange({ startSeconds: 100, endSeconds: null }, 60)).toEqual({
      startSeconds: 60,
      endSeconds: null,
    });
    expect(clampHeatmapTimeRange({ startSeconds: 100, endSeconds: 120 }, 60)).toEqual({
      startSeconds: 60,
      endSeconds: null,
    });
  });
});
