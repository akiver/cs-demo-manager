import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import type { DatabaseMode } from 'csdm/node/settings/settings';
import { RadioInput } from 'csdm/ui/components/inputs/radio-input';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { makeElementNonInert } from 'csdm/ui/shared/inert';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';
import { useConnectDatabase } from 'csdm/ui/bootstrap/connect-database/use-connect-database';
import { useDatabaseSettings } from './use-database-settings';

function SwitchDatabaseModeDialog({ mode }: { mode: DatabaseMode }) {
  const databaseSettings = useDatabaseSettings();
  const connect = useConnectDatabase();
  const { hideDialog } = useDialog();
  const [error, setError] = useState<string | undefined>(undefined);

  const onConfirm = async () => {
    const connectionError = await connect({ ...databaseSettings, mode });
    if (connectionError) {
      setError(connectionError.message);

      return;
    }

    hideDialog();
    makeElementNonInert(APP_ELEMENT_ID);
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Change database</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
    >
      <div className="flex flex-col gap-y-12">
        <p>
          <Trans>CS Demo Manager will reconnect to the selected database.</Trans>
        </p>
        <p>
          <Trans>
            Your demos are not transferred: each database has its own data and demos have to be analyzed again.
          </Trans>
        </p>
        {error && (
          <div className="flex flex-col gap-8">
            <ErrorMessage message={<Trans>The connection to the database failed with the following error:</Trans>} />
            <p className="text-body-strong select-text">{error}</p>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}

export function DatabaseModeSelector() {
  const { mode } = useDatabaseSettings();
  const { showDialog } = useDialog();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as DatabaseMode;
    if (newMode !== mode) {
      showDialog(<SwitchDatabaseModeDialog mode={newMode} />);
    }
  };

  return (
    <div className="flex flex-col gap-y-8">
      <RadioInput
        id="database-mode-embedded"
        name="database-mode"
        value="embedded"
        checked={mode === 'embedded'}
        onChange={onChange}
        label={<Trans>Built-in database (recommended)</Trans>}
      />
      <RadioInput
        id="database-mode-external"
        name="database-mode"
        value="external"
        checked={mode === 'external'}
        onChange={onChange}
        label={<Trans>External PostgreSQL server</Trans>}
      />
    </div>
  );
}
