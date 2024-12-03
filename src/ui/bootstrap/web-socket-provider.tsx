import type { ReactNode } from 'react';
import React, { createContext, useRef, useState } from 'react';
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
  const clientRef = useRef<WebSocketClient | null>(null);
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [error, setError] = useState('');
  const { t } = useLingui();

  const getClient = () => {
    if (clientRef.current === null) {
      const onConnectionSuccess = () => {
        setStatus(Status.Success);
      };

      const onConnectionError = (event: CloseEvent) => {
        const code = event.code;
        setError(t`The connection to the WebSocket server failed with code ${code}.`);
        setStatus(Status.Error);
      };

      clientRef.current = new WebSocketClient(onConnectionSuccess, onConnectionError);
    }

    return clientRef.current;
  };
  const client: WebSocketClient = getClient();
  useRegisterWebSocketListeners(client);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred connecting to the WebSocket server.</Trans>} error={error} />;
  }

  return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>;
}
