import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { DatabaseMode } from 'csdm/node/settings/settings';
import { RadioInput } from 'csdm/ui/components/inputs/radio-input';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { makeElementNonInert } from 'csdm/ui/shared/inert';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';
import { useConnectDatabase } from 'csdm/ui/bootstrap/connect-database/use-connect-database';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { disconnectDatabaseSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useDatabaseSettings } from './use-database-settings';

// ! JSON.stringify(new Error()) is "{}", and it throws on a circular value: the message would be
// replaced by an empty object exactly when there is something to tell the user.
function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === 'string' ? error : undefined;
}

function SwitchDatabaseModeDialog({ mode }: { mode: DatabaseMode }) {
  const databaseSettings = useDatabaseSettings();
  const connect = useConnectDatabase();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateSettings = useUpdateSettings();
  const { hideDialog } = useDialog();
  const { t } = useLingui();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const closeDialog = () => {
    hideDialog();
    makeElementNonInert(APP_ELEMENT_ID);
  };

  const switchToExternalServer = async () => {
    // ! The connection form is the only place where the server can be entered, and it's shown by the
    // bootstrap screen. Connecting from here would use whatever the settings hold, which on an
    // installation that never used an external server are placeholders nobody can correct.
    await updateSettings({
      database: {
        ...databaseSettings,
        mode: 'external',
      },
    });

    try {
      await client.send({
        name: RendererClientMessageName.DisconnectDatabase,
      });
    } catch (error) {
      // ! The mode has to go back to what it was: the app is still connected to the built-in
      // database and the settings would claim otherwise, including on the next start.
      await updateSettings({
        database: {
          ...databaseSettings,
          mode: 'embedded',
        },
      });

      throw error;
    }

    dispatch(disconnectDatabaseSuccess());
    closeDialog();
  };

  const switchToEmbeddedDatabase = async () => {
    const connectionError = await connect({ ...databaseSettings, mode: 'embedded' });
    if (connectionError) {
      setError(connectionError.message);

      return;
    }

    closeDialog();
  };

  const onConfirm = async () => {
    // ! The dialog stays busy until the switch settles: it keeps a second confirmation from starting
    // a concurrent reconnection, and Cancel from closing while one is still in flight.
    setIsBusy(true);
    setError(undefined);
    try {
      await (mode === 'embedded' ? switchToEmbeddedDatabase() : switchToExternalServer());
    } catch (error) {
      logger.error(error);
      setError(formatError(error) ?? t`Unknown error`);
    }
    setIsBusy(false);
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Change database</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      isBusy={isBusy}
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
