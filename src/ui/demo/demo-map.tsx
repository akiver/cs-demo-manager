import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoField } from './demo-field';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  mapName: string;
  game: Game;
};

export function DemoMap({ mapName, game }: Props) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();

  return (
    <div className="flex gap-x-8">
      <DemoField label={<Trans>Map:</Trans>} value={mapName} />
      <img className="h-40 rounded" src={getMapThumbnailSrc(mapName, game)} alt={mapName} />
    </div>
  );
}
