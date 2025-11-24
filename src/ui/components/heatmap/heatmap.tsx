import React, { useRef, useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { useHeatmapContext } from './heatmap-context';
import { HeatmapRenderer, type HeatmapPoint } from 'csdm/ui/shared/heatmap-renderer';
import { getScaledCoordinateX } from 'csdm/ui/maps/get-scaled-coordinate-x';
import { getScaledCoordinateY } from 'csdm/ui/maps/get-scaled-coordinate-y';
import type { Map } from 'csdm/common/types/map';
import type { Game } from 'csdm/common/types/counter-strike';
import { useMaps } from 'csdm/ui/maps/use-maps';
import { UnsupportedMap } from 'csdm/ui/components/unsupported-map';
import { Message } from 'csdm/ui/components/message';
import { useMapCanvas } from 'csdm/ui/hooks/use-map-canvas';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { Point } from 'csdm/common/types/point';
import { ResetHeatmapZoom } from './heatmap-events';

type HeatmapCanvasProps = {
  map: Map;
  game: Game;
  points: Point[];
  alpha: number;
  blur: number;
  radius: number;
  radarLevel: RadarLevel;
};

function HeatmapCanvas({ map, game, points, alpha, blur, radius, radarLevel }: HeatmapCanvasProps) {
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapRendererRef = useRef<HeatmapRenderer | null>(null);

  const { setCanvas, interactiveCanvas } = useMapCanvas({
    map,
    game,
    mode: radarLevel === RadarLevel.Upper ? 'upper' : 'lower',
    draw: (interactiveCanvas, context) => {
      const heatmapCanvas = heatmapCanvasRef.current;
      if (!heatmapCanvas) {
        return;
      }

      if (!heatmapRendererRef.current) {
        heatmapCanvas.width = interactiveCanvas.canvasSize.width;
        heatmapCanvas.height = interactiveCanvas.canvasSize.height;
        heatmapRendererRef.current = new HeatmapRenderer(heatmapCanvas);
      }

      const scaledPoints: HeatmapPoint[] = points.map((point) => {
        const x = interactiveCanvas.zoomedX(getScaledCoordinateX(map, map.radarSize, point.x));
        const y = interactiveCanvas.zoomedY(getScaledCoordinateY(map, map.radarSize, point.y));
        return [x, y, 1];
      });

      const heatmapRenderer = heatmapRendererRef.current;
      heatmapRenderer.setAlpha(alpha);
      heatmapRenderer.setRadius(interactiveCanvas.zoomedSize(radius), blur);
      heatmapRenderer.setPoints(scaledPoints);
      heatmapRenderer.draw();

      // draw the heatmap over the radar
      context.drawImage(heatmapCanvas, 0, 0);
    },
  });
  const { setWrapper, canvasSize, resetZoom } = interactiveCanvas;

  useEffect(() => {
    window.addEventListener(ResetHeatmapZoom.name, resetZoom);

    return () => {
      window.removeEventListener(ResetHeatmapZoom.name, resetZoom);
    };
  }, [resetZoom]);

  return (
    <div ref={setWrapper} className="relative flex size-full">
      <canvas id="radar-canvas" ref={(el) => setCanvas(el)} width={canvasSize.width} height={canvasSize.height} />
      <canvas id="heatmap-canvas" ref={heatmapCanvasRef} className="hidden" />
    </div>
  );
}

export function Heatmap() {
  const { alpha, blur, radius, points, mapName, game, radarLevel } = useHeatmapContext();
  const maps = useMaps();
  const map = maps.find((map) => map.name === mapName);

  if (mapName === '') {
    return <Message message={<Trans>Select a map.</Trans>} />;
  }

  if (!map) {
    return <UnsupportedMap />;
  }

  if (points.length === 0) {
    return <Message message={<Trans>No data points were found for the current filters.</Trans>} />;
  }

  return (
    <HeatmapCanvas
      map={map}
      game={game}
      points={points}
      alpha={alpha}
      blur={blur}
      radius={radius}
      radarLevel={radarLevel}
    />
  );
}
