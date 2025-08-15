import React, { useRef, useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useHeatmapContext } from './heatmap-context';
import { HeatmapRenderer, type HeatmapPoint } from 'csdm/ui/shared/heatmap-renderer';
import { getScaledCoordinateX } from 'csdm/ui/maps/get-scaled-coordinate-x';
import { getScaledCoordinateY } from 'csdm/ui/maps/get-scaled-coordinate-y';
import type { Map } from 'csdm/common/types/map';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';
import { useMaps } from 'csdm/ui/maps/use-maps';
import { UnsupportedMap } from 'csdm/ui/components/unsupported-map';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', reject);
    image.src = src;
  });
}

export function Heatmap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapRendererRef = useRef<HeatmapRenderer | null>(null);
  const [status, setStatus] = useState<Status>(Status.Loading);
  const { alpha, blur, radius, points, mapName, radarLevel, game } = useHeatmapContext();
  const [canvasSize, setCanvasSize] = useState(1024);
  const [map, setMap] = useState<Map | undefined>(undefined);
  const [radarImage, setRadarImage] = useState<HTMLImageElement | null>(null);
  const getGetMapRadarFileSrc = useGetMapRadarSrc();
  const maps = useMaps();
  const isSupportedMap = map !== undefined && radarImage !== null;

  useEffect(() => {
    const loadRadarImage = async () => {
      const radarFileSrc = getGetMapRadarFileSrc(mapName, game, radarLevel);
      const map = maps.find((map) => map.name === mapName);
      setMap(map);

      if (!radarFileSrc) {
        setRadarImage(null);
        setStatus(Status.Success);
        return;
      }

      try {
        const radarImage = await loadImage(radarFileSrc);
        setRadarImage(radarImage);
        setStatus(Status.Success);
      } catch (error) {
        logger.error('Failed to load radar image');
        logger.error(error);
        setStatus(Status.Error);
      }
    };

    loadRadarImage();
  }, [game, getGetMapRadarFileSrc, mapName, maps, radarLevel]);

  useEffect(() => {
    const draw = () => {
      if (!radarImage || !map) {
        return;
      }

      const radar = radarCanvasRef.current;
      if (radar === null) {
        throw new Error('Radar canvas is not initialized');
      }

      const heatmapRenderer = heatmapRendererRef.current;
      if (heatmapRenderer === null) {
        throw new Error('Heatmap is not initialized');
      }

      const context = radar.getContext('2d') as CanvasRenderingContext2D;
      context.clearRect(0, 0, radar.width, radar.height);
      context.drawImage(radarImage, 0, 0, radar.width, radar.height);

      const scaledPoints: HeatmapPoint[] = points.map((point) => {
        return [getScaledCoordinateX(map, radar.width, point.x), getScaledCoordinateY(map, radar.width, point.y), 1];
      });
      heatmapRenderer.setAlpha(alpha);
      heatmapRenderer.setRadius(radius, blur);
      heatmapRenderer.setPoints(scaledPoints);
      heatmapRenderer.draw();
    };

    const wrapper = wrapperRef.current;
    if (wrapper === null || !map) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const canvasSize = Math.min(entries[0].contentRect.height, map.radarSize);
        setCanvasSize(canvasSize);
        draw();
      }
    });

    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
    };
  }, [alpha, blur, radius, map, points, radarImage]);

  const onHeatmapCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      heatmapRendererRef.current = null;
      return;
    }

    if (heatmapRendererRef.current === null) {
      heatmapRendererRef.current = new HeatmapRenderer(canvas);
    }
  };

  if (status === Status.Loading) {
    return <Message message={<Trans>Loading map…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred while loading the map.</Trans>} />;
  }

  if (mapName === '') {
    return <Message message={<Trans>Select a map.</Trans>} />;
  }

  if (!isSupportedMap) {
    return <UnsupportedMap />;
  }

  if (points.length === 0) {
    return <Message message={<Trans>No data points were found for the current filters.</Trans>} />;
  }

  return (
    <div className="relative flex flex-col" ref={wrapperRef}>
      <canvas id="radar-canvas" ref={radarCanvasRef} width={canvasSize} height={canvasSize} />
      <canvas
        id="heatmap-canvas"
        className="absolute left-0"
        ref={onHeatmapCanvasRef}
        width={canvasSize}
        height={canvasSize}
      />
    </div>
  );
}
