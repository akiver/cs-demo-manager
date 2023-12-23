import { useEffect, useRef } from 'react';
import { drawMapRadar } from '../match/grenades/finder/drawing/draw-map-radar';
import { useInteractiveMapCanvas, type InteractiveCanvas } from './use-interactive-map-canvas';
import type { Map } from 'csdm/common/types/map';

type Options = {
  map: Map;
  radarFileSrc: string;
  draw: (interactiveCanvas: InteractiveCanvas, context: CanvasRenderingContext2D) => void;
  onClick: (event: MouseEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
};

export function useMapCanvas({ onClick, draw, map, radarFileSrc, onContextMenu }: Options) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarImage = useRef<HTMLImageElement | null>(null);
  const animationId = useRef(0);
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const interactiveCanvas = useInteractiveMapCanvas(canvasRef.current, map);

  useEffect(() => {
    const image = new Image();
    image.addEventListener('load', () => {
      radarImage.current = image;
    });

    image.src = radarFileSrc;
  }, [radarFileSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    const loop = () => {
      context.clearRect(0, 0, interactiveCanvas.canvasSize.width, interactiveCanvas.canvasSize.height);
      drawMapRadar(radarImage.current, context, interactiveCanvas);
      draw(interactiveCanvas, context);

      animationId.current = window.requestAnimationFrame(loop);
    };

    const onBlur = () => {
      window.cancelAnimationFrame(animationId.current);
    };
    const onFocus = () => {
      animationId.current = window.requestAnimationFrame(loop);
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    animationId.current = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationId.current);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const onMouseDown = () => {
      isMouseDown.current = true;
    };

    const onMouseMove = () => {
      if (isMouseDown.current) {
        isDragging.current = true;
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      isMouseDown.current = false;
      if (isDragging.current) {
        isDragging.current = false;
        return;
      }

      onClick(event);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [onClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  });

  return { canvasRef, interactiveCanvas };
}
