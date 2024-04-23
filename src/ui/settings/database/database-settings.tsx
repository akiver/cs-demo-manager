import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { Database } from 'csdm/ui/settings/database/database';
import { DatabaseSize } from './database-size';
import { OptimizeDatabaseButton } from './optimize-database-button';
import { ResetDatabaseButton } from './reset-database-button';
import { ImportV2DataButton } from './import-v2-data-button';

export function DatabaseSettings() {
  return (
    <SettingsView>
      <DatabaseSize />
      <div className="flex gap-8 mt-8 mb-12">
        <OptimizeDatabaseButton />
        <ResetDatabaseButton />
        <ImportV2DataButton />
      </div>
      <Database />
    </SettingsView>
  );
}
