import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';

export function drawMapRadar(
  mapImage: HTMLImageElement | null,
  context: CanvasRenderingContext2D,
  { zoomedX, zoomedY, getScaledRadarSize }: InteractiveCanvas,
) {
  if (mapImage !== null) {
    const radarSize = getScaledRadarSize();
    context.drawImage(mapImage, zoomedX(0), zoomedY(0), radarSize, radarSize);
  }
}
