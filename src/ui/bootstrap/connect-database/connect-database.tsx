import React from 'react';
import { Trans } from '@lingui/react/macro';
import { AppWrapper } from '../app-wrapper';
import { AppContent } from '../app-content';
import { useBootstrapState } from '../use-bootstrap-state';
import { useDatabaseSettings } from 'csdm/ui/settings/database/use-database-settings';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { ResetDatabaseButton } from 'csdm/ui/settings/database/reset-database-button';
import { ExternalDatabaseForm } from './external-database-form';
import { EmbeddedDatabaseError } from './embedded-database-error';

function DatabaseSchemaVersionMismatch() {
  return (
    <div>
      <p>
        <Trans>
          It looks like you installed an older version of CS Demo Manager and the current database schema is not
          compatible with it.
        </Trans>
      </p>
      <p>
        <Trans>
          You can either update CS Demo Manager to the latest version or reset the database to start from scratch.
        </Trans>
      </p>

      <div className="mt-8">
        <ResetDatabaseButton variant={ButtonVariant.Danger} />
      </div>
    </div>
  );
}

function getHintFromError({ code, message }: ConnectDatabaseError) {
  switch (code) {
    case ErrorCode.DatabaseSchemaVersionMismatch:
      return <DatabaseSchemaVersionMismatch />;
    case ErrorCode.EmbeddedPostgresVersionMismatch:
      return (
        <p>
          <Trans>
            The built-in database was created by another version of CS Demo Manager. Update the app to the latest
            version, or reset the built-in database to start from an empty one.
          </Trans>
        </p>
      );
    case ErrorCode.EmbeddedPostgresStateMissing:
      return (
        <p>
          <Trans>
            The password of the built-in database is stored next to it and is the only one it accepts. Without it the
            database can't be opened anymore, resetting it creates an empty one.
          </Trans>
        </p>
      );
    case ErrorCode.EmbeddedPostgresBinariesMissing:
      return (
        <p>
          <Trans>
            The PostgreSQL files shipped with the app are missing. Reinstalling CS Demo Manager usually fixes it.
          </Trans>
        </p>
      );
    case ErrorCode.EmbeddedPostgresStartFailed:
      return (
        <p>
          <Trans>
            It usually means that an antivirus is blocking the database process or that the database folder is not
            writable.
          </Trans>
        </p>
      );
  }

  if (message.includes('ECONNREFUSED')) {
    return (
      <p>
        <Trans>
          This error usually means that the database is not running or that the connection settings are incorrect.
        </Trans>
      </p>
    );
  }

  return (
    <p>
      <Trans>Make sure PostgreSQL is running and your settings are correct.</Trans>
    </p>
  );
}

export function ConnectDatabase() {
  const { error } = useBootstrapState();
  const { mode } = useDatabaseSettings();

  const renderError = () => {
    if (!error) {
      return null;
    }

    return (
      <div className="m-auto mt-8 flex database-page-max-width flex-col">
        <ErrorMessage message={<Trans>The connection to the database failed with the following error:</Trans>} />
        <p className="my-8 text-body-strong select-text">{error.message}</p>
        {getHintFromError(error)}
      </div>
    );
  };

  return (
    <AppWrapper>
      <AppContent>
        {mode === 'embedded' ? (
          <EmbeddedDatabaseError>{renderError()}</EmbeddedDatabaseError>
        ) : (
          <ExternalDatabaseForm>{renderError()}</ExternalDatabaseForm>
        )}
      </AppContent>
    </AppWrapper>
  );
}
