import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { CenteredContent } from 'csdm/ui/components/content';
import { Status } from 'csdm/common/types/status';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Spinner } from 'csdm/ui/components/spinner';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useCurrentMatch } from '../use-current-match';
import { ErrorCode } from 'csdm/common/error-code';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';

type Props = {
  onPositionsAvailable: () => void;
};

function GeneratingDialog({ onPositionsAvailable }: Props) {
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [message, setMessage] = useState(
    <Trans>It will analyze the demo and generate positions required for the 2D viewer.</Trans>,
  );
  const [error, setError] = useState(<Trans>An error occurred.</Trans>);

  const onGenerateClick = async () => {
    const onInsertingPositions = () => {
      setMessage(<Trans>Inserting positions into the database…</Trans>);
    };

    try {
      setMessage(<Trans>Analyzing demo…</Trans>);
      setStatus(Status.Loading);

      client.on(RendererServerMessageName.InsertingMatchPositions, onInsertingPositions);
      await client.send({
        name: RendererClientMessageName.GenerateMatchPositions,
        payload: {
          demoPath: match.demoFilePath,
          checksum: match.checksum,
          source: match.source,
        },
      });

      onPositionsAvailable();
      hideDialog();
    } catch (error) {
      switch (error) {
        case ErrorCode.DemoNotFound:
          setError(<Trans>Demo not found.</Trans>);
      }
      setStatus(Status.Error);
    } finally {
      client.off(RendererServerMessageName.InsertingMatchPositions, onInsertingPositions);
    }
  };

  return (
    <Dialog closeOnBackgroundClicked={false} closeOnEscPressed={false}>
      <DialogHeader>
        <DialogTitle>
          <Trans>Positions</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-12 max-w-2xl">
          <p>
            <Trans>It will analyze the demo and generate positions required for the 2D viewer.</Trans>
          </p>
          <div className="flex items-center gap-x-4">
            <ExclamationTriangleIcon className="size-16 shrink-0 text-orange-700" />
            <p>
              <Trans>
                Positions require disk space, it's recommended to delete them from the database settings when you don't
                need them anymore.
              </Trans>
            </p>
          </div>
          {status === Status.Loading && (
            <div className="flex items-center gap-x-12">
              <Spinner size={24} />
              <p>{message}</p>
            </div>
          )}
        </div>
        {status === Status.Error && <p className="mt-8">{error}</p>}
      </DialogContent>
      <DialogFooter>
        <Button variant={ButtonVariant.Primary} onClick={onGenerateClick} isDisabled={status === Status.Loading}>
          <Trans>Generate</Trans>
        </Button>
        <CancelButton isDisabled={status === Status.Loading} onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}

export function NoPositionsFound({ onPositionsAvailable }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<GeneratingDialog onPositionsAvailable={onPositionsAvailable} />);
  };

  return (
    <CenteredContent>
      <p className="text-subtitle mb-12">
        <Trans>Positions haven't been generated yet.</Trans>
      </p>
      <Button onClick={onClick} variant={ButtonVariant.Primary}>
        <Trans>Generate positions</Trans>
      </Button>
    </CenteredContent>
  );
}
