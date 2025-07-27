import { HostageState } from 'csdm/common/types/counter-strike';
import { useViewerContext } from '../use-viewer-context';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';

export function useDrawHostages() {
  const { hostagePositions, currentTick } = useViewerContext();

  const drawHostages = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    const positions = hostagePositions.filter((position) => position.tick === currentTick);

    for (const position of positions) {
      const x = zoomedToRadarX(position.x);
      const y = zoomedToRadarY(position.y);
      const radius = position.state === HostageState.BeingCarried ? zoomedSize(4) : zoomedSize(8);

      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.strokeStyle = 'white';
      context.fillStyle = 'brown';
      context.lineWidth = zoomedSize(1);
      context.fill();
      context.stroke();
    }
  };

  return { drawHostages };
}
