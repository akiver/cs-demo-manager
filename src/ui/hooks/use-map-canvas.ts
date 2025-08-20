import { useEffect, useRef } from 'react';
import { useInteractiveMapCanvas, type InteractiveCanvas } from './use-interactive-map-canvas';
import type { Map } from 'csdm/common/types/map';
import { useGetMapRadarSrc } from '../maps/use-get-map-radar-src';
import type { Game } from 'csdm/common/types/counter-strike';
import { RadarLevel } from '../maps/radar-level';
import { loadImageFromFilePath } from '../shared/load-image-from-file-path';

type Options = {
  map: Map;
  game: Game;
  draw: (interactiveCanvas: InteractiveCanvas, context: CanvasRenderingContext2D) => void;
  onClick: (event: MouseEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
};

export function useMapCanvas({ onClick, draw, map, game, onContextMenu }: Options) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarImage = useRef<HTMLImageElement | null>(null);
  const lowerRadarImage = useRef<HTMLImageElement | null>(null);
  const getMapRadarFileSrc = useGetMapRadarSrc();
  const animationId = useRef(0);
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const interactiveCanvas = useInteractiveMapCanvas(canvasRef.current, map);

  useEffect(() => {
    const loadRadarImages = async () => {
      const upperRadarFilePath = getMapRadarFileSrc(map.name, game, RadarLevel.Upper);
      if (upperRadarFilePath) {
        radarImage.current = await loadImageFromFilePath(upperRadarFilePath);
      }

      const lowerRadarFilePath = getMapRadarFileSrc(map.name, game, RadarLevel.Lower);
      if (lowerRadarFilePath) {
        lowerRadarImage.current = await loadImageFromFilePath(lowerRadarFilePath);
      }
    };

    loadRadarImages();
  }, [getMapRadarFileSrc, game, map.name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const { canvasSize, zoomedX, zoomedY, getScaledRadarSize } = interactiveCanvas;

    const loop = () => {
      context.clearRect(0, 0, canvasSize.width, canvasSize.height);
      const radarSize = getScaledRadarSize();
      const x = zoomedX(0);
      const y = zoomedY(0);
      if (radarImage.current !== null) {
        context.drawImage(radarImage.current, x, y, radarSize, radarSize);
      }

      if (lowerRadarImage.current !== null) {
        context.drawImage(lowerRadarImage.current, x, y + radarSize, radarSize, radarSize);
      }
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
