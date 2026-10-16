import type { InteractiveCanvas } from '../../../hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { getBombImage } from './get-bomb-image';
import { findLastPositionAtOrBeforeTick } from '../players-timelines';

function getBombExplosionImage() {
  const image = new Image();
  // Base64 of the icon "explosion-icon.svg"
  image.src =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHZpZXdCb3g9IjAgMCAzMC4wOTMgMjguOTQzIj4KICA8cGF0aAogICAgZmlsbC1ydWxlPSJldmVub2RkIgogICAgZmlsbD0iI2Q3MzczZiIKICAgIGQ9Im0xMS45NzYgOS45MTcgMS4xMTcgMy44MDktMy40MzMuMzAyIDIuODM4IDIuMzE0LTEuNDE5IDIuNjg4IDIuNjg4LTEuMzQ0LjMgMi45ODggMS45MzktMi41NDEgMi4zODkgMS45NDItLjY3LTIuNjExIDMuMDYxLS45NzEtMi42MTItMS40MTkgMi4wOS0zLjA2NC0zLjIxLjg5Ni0uMjk4LTMuNTgzLTEuODY4IDMuMjg2LTIuOTEyLTIuNjkyem02LjI4MS04LjU1NC42NzQgOC4wOTEgNy4yNDktMi4wMjEtNC43MjIgNi45MSA1LjkwMiAzLjIwNy02LjkxIDIuMTg4IDEuNTE0IDUuOS01LjM5NC00LjM4MS00LjM4MiA1LjcyOS0uNjc0LTYuNzQzLTYuMDY5IDMuMDM1IDMuMjAyLTYuMDY5LTYuNDA3LTUuMjI4IDcuNzU1LS42NzQtMi41MjctOC41OTYgNi41NzUgNi4wNjkgNC4yMTQtNy40MTd6bS0zLjc3OSAxNC4zNzMtLjk3MS0uNzkyIDEuMTcyLS4xLS4zODItMS4zMDMuOTk3LjkyMS42MzYtMS4xMjIuMTAxIDEuMjIzIDEuMDk3LS4zMDYtLjcxMSAxLjA0Ni44OTIuNDgxLTEuMDQ3LjMzNC4yMjkuODkzLS44MTUtLjY2Ni0uNjYyLjg3LS4xMDQtMS4wMi0uOTE3LjQ2LjQ4NS0uOTE5eiIKICAgIGNsaXAtcnVsZT0iZXZlbm9kZCIKICAvPgo8L3N2Zz4K';

  return image;
}

export function useDrawBombs() {
  const { currentTick, bombPlanted, bombDefused, bombExploded, currentPlayersPositions, bombCarrierPositions } =
    useViewerContext();
  const bombImage = getBombImage();
  const explosionImage = getBombExplosionImage();

  const drawBombs = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
  ) => {
    if (bombPlanted === null || bombPlanted.tick > currentTick) {
      // A player has the bomb, the bomb indicator will be drawn by the drawPlayers function
      if (currentPlayersPositions.some((position) => position.hasBomb)) {
        return;
      }

      // The bomb has been dropped, draw it where its last carrier was
      const lastBombCarrierPosition = findLastPositionAtOrBeforeTick(bombCarrierPositions, currentTick);
      if (lastBombCarrierPosition) {
        const { x, y, z } = lastBombCarrierPosition;
        const zoomedX = zoomedToRadarX(x, z);
        const zoomedY = zoomedToRadarY(y, z);
        const bombImageSize = zoomedSize(14);
        context.drawImage(
          bombImage,
          zoomedX - bombImageSize / 2,
          zoomedY - bombImageSize / 2,
          bombImageSize,
          bombImageSize,
        );
      }

      return;
    }

    const isDefusedBomb = bombDefused !== null && bombDefused.tick <= currentTick;
    const isExplodedBomb = bombExploded !== null && bombExploded.tick <= currentTick;
    const x = zoomedToRadarX(bombPlanted.x, bombPlanted.z);
    const y = zoomedToRadarY(bombPlanted.y, bombPlanted.z);
    const bombImageSize = zoomedSize(isExplodedBomb ? 60 : 22);
    context.save();
    context.globalAlpha = isDefusedBomb ? 0.5 : 1;
    const image = isExplodedBomb ? explosionImage : bombImage;
    context.drawImage(image, x - bombImageSize / 2, y - bombImageSize / 2, bombImageSize, bombImageSize);
    context.restore();
  };

  return { drawBombs };
}
