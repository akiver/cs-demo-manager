import { useViewerContext } from '../use-viewer-context';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useChickenImage } from './use-chicken-image';

export function useDrawChickens() {
  const { chickenPositions, currentTick } = useViewerContext();
  const chickenImage = useChickenImage();

  const drawChickens = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    const positions = chickenPositions.filter((position) => position.tick === currentTick);
    const imageSize = zoomedSize(20);

    for (const position of positions) {
      const x = zoomedToRadarX(position.x) - imageSize / 2;
      const y = zoomedToRadarY(position.y) - imageSize / 2;
      context.drawImage(chickenImage, x, y, imageSize, imageSize);
    }
  };

  return { drawChickens };
}
