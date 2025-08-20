import { useEffect, useRef } from 'react';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { loadImageFromFilePath } from 'csdm/ui/shared/load-image-from-file-path';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';

export function useDrawMapRadar() {
  const { map, game, lowerRadarOffsetX, lowerRadarOffsetY, lowerRadarOpacity } = useViewerContext();
  const radarImage = useRef<HTMLImageElement | null>(null);
  const lowerRadarImage = useRef<HTMLImageElement | null>(null);
  const getMapRadarFileSrc = useGetMapRadarSrc();

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

  const drawMapRadar = (
    context: CanvasRenderingContext2D,
    { zoomedX, zoomedY, getScaledRadarSize, zoomedSize }: InteractiveCanvas,
  ) => {
    if (context === null) {
      return;
    }

    const radarSize = getScaledRadarSize();
    const x = zoomedX(0);
    const y = zoomedY(0);

    if (lowerRadarImage.current !== null) {
      context.save();
      context.globalAlpha = lowerRadarOpacity;
      const scaledOffsetX = zoomedSize(lowerRadarOffsetX);
      const scaledOffsetY = zoomedSize(lowerRadarOffsetY);
      context.drawImage(
        lowerRadarImage.current,
        x + scaledOffsetX,
        y + radarSize + scaledOffsetY,
        radarSize,
        radarSize,
      );
      context.restore();
    }

    if (radarImage.current !== null) {
      context.drawImage(radarImage.current, x, y, radarSize, radarSize);
    }
  };

  return { drawMapRadar };
}
