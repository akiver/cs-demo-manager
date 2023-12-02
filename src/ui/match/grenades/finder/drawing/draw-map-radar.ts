import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';

export function drawMapRadar(
  mapImage: HTMLImageElement | null,
  context: CanvasRenderingContext2D,
  { zoomedX, zoomedY, zoomedSize }: InteractiveCanvas,
) {
  if (mapImage !== null) {
    context.drawImage(mapImage, zoomedX(0), zoomedY(0), zoomedSize(MAP_RADAR_SIZE), zoomedSize(MAP_RADAR_SIZE));
  }
}
