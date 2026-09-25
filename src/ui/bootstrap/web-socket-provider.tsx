import type { ReactNode } from 'react';
import React, { createContext, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { WebSocketClient } from '../web-socket-client';
import { Loading } from './loading';
import { LoadingError } from './loading-error';
import { useRegisterWebSocketListeners } from './use-register-web-socket-listeners';

export const WebSocketContext = createContext<WebSocketClient | null>(null);

type Props = {
  children: ReactNode;
};

export function WebSocketProvider({ children }: Props) {
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [error, setError] = useState('');
  const { t } = useLingui();
  const [client] = useState(() => {
    const onConnectionSuccess = () => {
      setStatus(Status.Success);
    };

    const onConnectionError = (event: CloseEvent) => {
      const code = event.code;
      const port = window.csdm.WEB_SOCKET_SERVER_PORT;
      setError(
        t`The connection to the local server on port ${port} failed with code ${code}. The port might be reserved or blocked by another application. Restarting your computer or freeing the port may fix the issue.`,
      );
      setStatus(Status.Error);
    };

    return new WebSocketClient(onConnectionSuccess, onConnectionError);
  });
  useRegisterWebSocketListeners(client);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred connecting to the WebSocket server.</Trans>} error={error} />;
  }

  return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>;
}
