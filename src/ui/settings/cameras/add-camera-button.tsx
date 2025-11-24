import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Game } from 'csdm/common/types/counter-strike';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { CameraFormProvider } from './form/camera-form-provider';
import { AddCameraDialog } from './add-camera-dialog';

type Props = {
  game: Game;
  mapName: string;
};

export function AddCameraButton({ game, mapName }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(
      <CameraFormProvider game={game} mapName={mapName}>
        <AddCameraDialog />
      </CameraFormProvider>,
    );
  };

  return (
    <Button onClick={onClick} variant={ButtonVariant.Primary}>
      <Trans context="Button">Add a camera</Trans>
    </Button>
  );
}
