import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { useDrawPlayerDeath } from 'csdm/ui/hooks/drawing/use-draw-player-death';

export function useDrawDeaths() {
  const { currentTick, kills } = useViewerContext();
  const drawPlayerDeath = useDrawPlayerDeath();

  const drawDeaths = (context: CanvasRenderingContext2D, interactiveCanvas: InteractiveCanvas) => {
    const killsToDraw = kills.filter((kill) => {
      return kill.tick <= currentTick;
    });

    for (const kill of killsToDraw) {
      drawPlayerDeath(context, interactiveCanvas, kill.victimX, kill.victimY, kill.victimSide);
    }
  };

  return { drawDeaths };
}
