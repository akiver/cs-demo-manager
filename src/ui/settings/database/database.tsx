import React from 'react';
import { Trans } from '@lingui/react/macro';
import { PortInput } from '../../components/inputs/port-input';
import { DatabaseNameInput } from '../../components/inputs/database-name-input';
import { UsernameInput } from '../../components/inputs/username-input';
import { PasswordInput } from '../../components/inputs/password-input';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';
import { DatabaseMode } from 'csdm/common/types/database-mode';

export function Database() {
  const { mode, hostname, port, username, password, database } = useDatabaseSettings();

  if (mode === DatabaseMode.Embedded) {
    return (
      <div className="flex flex-col gap-y-8">
        <p>
          <Trans>The database is embedded with CS Demo Manager, no configuration is required.</Trans>
        </p>
        <p>
          <Trans>To use a PostgreSQL server instead, disconnect and select it from the connection screen.</Trans>
        </p>
        <div className="mt-12">
          <DisconnectDatabaseButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-[264px] flex-col gap-y-8">
      <HostnameInput hostname={hostname} />
      <DatabaseNameInput databaseName={database} />
      <UsernameInput username={username} />
      <PasswordInput password={password} />
      <PortInput port={port} />
      <div className="mt-12">
        <DisconnectDatabaseButton />
      </div>
    </div>
  );
}
