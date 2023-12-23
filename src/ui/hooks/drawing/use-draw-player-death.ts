import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import type { TeamNumber } from 'csdm/common/types/counter-strike';

export function useDrawPlayerDeath() {
  return (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
    x: number,
    y: number,
    side: TeamNumber,
    color?: string,
  ) => {
    const scaledX = zoomedToRadarX(x);
    const scaledY = zoomedToRadarY(y);

    const crossSize = zoomedSize(10);
    const crossCenter = crossSize / 2;
    context.strokeStyle = color ?? `${getTeamColor(side)}7f`;
    context.lineWidth = zoomedSize(4);
    context.beginPath();

    const startX = scaledX - crossCenter;
    const endX = scaledX + crossCenter;
    const startY = scaledY - crossCenter;
    const endY = scaledY + crossCenter;

    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    const path1 = new Path2D();
    path1.moveTo(startX, startY);
    path1.lineTo(endX, endY);

    context.beginPath();
    context.moveTo(endX, startY);
    context.lineTo(startX, endY);
    context.stroke();
    const path2 = new Path2D();
    path2.moveTo(endX, startY);
    path2.lineTo(startX, endY);

    return [path1, path2];
  };
}
