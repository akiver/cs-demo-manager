import { useCallback, useEffect, useRef, useState } from 'react';
import { getScaledCoordinateX } from 'csdm/ui/maps/get-scaled-coordinate-x';
import { getScaledCoordinateY } from 'csdm/ui/maps/get-scaled-coordinate-y';
import type { Map } from 'csdm/common/types/map';

function getScaleMultiplier(delta: number) {
  const sign = Math.sign(delta);
  const deltaAdjusted = Math.min(0.25, Math.abs(delta / 128));

  return 1 - sign * deltaAdjusted;
}

export type InteractiveCanvas = {
  getScaledRadarSize: () => number;
  setWrapper: (wrapper: HTMLDivElement) => void;
  zoomedSize: (size: number) => number;
  zoomedX: (x: number) => number;
  zoomedY: (y: number) => number;
  zoomedToRadarX: (x: number) => number;
  zoomedToRadarY: (y: number) => number;
  getMouseX: () => number;
  getMouseY: () => number;
  canvasSize: { width: number; height: number };
};

/**
 * Hook to make the canvas where maps radar are drawn interactive (zoom/pan) and expose methods to scale drawings.
 * ! It's intended to be used in combination of window.requestAnimationFrame, it doesn't trigger re-renders excepted on window resizing.
 * The canvas element must be wrapped by a div and its ref prop must call the setWrapper provided by this hook.
 * See the 2D viewer code for usage details.
 */
export function useInteractiveMapCanvas(canvas: HTMLCanvasElement | null, map: Map): InteractiveCanvas {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const worldOriginX = useRef(0);
  const worldOriginY = useRef(0);
  const screenOriginPixelX = useRef(0);
  const screenOriginPixelY = useRef(0);
  const mouseWorldX = useRef(0);
  const mouseWorldY = useRef(0);
  const mousePixelX = useRef(0);
  const mousePixelY = useRef(0);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const scale = useRef(1);
  const isDragging = useRef(false);

  const updateCanvasSize = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (wrapper === null) {
      return;
    }

    const height = wrapper.clientHeight * window.devicePixelRatio;
    const width = wrapper.clientWidth * window.devicePixelRatio;
    scale.current = height / window.devicePixelRatio / map.radarSize;
    screenOriginPixelX.current = (width / window.devicePixelRatio - map.radarSize * scale.current) / 2;

    setCanvasSize({
      height,
      width,
    });
  }, [map.radarSize]);

  const setWrapper = useCallback(
    (wrapper: HTMLDivElement | null) => {
      if (wrapper) {
        wrapperRef.current = wrapper;
        updateCanvasSize();
      }
    },
    [updateCanvasSize],
  );

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('fullscreenchange', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('fullscreenchange', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  const pixelToWorldX = useCallback((x: number) => {
    return Math.floor((x - screenOriginPixelX.current) * (1 / scale.current) + worldOriginX.current);
  }, []);

  const pixelToWorldY = useCallback((y: number) => {
    return Math.floor((y - screenOriginPixelY.current) * (1 / scale.current) + worldOriginY.current);
  }, []);

  useEffect(() => {
    if (canvas === null) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      worldOriginX.current = mouseWorldX.current;
      worldOriginY.current = mouseWorldY.current;
      screenOriginPixelX.current = mousePixelX.current;
      screenOriginPixelY.current = mousePixelY.current;
      mouseWorldX.current = pixelToWorldX(mousePixelX.current);
      mouseWorldY.current = pixelToWorldY(mousePixelY.current);

      const scaleMultiplier = getScaleMultiplier(event.deltaY);
      const isZoomIn = event.deltaY < 0;
      const newScale = isZoomIn
        ? Math.min(5, scale.current * scaleMultiplier)
        : Math.max(0.1, scale.current * scaleMultiplier);
      scale.current = newScale;
    };

    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [pixelToWorldX, pixelToWorldY, canvas]);

  useEffect(() => {
    if (canvas === null) {
      return;
    }

    const onMouseEvent = (event: MouseEvent) => {
      if (canvas === null) {
        return;
      }

      const canvasRectangle = canvas.getBoundingClientRect();
      mousePixelX.current = event.clientX - canvasRectangle.left;
      mousePixelY.current = event.clientY - canvasRectangle.top;
      const lastMouseWorldX = mouseWorldX.current;
      const lastMouseWorldY = mouseWorldY.current;
      mouseWorldX.current = pixelToWorldX(mousePixelX.current);
      mouseWorldY.current = pixelToWorldY(mousePixelY.current);

      if (event.type === 'mousedown') {
        isDragging.current = true;
      } else if (event.type === 'mouseup' || event.type === 'mouseout') {
        isDragging.current = false;
      }

      if (isDragging.current) {
        worldOriginX.current -= mouseWorldX.current - lastMouseWorldX;
        worldOriginY.current -= mouseWorldY.current - lastMouseWorldY;
        mouseWorldX.current = pixelToWorldX(mousePixelX.current);
        mouseWorldY.current = pixelToWorldY(mousePixelY.current);
      }
    };

    canvas.addEventListener('mousemove', onMouseEvent);
    canvas.addEventListener('mousedown', onMouseEvent);
    canvas.addEventListener('mouseup', onMouseEvent);
    canvas.addEventListener('mouseout', onMouseEvent);

    return () => {
      canvas.removeEventListener('mousemove', onMouseEvent);
      canvas.removeEventListener('mousedown', onMouseEvent);
      canvas.removeEventListener('mouseup', onMouseEvent);
      canvas.removeEventListener('mouseout', onMouseEvent);
    };
  }, [pixelToWorldX, pixelToWorldY, canvas]);

  const getScaledRadarSize = () => {
    return Math.floor(map.radarSize * scale.current);
  };

  const zoomedSize = (size: number) => {
    // The size of the radar may be 2048px instead of 1024px since the May 9, 2025 CS2 update.
    // Use 1024px as the base size to properly scale the elements
    return Math.floor(size * scale.current * (map.radarSize / 1024));
  };

  const zoomedX = (x: number) => {
    return Math.floor((x - worldOriginX.current) * scale.current + screenOriginPixelX.current);
  };

  const zoomedY = (y: number) => {
    return Math.floor((y - worldOriginY.current) * scale.current + screenOriginPixelY.current);
  };

  const zoomedToRadarX = (x: number) => {
    const scaledX = getScaledCoordinateX(map, map.radarSize, x);
    return zoomedX(scaledX);
  };

  const zoomedToRadarY = (y: number) => {
    const scaledY = getScaledCoordinateY(map, map.radarSize, y);
    return zoomedY(scaledY);
  };

  return {
    getScaledRadarSize,
    setWrapper,
    zoomedSize,
    zoomedX,
    zoomedY,
    zoomedToRadarX,
    zoomedToRadarY,
    getMouseX: () => mousePixelX.current,
    getMouseY: () => mousePixelY.current,
    canvasSize,
  };
}
