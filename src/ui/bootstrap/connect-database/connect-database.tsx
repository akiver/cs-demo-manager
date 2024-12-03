import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { PortInput } from 'csdm/ui/components/inputs/port-input';
import { DatabaseNameInput } from 'csdm/ui/components/inputs/database-name-input';
import { UsernameInput } from 'csdm/ui/components/inputs/username-input';
import { PasswordInput } from 'csdm/ui/components/inputs/password-input';
import { ConnectDatabaseButton } from 'csdm/ui/bootstrap/connect-database/connect-database-button';
import { HelpLink } from './help-link';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDatabaseSettings } from 'csdm/ui/settings/database/use-database-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { AppWrapper } from '../app-wrapper';
import { AppContent } from '../app-content';
import { connectDatabaseError, connectDatabaseSuccess } from '../bootstrap-actions';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useBootstrapState } from '../use-bootstrap-state';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { useArgument } from '../use-argument';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { ResetDatabaseButton } from 'csdm/ui/settings/database/reset-database-button';

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
    case ErrorCode.PsqlNotFound:
      return (
        <p>
          <Trans>
            It usually means that PostgreSQL is not installed on your system or the path to the <strong>psql</strong>{' '}
            executable is not in your <strong>PATH</strong> environment variable.
          </Trans>
        </p>
      );
    case ErrorCode.PsqlTimeout:
      return (
        <p>
          <Trans>It usually means that the PostgreSQL service is not running, make sure it's running.</Trans>
        </p>
      );
    case ErrorCode.DatabaseSchemaVersionMismatch:
      return <DatabaseSchemaVersionMismatch />;
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
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const currentDatabaseSettings: DatabaseSettings = useDatabaseSettings();
  const updateSettings = useUpdateSettings();
  const { error } = useBootstrapState();
  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>(currentDatabaseSettings);
  const [isConnecting, setIsConnecting] = useState(false);
  const [secondsBeforeNextTry, setSecondsBeforeNextTry] = useState(-1);
  const animationId = useRef<number | null>(null);
  const appOpenedAtLoginArg = useArgument(ArgumentName.AppOpenedAtLogin);

  const stopRetrying = () => {
    if (animationId.current !== null) {
      window.cancelAnimationFrame(animationId.current);
    }
    setSecondsBeforeNextTry(-1);
  };

  const connectDatabase = useCallback(async () => {
    stopRetrying();
    setIsConnecting(true);
    const error = await client.send({
      name: RendererClientMessageName.ConnectDatabase,
      payload: databaseSettings,
    });
    if (error) {
      setIsConnecting(false);
      dispatch(connectDatabaseError({ error }));
    } else {
      await updateSettings({
        database: databaseSettings,
      });
      dispatch(connectDatabaseSuccess());
    }

    return error;
  }, [client, databaseSettings, dispatch, updateSettings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        connectDatabase();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (appOpenedAtLoginArg !== 'true') {
      return;
    }

    const delayInMs = 10_000;
    let start: number | null = null;
    const loop = async (time: number) => {
      if (start === null) {
        start = time;
      }

      const elapsed = time - start;
      if (elapsed >= delayInMs) {
        start = null;
        const error = await connectDatabase();
        if (error) {
          animationId.current = window.requestAnimationFrame(loop);
        }
      } else {
        const seconds = Math.round((delayInMs - elapsed) / 1000);
        setSecondsBeforeNextTry(seconds);
        animationId.current = window.requestAnimationFrame(loop);
      }
    };

    animationId.current = window.requestAnimationFrame(loop);

    return () => {
      stopRetrying();
    };
  }, [appOpenedAtLoginArg, connectDatabase]);

  const renderError = () => {
    if (!error) {
      return null;
    }

    const hint = getHintFromError(error);
    return (
      <div className="flex flex-col mt-8 max-w-[600px] m-auto">
        <ErrorMessage message={<Trans>The connection to the database failed with the following error:</Trans>} />
        <p className="text-body-strong select-text my-8">{error.message}</p>
        {hint}
      </div>
    );
  };

  return (
    <AppWrapper>
      <AppContent>
        <div className="flex flex-col m-auto">
          <div className="flex flex-col w-[400px] m-auto">
            <div>
              <p>
                <Trans>CS Demo Manager requires a PostgreSQL database.</Trans>
              </p>
              <HelpLink />
            </div>
            <div className="flex flex-col mt-12 gap-12">
              <div className="flex gap-x-8">
                <div className="w-full">
                  <HostnameInput
                    hostname={databaseSettings.hostname}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setDatabaseSettings({
                        ...databaseSettings,
                        hostname: event.target.value,
                      });
                    }}
                    isDisabled={isConnecting}
                  />
                </div>
                <PortInput
                  port={databaseSettings.port}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setDatabaseSettings({
                      ...databaseSettings,
                      port: +event.target.value,
                    });
                  }}
                  isDisabled={isConnecting}
                />
              </div>
              <DatabaseNameInput
                databaseName={databaseSettings.database}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDatabaseSettings({
                    ...databaseSettings,
                    database: event.target.value,
                  });
                }}
                isDisabled={isConnecting}
              />
              <UsernameInput
                username={databaseSettings.username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDatabaseSettings({
                    ...databaseSettings,
                    username: event.target.value,
                  });
                }}
                isDisabled={isConnecting}
              />
              <PasswordInput
                password={databaseSettings.password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDatabaseSettings({
                    ...databaseSettings,
                    password: event.target.value,
                  });
                }}
                isDisabled={isConnecting}
              />
              <div className="flex items-center justify-between">
                <ConnectDatabaseButton isLoading={isConnecting} onClick={connectDatabase} />
                {secondsBeforeNextTry > 0 && (
                  <div className="flex items-center gap-x-8">
                    <p>
                      <Plural value={secondsBeforeNextTry} one="Retrying in # second…" other="Retrying in # seconds…" />
                    </p>
                    <CancelButton onClick={stopRetrying} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {renderError()}
        </div>
      </AppContent>
    </AppWrapper>
  );
}
