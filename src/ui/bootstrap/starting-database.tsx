import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Spinner } from '../components/spinner';
import { useDatabaseSettings } from 'csdm/ui/settings/database/use-database-settings';

export function StartingDatabase() {
  const { mode } = useDatabaseSettings();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-12">
      <Spinner size={70} />
      {mode === 'embedded' ? (
        <div className="flex database-form-max-width flex-col items-center gap-y-4 text-center">
          <p>
            <Trans>Starting the built-in database…</Trans>
          </p>
          <p className="text-body-strong">
            <Trans>It takes a few seconds on the first launch, while the database is created.</Trans>
          </p>
        </div>
      ) : (
        <p>
          <Trans>Connecting to the database…</Trans>
        </p>
      )}
    </div>
  );
}
