import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { Status } from 'csdm/common/types/status';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { ErrorCode } from 'csdm/common/error-code';
import { isEmptyString } from 'csdm/common/string/is-empty-string';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from '../error-message';

type Props = {
  checksum: string;
  currentName: string;
};

export function RenameDialog({ checksum, currentName }: Props) {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [name, setName] = useState<string>(currentName);
  const unknownError = <Trans>An error occurred.</Trans>;
  const [error, setError] = useState<ReactNode>(unknownError);
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const submit = async () => {
    if (name === currentName) {
      hideDialog();
      return;
    }

    try {
      setStatus(Status.Loading);
      await client.send({
        name: RendererClientMessageName.RenameDemo,
        payload: {
          checksum,
          name,
        },
      });
      dispatch(demoRenamed({ checksum, name }));
      hideDialog();
    } catch (error) {
      if (error === ErrorCode.InvalidDemoName) {
        setError(<Trans>Invalid name.</Trans>);
      } else {
        setError(unknownError);
      }
      setStatus(Status.Error);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const isBusy = status === Status.Loading;
  const isValidName = isEmptyString(name);

  return (
    <ConfirmDialog
      title={<Trans>Rename</Trans>}
      onConfirm={submit}
      isBusy={isBusy}
      isConfirmButtonDisabled={isValidName}
      closeOnConfirm={false}
    >
      <div className="flex flex-col gap-y-8 max-w-[448px]">
        <p>
          <Trans>
            Only the name visible from the application will change, it will not change the filename on your operating
            system.
          </Trans>
        </p>
        <TextInput
          value={name}
          autoFocus={true}
          isDisabled={isBusy}
          onChange={onChange}
          placeholder={currentName}
          onEnterKeyDown={submit}
        />
        {status === Status.Error && <ErrorMessage message={error} />}
      </div>
    </ConfirmDialog>
  );
}
