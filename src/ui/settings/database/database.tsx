import React from 'react';
import { PortInput } from '../../components/inputs/port-input';
import { DatabaseNameInput } from '../../components/inputs/database-name-input';
import { UsernameInput } from '../../components/inputs/username-input';
import { PasswordInput } from '../../components/inputs/password-input';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';
import { DatabaseModeSelector } from './database-mode-selector';
import { EmbeddedDatabase } from './embedded-database';

export function Database() {
  const { mode, hostname, port, username, password, database } = useDatabaseSettings();

  return (
    <div className="flex max-w-[400px] flex-col gap-y-16">
      <DatabaseModeSelector />
      {mode === 'embedded' ? (
        <EmbeddedDatabase />
      ) : (
        <div className="flex max-w-[264px] flex-col gap-y-8">
          <HostnameInput hostname={hostname} />
          <DatabaseNameInput databaseName={database} />
          <UsernameInput username={username} />
          <PasswordInput password={password} />
          <PortInput port={port} />
        </div>
      )}
      <div>
        <DisconnectDatabaseButton />
      </div>
    </div>
  );
}
