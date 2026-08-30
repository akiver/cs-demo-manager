import React, { useState, useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';

export function DatabaseSize() {
  const client = useWebSocketClient();
  const [size, setDatabaseSize] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getDatabaseSize = async () => {
      try {
        const size = await client.send({
          name: RendererClientMessageName.GetDatabaseSize,
        });
        setDatabaseSize(size);
      } catch (error) {
        setHasError(true);
      }
    };

    client.on(ServerPushMessageName.OptimizeDatabaseSuccess, getDatabaseSize);

    void getDatabaseSize();

    return () => {
      client.off(ServerPushMessageName.OptimizeDatabaseSuccess, getDatabaseSize);
    };
  }, [client]);

  return hasError ? (
    <p>
      <Trans>An error occurred.</Trans>
    </p>
  ) : (
    <p>
      <Trans>
        Database size: <span>{size}</span>.
      </Trans>
    </p>
  );
}
