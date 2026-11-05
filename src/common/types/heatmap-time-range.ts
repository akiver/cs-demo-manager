// Round time window used to filter heatmap points, in seconds relative to the end of the freeze time.
export type HeatmapTimeRange = {
  startSeconds: number;
  endSeconds: number | null; // null => until the end of the round
};
