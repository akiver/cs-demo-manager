import React, { useState, type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { ErrorCode } from 'csdm/common/error-code';
import { useGetBoilerErrorMessageFromErrorCode } from 'csdm/ui/downloads/use-get-boiler-error-message-from-error-code';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useIsCsRunning } from 'csdm/ui/hooks/use-is-cs-running';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';

type State = {
  shareCode: string;
  status: Status;
  error: ReactNode | undefined;
  csIsRunning: boolean;
};

function DownloadDemoFromShareCodeDialog() {
  const [state, setState] = useState<State>({
    shareCode: '',
    status: Status.Idle,
    csIsRunning: false,
    error: undefined,
  });
  const client = useWebSocketClient();
  const isCsRunning = useIsCsRunning();
  const { hideDialog } = useDialog();
  const { t } = useLingui();
  const getBoilerErrorMessageFromErrorCode = useGetBoilerErrorMessageFromErrorCode();
  const { shareCode, status, error, csIsRunning } = state;
  const isShareCodeEmpty = shareCode.length === 0;

  const sendDownloadDemoFromShareCode = async () => {
    setState({
      ...state,
      status: Status.Loading,
      csIsRunning: false,
    });

    try {
      await client.send({
        name: RendererClientMessageName.AddDownloadFromShareCode,
        payload: shareCode,
      });
      hideDialog();
    } catch (error) {
      let errorMessage: ReactNode;

      switch (error) {
        case ErrorCode.InvalidShareCode:
          errorMessage = <Trans>Invalid share code.</Trans>;
          break;
        case ErrorCode.DecodeShareCodeError:
          errorMessage = <Trans>An error occurred while decoding the share code.</Trans>;
          break;
        case ErrorCode.DownloadFolderNotDefined:
          errorMessage = <Trans>A download folder is required. You can change it from settings.</Trans>;
          break;
        case ErrorCode.DownloadFolderNotExists:
          errorMessage = <Trans>The download folder doesn't exist, please change it from the settings.</Trans>;
          break;
        case ErrorCode.MatchAlreadyInDownloadQueue:
          errorMessage = <Trans>This match is already in pending downloads.</Trans>;
          break;
        case ErrorCode.MatchAlreadyDownloaded:
          errorMessage = <Trans>This match is already in your downloads folder.</Trans>;
          break;
        case ErrorCode.DemoLinkExpired:
          errorMessage = <Trans>The download link has expired.</Trans>;
          break;
        default:
          errorMessage = getBoilerErrorMessageFromErrorCode(t`An error occurred.`, error as ErrorCode);
      }

      setState({
        ...state,
        status: Status.Error,
        error: errorMessage,
      });
    }
  };

  const onSubmit = async () => {
    if (isShareCodeEmpty) {
      return;
    }

    setState({
      ...state,
      status: Status.Loading,
    });

    const csIsRunning = await isCsRunning();
    if (csIsRunning) {
      setState({
        ...state,
        status: Status.Idle,
        csIsRunning: true,
      });
    } else {
      setState({
        ...state,
        status: Status.Loading,
        error: undefined,
      });
      sendDownloadDemoFromShareCode();
    }
  };

  const onShareCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      shareCode: event.target.value,
    });
  };

  if (csIsRunning) {
    return <CounterStrikeRunningDialog onConfirmClick={sendDownloadDemoFromShareCode} />;
  }

  return (
    <Dialog
      closeOnBackgroundClicked={status !== Status.Loading}
      closeOnEscPressed={status !== Status.Loading}
      onEnterPressed={onSubmit}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Share code</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8">
          <TextInput
            autoFocus={true}
            placeholder="CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            value={shareCode}
            onChange={onShareCodeChange}
            isDisabled={status === Status.Loading}
            label={<Trans>Enter a share code</Trans>}
          />
          {status === Status.Error && <ErrorMessage message={error} />}
        </div>
      </DialogContent>
      <DialogFooter>
        <SpinnableButton onClick={onSubmit} isDisabled={isShareCodeEmpty} isLoading={status === Status.Loading}>
          <Trans context="Button">Download</Trans>
        </SpinnableButton>
        <CancelButton onClick={hideDialog} isDisabled={status === Status.Loading} />
      </DialogFooter>
    </Dialog>
  );
}

export function DownloadDemoFromShareCodeButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<DownloadDemoFromShareCodeDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Share code</Trans>
    </Button>
  );
}
