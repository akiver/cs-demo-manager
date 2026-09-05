import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';
import { DatabaseMode } from 'csdm/common/types/database-mode';

type DetailProps = {
  label: ReactNode;
  value: ReactNode;
};

function Detail({ label, value }: DetailProps) {
  return (
    <p>
      <span className="text-gray-700">{label}</span> <span className="text-body-strong select-text">{value}</span>
    </p>
  );
}

function ExternalServerDetails() {
  const { hostname, port, database, username } = useDatabaseSettings();

  return (
    <div className="flex flex-col">
      <Detail label={<Trans>Host</Trans>} value={hostname} />
      <Detail label={<Trans>Port</Trans>} value={port} />
      <Detail label={<Trans>Database</Trans>} value={database} />
      <Detail label={<Trans>User</Trans>} value={username} />
    </div>
  );
}

export function Database() {
  const { mode } = useDatabaseSettings();
  const isEmbedded = mode === DatabaseMode.Embedded;

  return (
    <SettingsEntry
      title={<Trans>Connection</Trans>}
      description={
        <div className="flex flex-col gap-y-4">
          <p>
            {isEmbedded ? (
              <Trans>Connected to the embedded PostgreSQL server.</Trans>
            ) : (
              <Trans>Connected to an external PostgreSQL server.</Trans>
            )}
          </p>
          {!isEmbedded && <ExternalServerDetails />}
          <p>
            <Trans>Disconnect to connect to another server.</Trans>
          </p>
        </div>
      }
      interactiveComponent={<DisconnectDatabaseButton />}
    />
  );
}
