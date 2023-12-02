import { GrenadeName } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import type { GrenadePosition } from 'csdm/common/types/grenade-position';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { getGrenadeColor } from './get-grenade-color';
import type { SmokeStart } from 'csdm/common/types/smoke-start';
import type { HeGrenadeExplode } from 'csdm/common/types/he-grenade-explode';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { useViewerContext } from '../use-viewer-context';

export function useDrawGrenades() {
  const match = useCurrentMatch();
  const { currentFrame, grenadePositions, smokesStart, decoysStart, heGrenadesExplode, flashbangsExplode } =
    useViewerContext();

  const drawGrenades = (
    context: CanvasRenderingContext2D,
    { zoomedSize, zoomedToRadarX, zoomedToRadarY }: InteractiveCanvas,
  ) => {
    const grenadeCircleSize = zoomedSize(4);

    const drawSmokeEffect = (smokeStarted: SmokeStart, smokeExpiredPosition: GrenadePosition | undefined) => {
      const x = zoomedToRadarX(smokeStarted.x);
      const y = zoomedToRadarY(smokeStarted.y);
      context.beginPath();
      context.fillStyle = `${getGrenadeColor(GrenadeName.Smoke)}7f`;
      context.lineWidth = zoomedSize(2);
      context.strokeStyle = `${getTeamColor(smokeStarted.throwerSide)}7f`;
      context.arc(x, y, zoomedSize(26), 0, 2 * Math.PI);
      context.stroke();
      context.fill();

      context.beginPath();
      context.strokeStyle = '#ffffffbb';
      context.lineWidth = 2;
      const elapsedFrameCount = currentFrame - smokeStarted.frame;
      const secondsElapsed = elapsedFrameCount / match.frameRate;
      let smokeDuration = 18;
      if (smokeExpiredPosition !== undefined) {
        smokeDuration = (smokeExpiredPosition.frame - smokeStarted.frame) / match.frameRate;
      }
      const percentage = -(secondsElapsed / smokeDuration);
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * percentage;
      context.arc(x, y, zoomedSize(8), startAngle, endAngle);
      context.stroke();
    };

    const drawDecoyEffect = (position: GrenadePosition) => {
      const x = zoomedToRadarX(position.x);
      const y = zoomedToRadarY(position.y);

      context.beginPath();
      context.fillStyle = getGrenadeColor(position.grenadeName);
      context.lineWidth = zoomedSize(1);
      context.arc(x, y, grenadeCircleSize, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    };

    const drawHeGrenadeExplode = (heGrenadeExplode: HeGrenadeExplode) => {
      const effectDurationSeconds = 1;
      const elapsedSinceExplosionFrameCount = currentFrame - heGrenadeExplode.frame;
      const secondsElapsed = elapsedSinceExplosionFrameCount / match.frameRate;
      if (secondsElapsed > effectDurationSeconds) {
        return;
      }

      const x = zoomedToRadarX(heGrenadeExplode.x);
      const y = zoomedToRadarY(heGrenadeExplode.y);
      context.beginPath();
      context.fillStyle = getGrenadeColor(GrenadeName.HE);
      const scale = 1 - secondsElapsed / effectDurationSeconds;
      const size = zoomedSize(20 * scale);
      context.arc(x, y, size, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    };

    const positions = grenadePositions.filter((position) => {
      return position.frame === currentFrame;
    });

    for (const position of positions) {
      const { projectileId, frame, grenadeName } = position;

      switch (grenadeName) {
        case GrenadeName.Smoke: {
          const smokeStart = smokesStart.find((smokeStart) => {
            return smokeStart.projectileId === projectileId && smokeStart.frame <= currentFrame;
          });
          if (smokeStart !== undefined) {
            const smokeExpirePosition = grenadePositions
              .filter((position) => {
                return position.projectileId === projectileId && frame >= currentFrame;
              })
              .at(-1);
            drawSmokeEffect(smokeStart, smokeExpirePosition);
            continue;
          }
          break;
        }
        case GrenadeName.HE: {
          const heGrenadeExplode = heGrenadesExplode.find((heGrenadeExplode) => {
            return heGrenadeExplode.projectileId === projectileId && heGrenadeExplode.frame <= currentFrame;
          });
          if (heGrenadeExplode !== undefined) {
            drawHeGrenadeExplode(heGrenadeExplode);
            continue;
          }
          break;
        }
        case GrenadeName.Decoy: {
          const decoyStart = decoysStart.find((decoyStart) => {
            return decoyStart.projectileId === projectileId && decoyStart.frame <= currentFrame;
          });
          if (decoyStart !== undefined) {
            drawDecoyEffect(position);
            continue;
          }
          break;
        }
      }

      const previousPositions = grenadePositions.filter((position) => {
        return position.projectileId === projectileId && position.frame < currentFrame;
      });

      context.strokeStyle = getGrenadeColor(grenadeName);
      context.fillStyle = getGrenadeColor(grenadeName);
      context.lineWidth = zoomedSize(1);

      // Draw grenades paths
      for (let i = 0; i < previousPositions.length - 1; i++) {
        context.beginPath();
        const currentPosition = previousPositions[i];
        context.moveTo(zoomedToRadarX(currentPosition.x), zoomedToRadarY(currentPosition.y));

        const nextPosition = previousPositions[i + 1];
        context.lineTo(zoomedToRadarX(nextPosition.x), zoomedToRadarY(nextPosition.y));
        context.closePath();
        context.stroke();
      }

      // Draw grenade circle
      context.beginPath();
      const x = zoomedToRadarX(position.x);
      const y = zoomedToRadarY(position.y);
      context.arc(x, y, grenadeCircleSize, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    }

    const previousflashbangsExplode = flashbangsExplode.filter((flashbangExplode) => {
      return flashbangExplode.frame <= currentFrame;
    });
    for (const flashbangExplode of previousflashbangsExplode) {
      const secondsElapsedSinceExplosion = (currentFrame - flashbangExplode.frame) / match.frameRate;
      if (secondsElapsedSinceExplosion > 1) {
        continue;
      }

      const x = zoomedToRadarX(flashbangExplode.x);
      const y = zoomedToRadarY(flashbangExplode.y);
      context.beginPath();
      context.fillStyle = getGrenadeColor(GrenadeName.Flashbang);
      const scale = 1 - secondsElapsedSinceExplosion;
      const size = zoomedSize(20 * scale);
      context.arc(x, y, size, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    }
  };

  return { drawGrenades };
}
