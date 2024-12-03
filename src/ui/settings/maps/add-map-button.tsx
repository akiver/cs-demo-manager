import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Game } from 'csdm/common/types/counter-strike';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { AddMapDialog } from 'csdm/ui/settings/maps/add-map-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { MapFormProvider } from 'csdm/ui/settings/maps/map-dialog/map-form-provider';

type Props = {
  game: Game;
};

export function AddMapButton({ game }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(
      <MapFormProvider game={game}>
        <AddMapDialog />
      </MapFormProvider>,
    );
  };

  return (
    <>
      <Button onClick={onClick} variant={ButtonVariant.Primary}>
        <Trans context="Button">Add a map</Trans>
      </Button>
    </>
  );
}
