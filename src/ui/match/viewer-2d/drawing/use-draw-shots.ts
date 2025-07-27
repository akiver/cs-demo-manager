import { useRef } from 'react';
import { useViewerContext } from '../use-viewer-context';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { degreesToRadians } from './degrees-to-radians';
import type { Shot } from 'csdm/common/types/shot';
import { getTeamColor } from '../../../styles/get-team-color';

type AnimatedShot = Shot & {
  time: number;
};

export function useDrawShots() {
  const { shots, currentTick } = useViewerContext();
  const pendingAnimatedShotsRef = useRef<AnimatedShot[]>([]);

  const drawShots = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    const pendingAnimatedShots = pendingAnimatedShotsRef.current;

    for (const shot of pendingAnimatedShots) {
      const x = zoomedToRadarX(shot.x);
      const y = zoomedToRadarY(shot.y);
      const playerAngle = -degreesToRadians(shot.playerYaw);
      const playerRadius = zoomedSize(8);
      const startX = x + playerRadius * Math.cos(playerAngle);
      const startY = y + playerRadius * Math.sin(playerAngle);
      context.beginPath();
      context.lineWidth = zoomedSize(1);
      context.strokeStyle = getTeamColor(shot.playerSide);
      context.moveTo(startX, startY);
      const lineLength = zoomedSize(80);
      context.lineTo(
        startX + lineLength * shot.time * Math.cos(playerAngle),
        startY + lineLength * shot.time * Math.sin(playerAngle),
      );
      context.stroke();
      shot.time += 0.1;
    }

    const tickShots = shots.filter((shot) => {
      return shot.tick === currentTick;
    });
    for (const shot of tickShots) {
      pendingAnimatedShots.push({
        ...shot,
        time: 0.1,
      });
    }
    pendingAnimatedShotsRef.current = pendingAnimatedShots.filter((animation) => {
      return animation.time < 1;
    });
  };

  return { drawShots };
}
