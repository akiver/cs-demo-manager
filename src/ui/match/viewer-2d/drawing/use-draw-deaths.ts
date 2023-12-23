import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { AudioFileName, usePlaySound } from './use-play-sound';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { useDrawPlayerDeath } from 'csdm/ui/hooks/drawing/use-draw-player-death';

export function useDrawDeaths() {
  const { currentFrame, kills } = useViewerContext();
  const { playSound } = usePlaySound();
  const drawPlayerDeath = useDrawPlayerDeath();

  const drawDeaths = (context: CanvasRenderingContext2D, interactiveCanvas: InteractiveCanvas) => {
    const killsToDraw = kills.filter((kill) => {
      return kill.frame <= currentFrame;
    });

    for (const kill of killsToDraw) {
      drawPlayerDeath(context, interactiveCanvas, kill.victimX, kill.victimY, kill.victimSide);

      if (kill.frame === currentFrame) {
        playSound(kill.victimSide === TeamNumber.CT ? AudioFileName.DeathCt : AudioFileName.DeathT);
      }
    }
  };

  return { drawDeaths };
}
