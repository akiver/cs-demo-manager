import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Status } from 'csdm/common/types/status';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { useIgnoreSteamAccount } from './use-ignored-steam-account';

export function AddIgnoredSteamAccountDialog() {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [errorMessage, setErrorMessage] = useState<ReactNode>('');
  const [steamIdentifier, setSteamIdentifier] = useState('');
  const { hideDialog } = useDialog();
  const { ignoreSteamAccount, getErrorMessageFromError } = useIgnoreSteamAccount();

  const submit = async () => {
    try {
      setStatus(Status.Loading);
      await ignoreSteamAccount(steamIdentifier);
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
            <TextInput
              autoFocus={true}
              label={<Trans context="Input label">SteamID64 or Steam community profile URL</Trans>}
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
