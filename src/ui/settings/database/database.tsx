import React from 'react';
import { PortInput } from '../../components/inputs/port-input';
import { DatabaseNameInput } from '../../components/inputs/database-name-input';
import { UsernameInput } from '../../components/inputs/username-input';
import { PasswordInput } from '../../components/inputs/password-input';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';

export function Database() {
  const { hostname, port, username, password, database } = useDatabaseSettings();

  return (
    <div className="flex flex-col gap-y-8 max-w-[264px]">
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
