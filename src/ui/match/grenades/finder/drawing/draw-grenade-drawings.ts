import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import type { GrenadeDrawing } from './grenade-drawing';

function drawGrenadeImage(
  context: CanvasRenderingContext2D,
  drawing: GrenadeDrawing,
  zoomedSize: (size: number) => number,
) {
  const imageSize = zoomedSize(40);
  context.drawImage(
    drawing.image,
    drawing.imageX - imageSize / 2,
    drawing.imageY - imageSize / 2,
    imageSize,
    imageSize,
  );
}

export function drawGrenadeDrawings(
  drawings: GrenadeDrawing[],
  context: CanvasRenderingContext2D,
  interactiveCanvas: InteractiveCanvas,
  hoveredIdRef: React.RefObject<string | undefined>,
) {
  const { zoomedSize, getMouseX, getMouseY } = interactiveCanvas;

  context.lineWidth = zoomedSize(2);
  const mouseX = getMouseX();
  const mouseY = getMouseY();
  const hoveredDrawing = drawings.find((drawing) => {
    return context.isPointInStroke(drawing.path, mouseX, mouseY);
  });

  if (hoveredDrawing) {
    hoveredIdRef.current = hoveredDrawing.id;
    context.strokeStyle = 'green';
    context.stroke(hoveredDrawing.path);
    drawGrenadeImage(context, hoveredDrawing, zoomedSize);
  } else {
    hoveredIdRef.current = undefined;
    context.strokeStyle = 'red';
    for (const drawing of drawings) {
      context.stroke(drawing.path);
      drawGrenadeImage(context, drawing, zoomedSize);
    }
  }
}
