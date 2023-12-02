import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Status } from 'csdm/common/types/status';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { addIgnoredSteamAccountSuccess } from 'csdm/ui/ban/ban-actions';
import { ErrorMessage } from 'csdm/ui/components/error-message';

function getErrorMessageFromError(error: unknown) {
  switch (error) {
    case ErrorCode.SteamAccountAlreadyIgnored:
      return <Trans>This account is already ignored.</Trans>;
    case ErrorCode.SteamAccountNotFound:
      return <Trans>Steam account not found.</Trans>;
    case ErrorCode.InvalidSteamCommunityUrl:
      return <Trans>Invalid Steam community URL.</Trans>;
    case ErrorCode.SteamApiForbidden:
      return <Trans>The Steam API returned a forbidden error.</Trans>;
    case ErrorCode.SteamApiTooManyRequests:
      return <Trans>Too many requests sent to the Steam API.</Trans>;
    case ErrorCode.SteamApiError:
      return <Trans>The Steam API returned an error.</Trans>;
    default:
      return <Trans>An error occurred.</Trans>;
  }
}

export function AddIgnoredSteamAccountDialog() {
  const client = useWebSocketClient();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [errorMessage, setErrorMessage] = useState<ReactNode>('');
  const [steamIdentifier, setSteamIdentifier] = useState('');
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const submit = async () => {
    try {
      setStatus(Status.Loading);
      const account = await client.send({
        name: RendererClientMessageName.AddIgnoredSteamAccount,
        payload: steamIdentifier,
      });
      dispatch(
        addIgnoredSteamAccountSuccess({
          account,
        }),
      );
      hideDialog();
    } catch (error) {
      setStatus(Status.Error);
      const errorMessage = getErrorMessageFromError(error);
      setErrorMessage(errorMessage);
    }
  };

  return (
    <Dialog
      closeOnBackgroundClicked={status !== Status.Loading}
      closeOnEscPressed={status !== Status.Loading}
      onEnterPressed={submit}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Ignore Steam account</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-12">
          <p>
            <Trans>The Steam account will be ignored from VAC ban stats.</Trans>
          </p>
          <div className="flex flex-col gap-y-8">
            <InputLabel htmlFor="steamid">
              <Trans context="Input label">SteamID64 or Steam community profile URL</Trans>
            </InputLabel>
            <TextInput
              autoFocus={true}
              id="steamid"
              placeholder="https://steamcommunity.com/id/username/ | 76561198000697560"
              value={steamIdentifier}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSteamIdentifier(event.target.value);
              }}
            />
            {status === Status.Error && <ErrorMessage message={errorMessage} />}
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <SpinnableButton onClick={submit} isLoading={status === Status.Loading} isDisabled={steamIdentifier === ''}>
          <Trans context="Button">Add</Trans>
        </SpinnableButton>
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
