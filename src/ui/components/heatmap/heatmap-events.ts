export class ResetHeatmapZoom extends Event {
  static readonly name = 'heatmap-reset-zoom';
  constructor() {
    super(ResetHeatmapZoom.name);
  }
}
