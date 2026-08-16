import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDatabaseSettings } from 'csdm/ui/settings/database/use-database-settings';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { EmbeddedDatabaseInfo } from 'csdm/server/handlers/renderer-process/database/get-embedded-database-info-handler';
import { useConnectDatabase } from './use-connect-database';

type Props = {
  children: React.ReactNode;
};

export function EmbeddedDatabaseError({ children }: Props) {
  const client = useWebSocketClient();
  const databaseSettings = useDatabaseSettings();
  const connect = useConnectDatabase();
  const [isConnecting, setIsConnecting] = useState(false);
  const [info, setInfo] = useState<EmbeddedDatabaseInfo | undefined>(undefined);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setInfo(
          await client.send({
            name: RendererClientMessageName.GetEmbeddedDatabaseInfo,
          }),
        );
      } catch (error) {
        logger.error(error);
      }
    };

    void fetchInfo();
  }, [client]);

  const retry = async () => {
    setIsConnecting(true);
    const error = await connect(databaseSettings);
    if (error) {
      setIsConnecting(false);
    }
  };

  const useExternalDatabase = async () => {
    setIsConnecting(true);
    const error = await connect({ ...databaseSettings, mode: 'external' });
    if (error) {
      setIsConnecting(false);
    }
  };

  return (
    <div className="m-auto flex max-w-[600px] flex-col">
      <p>
        <Trans>CS Demo Manager couldn't start its built-in database.</Trans>
      </p>
      {children}
      <div className="mt-12 flex gap-8">
        <Button variant={ButtonVariant.Primary} onClick={retry} isDisabled={isConnecting}>
          <Trans>Retry</Trans>
        </Button>
        {info !== undefined && (
          <Button
            onClick={() => {
              window.csdm.browseToFile(info.logFilePath);
            }}
          >
            <Trans>Show logs</Trans>
          </Button>
        )}
        <Button onClick={useExternalDatabase} isDisabled={isConnecting}>
          <Trans>Use an external PostgreSQL server</Trans>
        </Button>
      </div>
    </div>
  );
}
