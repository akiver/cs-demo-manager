import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';

export function useDrawInfernos() {
  const { infernoPositions, currentTick } = useViewerContext();

  const drawInfernos = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    const positions = infernoPositions.filter((position) => {
      return position.tick === currentTick;
    });

    context.lineWidth = zoomedSize(1);
    context.fillStyle = 'rgba(218, 123, 17, 0.5)';
    context.strokeStyle = '#da7b11';

    for (const position of positions) {
      const { convexHell2D } = position;
      // Ensure we have valid tuples [x,y, x,y, x,y ...]
      if (convexHell2D.length < 2 || convexHell2D.length % 2 !== 0) {
        continue;
      }

      context.beginPath();
      context.moveTo(zoomedToRadarX(convexHell2D[0]), zoomedToRadarY(convexHell2D[1]));
      for (let index = 2; index < convexHell2D.length - 1; index += 2) {
        context.lineTo(zoomedToRadarX(convexHell2D[index]), zoomedToRadarY(convexHell2D[index + 1]));
      }
      context.closePath();
      context.fill();
      context.stroke();
    }
  };

  return { drawInfernos };
}
