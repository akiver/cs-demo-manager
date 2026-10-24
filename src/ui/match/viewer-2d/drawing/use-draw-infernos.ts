import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { findTimelineIndexAtTick } from '../find-timeline-index-at-tick';

export function useDrawInfernos() {
  const { infernoTimelines, currentTick } = useViewerContext();

  const drawInfernos = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    context.lineWidth = zoomedSize(1);
    context.fillStyle = 'rgba(218, 123, 17, 0.5)';
    context.strokeStyle = '#da7b11';

    for (const { convexHulls, z } of infernoTimelines) {
      const index = findTimelineIndexAtTick(convexHulls, currentTick);
      if (index === -1) {
        continue;
      }

      const { points } = convexHulls[index];
      // Ensure we have valid tuples [x,y, x,y, x,y ...]
      if (points.length < 2 || points.length % 2 !== 0) {
        continue;
      }

      context.beginPath();
      context.moveTo(zoomedToRadarX(points[0], z), zoomedToRadarY(points[1], z));
      for (let pointIndex = 2; pointIndex < points.length - 1; pointIndex += 2) {
        context.lineTo(zoomedToRadarX(points[pointIndex], z), zoomedToRadarY(points[pointIndex + 1], z));
      }
      context.closePath();
      context.fill();
      context.stroke();
    }
  };

  return { drawInfernos };
}
