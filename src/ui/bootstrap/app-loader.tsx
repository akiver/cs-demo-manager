import React, { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Loading } from './loading';
import { App } from './app';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { initializeAppSuccess } from './bootstrap-actions';
import { Status } from 'csdm/common/types/status';
import { LoadingError } from './loading-error';

export function AppLoader() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { t } = useLingui();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    if (status !== Status.Loading) {
      return;
    }

    const initializeApplication = async () => {
      try {
        const payload = await client.send({
          name: RendererClientMessageName.InitializeApplication,
        });

        dispatch(initializeAppSuccess(payload));
        setStatus(Status.Success);
      } catch (error) {
        let errorMessage = t`An error occurred while loading the application.`;
        if (typeof error === 'string') {
          errorMessage = error;
        }
        setError(errorMessage);
        setStatus(Status.Error);
      }
    };

    initializeApplication();
  }, [t, client, dispatch, status]);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred while loading the application.</Trans>} error={error} />;
  }

  return <App />;
}
