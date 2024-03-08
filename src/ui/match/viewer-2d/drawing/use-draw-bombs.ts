import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { useBombExplosionImage } from './use-bomb-explosion-image';
import { useBombImage } from './use-bomb-image';

export function useDrawBombs() {
  const { currentFrame, bombPlanted, bombDefused, bombExploded } = useViewerContext();
  const bombImage = useBombImage();
  const explosionImage = useBombExplosionImage();

  const drawBombs = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    if (bombPlanted === null || bombPlanted.frame > currentFrame) {
      return;
    }

    const isDefusedBomb = bombDefused !== null && bombDefused.frame <= currentFrame;
    const isExplodedBomb = bombExploded !== null && bombExploded.frame <= currentFrame;
    const x = zoomedToRadarX(bombPlanted.x);
    const y = zoomedToRadarY(bombPlanted.y);
    const bombImageSize = zoomedSize(isExplodedBomb ? 60 : 22);
    context.save();
    context.globalAlpha = isDefusedBomb ? 0.5 : 1;
    const image = isExplodedBomb ? explosionImage : bombImage;
    context.drawImage(image, x - bombImageSize / 2, y - bombImageSize / 2, bombImageSize, bombImageSize);
    context.restore();
  };

  return { drawBombs };
}
