import { HostageState } from 'csdm/common/types/counter-strike';
import { useViewerContext } from '../use-viewer-context';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { findTimelineIndexAtTick } from '../find-timeline-index-at-tick';
import { findLastIndexAtOrBeforeTick } from 'csdm/common/array/find-last-index-at-or-before-tick';

export function useDrawHostages() {
  const { hostageTimelines, currentTick } = useViewerContext();

  const drawHostages = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    for (const { positions, states } of hostageTimelines) {
      const index = findTimelineIndexAtTick(positions, currentTick);
      if (index === -1) {
        continue;
      }

      const position = positions[index];
      const state = states[findLastIndexAtOrBeforeTick(states, currentTick)]?.state;
      const x = zoomedToRadarX(position.x, position.z);
      const y = zoomedToRadarY(position.y, position.z);
      const radius = state === HostageState.BeingCarried ? zoomedSize(4) : zoomedSize(8);

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
