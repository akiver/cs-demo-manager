import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import type { GrenadeDrawing } from './grenade-drawing';
import { useGetGrenadeImage } from './use-get-grenade-image';

export function useBuildGrenadeDrawings() {
  const getGrenadeImage = useGetGrenadeImage();

  return async (grenadesThrow: GrenadeThrow[], focusedId: string | undefined, interactiveCanvas: InteractiveCanvas) => {
    const { zoomedToRadarX, zoomedToRadarY } = interactiveCanvas;
    const drawings: GrenadeDrawing[] = [];
    let currentPath = new Path2D();
    for (const grenadeThrow of grenadesThrow) {
      if (focusedId !== undefined && focusedId !== grenadeThrow.id) {
        continue;
      }

      for (const [index, position] of grenadeThrow.positions.entries()) {
        const nextPosition = index < grenadeThrow.positions.length ? grenadeThrow.positions[index + 1] : undefined;
        const startX = zoomedToRadarX(position.x);
        const startY = zoomedToRadarY(position.y);
        if (nextPosition) {
          const endX = zoomedToRadarX(nextPosition.x);
          const endY = zoomedToRadarY(nextPosition.y);
          currentPath.moveTo(startX, startY);
          currentPath.lineTo(endX, endY);
        } else {
          const grenadeImage = await getGrenadeImage(grenadeThrow.grenadeName);
          drawings.push({
            id: grenadeThrow.id,
            path: currentPath,
            image: grenadeImage,
            imageX: startX,
            imageY: startY,
          });
          currentPath = new Path2D();
        }
      }
    }
    currentPath.closePath();

    return drawings;
  };
}
