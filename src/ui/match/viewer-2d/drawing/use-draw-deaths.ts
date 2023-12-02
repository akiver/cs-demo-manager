import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { getTeamColor } from '../../../styles/get-team-color';
import { AudioFileName, usePlaySound } from './use-play-sound';
import { TeamNumber } from 'csdm/common/types/counter-strike';

export function useDrawDeaths() {
  const { currentFrame, kills } = useViewerContext();
  const { playSound } = usePlaySound();

  const drawDeaths = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    const killsToDraw = kills.filter((kill) => {
      return kill.frame <= currentFrame;
    });

    for (const kill of killsToDraw) {
      const x = zoomedToRadarX(kill.victimX);
      const y = zoomedToRadarY(kill.victimY);

      const crossSize = zoomedSize(10);
      const crossCenter = crossSize / 2;
      context.strokeStyle = `${getTeamColor(kill.victimSide)}7f`;
      context.lineWidth = zoomedSize(4);
      context.beginPath();
      context.moveTo(x - crossCenter, y - crossCenter);
      context.lineTo(x + crossCenter, y + crossCenter);
      context.stroke();
      context.beginPath();
      context.moveTo(x + crossCenter, y - crossCenter);
      context.lineTo(x - crossCenter, y + crossCenter);
      context.stroke();

      if (kill.frame === currentFrame) {
        playSound(kill.victimSide === TeamNumber.CT ? AudioFileName.DeathCt : AudioFileName.DeathT);
      }
    }
  };

  return { drawDeaths };
}
