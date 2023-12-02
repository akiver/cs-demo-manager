import React, { useRef, useEffect } from 'react';
import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';
import { useHeatmapContext } from './heatmap-context';

export function Heatmap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setRadarCanvas, setHeatmapCanvas, setCanvasSize, canvasSize, draw } = useHeatmapContext();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper === null) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const canvasSize = Math.min(entries[0].contentRect.height, MAP_RADAR_SIZE);
        setCanvasSize(canvasSize);
        draw();
      }
    });

    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
    };
  }, [setCanvasSize, draw]);

  const onRadarCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas !== null) {
      setRadarCanvas(canvas);
    }
  };

  const onHeatmapCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas !== null) {
      setHeatmapCanvas(canvas);
    }
  };

  return (
    <div className="relative flex flex-col" ref={wrapperRef}>
      <canvas ref={onRadarCanvasRef} width={canvasSize} height={canvasSize} />
      <canvas className="absolute left-0" ref={onHeatmapCanvasRef} width={canvasSize} height={canvasSize} />
    </div>
  );
}
