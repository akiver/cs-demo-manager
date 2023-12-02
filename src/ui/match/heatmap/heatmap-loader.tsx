import React, { useEffect, useState } from 'react';
import { Heatmap } from 'csdm/ui/match/heatmap/heatmap';
import { HeatmapFilters } from 'csdm/ui/match/heatmap/heatmap-filters';
import { UnsupportedMap } from 'csdm/ui/components/unsupported-map';
import { Content } from 'csdm/ui/components/content';
import { useCurrentMatchMap } from 'csdm/ui/match/use-current-match-map';
import { useRadarLevel } from './use-radar-level';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';
import { HeatmapProvider } from './heatmap-provider';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { useCurrentMatch } from '../use-current-match';

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

export function HeatmapLoader() {
  const match = useCurrentMatch();
  const map = useCurrentMatchMap();
  const { radarLevel } = useRadarLevel();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const getGetMapRadarFileSrc = useGetMapRadarSrc();
  const radarFileSrc = getGetMapRadarFileSrc(map?.name, match.game, radarLevel);
  const [radarImage, setRadarImage] = useState<HTMLImageElement | null>(null);
  const isSupportedMap = map !== undefined && radarImage !== null;

  useEffect(() => {
    const loadRadarImage = async () => {
      if (radarFileSrc === undefined) {
        setStatus(Status.Success);
        return;
      }

      try {
        const radarImage = await loadImage(radarFileSrc);
        setStatus(Status.Success);
        setRadarImage(radarImage);
      } catch (error) {
        logger.error('Failed to load radar image');
        logger.error(error);
        setStatus(Status.Error);
      }
    };

    loadRadarImage();
  }, [radarFileSrc]);

  if (status === Status.Loading) {
    return <Message message="Loading map..." />;
  }

  if (status === Status.Error) {
    return <Message message="An error occurred while loading map." />;
  }

  if (!isSupportedMap) {
    return <UnsupportedMap />;
  }

  return (
    <HeatmapProvider map={map} radarImage={radarImage}>
      <Content>
        <div className="flex h-full">
          <HeatmapFilters />
          <Heatmap />
        </div>
      </Content>
    </HeatmapProvider>
  );
}
