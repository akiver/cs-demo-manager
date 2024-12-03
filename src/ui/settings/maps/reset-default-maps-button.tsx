import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { resetMaps } from 'csdm/ui/maps/maps-actions';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Status } from 'csdm/common/types/status';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  game: Game;
};

function ResetDefaultMapsDialog({ game }: Props) {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const onConfirm = async () => {
    try {
      setStatus(Status.Loading);
      const maps = await client.send({
        name: RendererClientMessageName.ResetMaps,
        payload: game,
      });
      dispatch(resetMaps({ maps }));
      hideDialog();
    } catch (error) {
      setStatus(Status.Error);
    }
  };

  const isLoading = status === Status.Loading;

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Reset maps</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      blockNavigation={isLoading}
      isBusy={isLoading}
    >
      <p>
        <Trans>It will reset default maps.</Trans>
      </p>
      {status === Status.Error && <ErrorMessage message={<Trans>An error occurred.</Trans>} />}
    </ConfirmDialog>
  );
}

export function ResetDefaultMapsButton({ game }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ResetDefaultMapsDialog game={game} />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Reset default maps</Trans>
    </Button>
  );
}
