import { useEffect, useRef } from 'react';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { loadImageFromFilePath } from 'csdm/ui/shared/load-image-from-file-path';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';

export function useDrawMapRadar() {
  const { map, game, radarLevel } = useViewerContext();
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
  }, [getMapRadarFileSrc, game, map.name, radarLevel]);

  const drawMapRadar = (
    context: CanvasRenderingContext2D,
    { zoomedX, zoomedY, getScaledRadarSize }: InteractiveCanvas,
  ) => {
    if (context === null) {
      return;
    }

    let image: HTMLImageElement | null = null;
    if (radarLevel === RadarLevel.Upper && radarImage.current !== null) {
      image = radarImage.current;
    } else if (radarLevel === RadarLevel.Lower && lowerRadarImage.current !== null) {
      image = lowerRadarImage.current;
    }

    if (image !== null) {
      const radarSize = getScaledRadarSize();

      context.drawImage(image, zoomedX(0), zoomedY(0), radarSize, radarSize);
    }
  };

  return { drawMapRadar };
}
