import { useRef } from 'react';
import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { useBombExplosionImage } from './use-bomb-explosion-image';
import { useBombImage } from './use-bomb-image';
import type { PlayerPosition } from 'csdm/common/types/player-position';

export function useDrawBombs() {
  const { currentFrame, bombPlanted, bombDefused, bombExploded, playerPositions } = useViewerContext();
  const bombImage = useBombImage();
  const explosionImage = useBombExplosionImage();
  const lastBombPosition = useRef<PlayerPosition | null>(null);

  const drawBombs = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    if (bombPlanted === null || bombPlanted.frame > currentFrame) {
      const playerPositionsWithBomb = playerPositions.filter((position) => {
        return position.frame === currentFrame && position.hasBomb;
      });
      // A player has a bomb, the bomb indicator will be drawn by the drawPlayers function
      if (playerPositionsWithBomb.length > 0) {
        lastBombPosition.current = null;
        return;
      }

      const drawBomb = (x: number, y: number) => {
        const zoomedX = zoomedToRadarX(x);
        const zoomedY = zoomedToRadarY(y);
        const bombImageSize = zoomedSize(14);
        context.drawImage(
          bombImage,
          zoomedX - bombImageSize / 2,
          zoomedY - bombImageSize / 2,
          bombImageSize,
          bombImageSize,
        );
      };

      if (lastBombPosition.current && lastBombPosition.current.frame <= currentFrame) {
        drawBomb(lastBombPosition.current.x, lastBombPosition.current.y);
        return;
      }

      for (let i = currentFrame - 1; i >= 0; i--) {
        const lastPlayerPositionWithBomb = playerPositions.find((position) => {
          return position.frame === i && position.hasBomb;
        });
        if (lastPlayerPositionWithBomb) {
          drawBomb(lastPlayerPositionWithBomb.x, lastPlayerPositionWithBomb.y);
          lastBombPosition.current = lastPlayerPositionWithBomb;
          return;
        }
      }

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
