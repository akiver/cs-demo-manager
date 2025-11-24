import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CameraEntry } from './camera-entry';
import type { Game } from 'csdm/common/types/counter-strike';
import { useCameras } from 'csdm/ui/cameras/use-cameras';

type Props = {
  game: Game;
  mapName: string;
};

export function Cameras({ game, mapName }: Props) {
  const cameras = useCameras(game, mapName);

  if (cameras.length === 0) {
    return (
      <p className="text-body-strong">
        <Trans>No cameras found for {mapName}.</Trans>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-8">
      {cameras.map((camera) => {
        return <CameraEntry key={camera.id} camera={camera} />;
      })}
    </div>
  );
}
