import { useEffect, useRef } from 'react';
import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import { useViewerContext } from '../use-viewer-context';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { loadImageFromFilePath } from 'csdm/ui/shared/load-image-from-file-path';

export function useDrawMapRadar() {
  const { radarFilePath, lowerRadarFilePath, radarLevel } = useViewerContext();
  const radarImage = useRef<HTMLImageElement | null>(null);
  const lowerRadarImage = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const loadRadarImages = async () => {
      radarImage.current = await loadImageFromFilePath(radarFilePath);
      if (lowerRadarFilePath !== undefined) {
        lowerRadarImage.current = await loadImageFromFilePath(lowerRadarFilePath);
      }
    };

    loadRadarImages();
  }, [radarFilePath, lowerRadarFilePath]);

  const drawMapRadar = (context: CanvasRenderingContext2D, { zoomedSize, zoomedX, zoomedY }: InteractiveCanvas) => {
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
      context.drawImage(image, zoomedX(0), zoomedY(0), zoomedSize(MAP_RADAR_SIZE), zoomedSize(MAP_RADAR_SIZE));
    }
  };

  return { drawMapRadar };
}
