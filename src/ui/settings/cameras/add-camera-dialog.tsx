import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { NameInput } from 'csdm/ui/settings/cameras/form/name-input';
import type { CameraPayload } from 'csdm/server/handlers/renderer-process/cameras/camera-payload';
import { addCameraSuccess } from 'csdm/ui/cameras/cameras-actions';
import { CameraForm } from './form/camera-form';

export function AddCameraDialog() {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = async (payload: CameraPayload) => {
    try {
      const camera = await client.send({
        name: RendererClientMessageName.AddCamera,
        payload,
      });
      hideDialog();
      dispatch(addCameraSuccess({ camera }));
    } catch (error) {
      setError(t`An error occurred`);
    }
  };

  return <CameraForm onSubmit={submit} error={error} nameInput={<NameInput />} />;
}
