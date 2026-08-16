import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { EmbeddedDatabaseInfo } from 'csdm/server/handlers/renderer-process/database/get-embedded-database-info-handler';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ResetEmbeddedDatabaseButton } from './reset-embedded-database-button';

export function EmbeddedDatabase() {
  const client = useWebSocketClient();
  const [info, setInfo] = useState<EmbeddedDatabaseInfo | undefined>(undefined);
  const [hasError, setHasError] = useState(false);

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
        setHasError(true);
      }
    };

    void fetchInfo();
  }, [client]);

  if (hasError) {
    return <ErrorMessage message={<Trans>Unable to read the built-in database information.</Trans>} />;
  }

  if (info === undefined) {
    return null;
  }

  const { version, port } = info;

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans>PostgreSQL version: {version}</Trans>
      </p>
      {port !== undefined && (
        <p>
          <Trans>Port: {port}</Trans>
        </p>
      )}
      <p className="select-text">{info.dataFolderPath}</p>
      <div className="flex gap-8">
        <Button
          onClick={() => {
            window.csdm.browseToFolder(info.dataFolderPath);
          }}
        >
          <Trans context="Button">Show database folder</Trans>
        </Button>
        <Button
          onClick={() => {
            window.csdm.browseToFile(info.logFilePath);
          }}
        >
          <Trans context="Button">Show logs</Trans>
        </Button>
        <ResetEmbeddedDatabaseButton />
      </div>
    </div>
  );
}
