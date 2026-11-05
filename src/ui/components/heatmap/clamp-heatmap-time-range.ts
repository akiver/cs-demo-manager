import type { HeatmapTimeRange } from 'csdm/common/types/heatmap-time-range';

// Keeps a time range inside the duration of the rounds it applies to.
// An end reaching the longest round is stored as null (until the end of the round) so that it follows the rounds
// selection.
export function clampHeatmapTimeRange(timeRange: HeatmapTimeRange, maxSeconds: number): HeatmapTimeRange {
  const endSeconds = timeRange.endSeconds !== null && timeRange.endSeconds < maxSeconds ? timeRange.endSeconds : null;
  const startSeconds = Math.max(0, Math.min(timeRange.startSeconds, endSeconds ?? maxSeconds));

  return { startSeconds, endSeconds };
}
