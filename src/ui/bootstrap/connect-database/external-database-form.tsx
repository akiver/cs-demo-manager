import React, { useState, useEffect, useRef } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { PortInput } from 'csdm/ui/components/inputs/port-input';
import { DatabaseNameInput } from 'csdm/ui/components/inputs/database-name-input';
import { UsernameInput } from 'csdm/ui/components/inputs/username-input';
import { PasswordInput } from 'csdm/ui/components/inputs/password-input';
import { ConnectDatabaseButton } from 'csdm/ui/bootstrap/connect-database/connect-database-button';
import { HelpLink } from './help-link';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { useDatabaseSettings } from 'csdm/ui/settings/database/use-database-settings';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';
import { useArgument } from '../use-argument';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { Button } from 'csdm/ui/components/buttons/button';
import { useConnectDatabase } from './use-connect-database';

type Props = {
  children: React.ReactNode;
};

export function ExternalDatabaseForm({ children }: Props) {
  const currentDatabaseSettings: DatabaseSettings = useDatabaseSettings();
  const connect = useConnectDatabase();
  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>({
    ...currentDatabaseSettings,
    mode: 'external',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [secondsBeforeNextTry, setSecondsBeforeNextTry] = useState(-1);
  const animationId = useRef<number | null>(null);
  const appOpenedAtLoginArg = useArgument(ArgumentName.AppOpenedAtLogin);
  const settingsRef = useRef(databaseSettings);
  settingsRef.current = databaseSettings;

  const isRetrying = useRef(false);

  const stopRetrying = () => {
    // ! The flag is what stops a loop currently awaiting a connection: cancelling the frame has no
    // effect on it, it would schedule the next one as soon as the request settles.
    isRetrying.current = false;
    if (animationId.current !== null) {
      window.cancelAnimationFrame(animationId.current);
    }
    setSecondsBeforeNextTry(-1);
  };

  const connectDatabase = async () => {
    setIsConnecting(true);
    const error = await connect(settingsRef.current);
    if (error) {
      setIsConnecting(false);
    }

    return error;
  };
  const connectDatabaseRef = useRef(connectDatabase);
  connectDatabaseRef.current = connectDatabase;

  // ! Only the attempts started by the user stop the retry loop, the ones the loop makes itself
  // obviously must not.
  const connectDatabaseManually = async () => {
    stopRetrying();
    await connectDatabaseRef.current();
  };
  const connectDatabaseManuallyRef = useRef(connectDatabaseManually);
  connectDatabaseManuallyRef.current = connectDatabaseManually;

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      // ! Restricted to the inputs: a focused button already activates on Enter, running the
      // shortcut too would start a second connection, with another mode for the built-in one.
      if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) {
        return;
      }

      event.stopPropagation();
      await connectDatabaseManuallyRef.current();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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
        const error = await connectDatabaseRef.current();
        if (error && isRetrying.current) {
          animationId.current = window.requestAnimationFrame(loop);
        }
      } else {
        const seconds = Math.round((delayInMs - elapsed) / 1000);
        setSecondsBeforeNextTry(seconds);
        animationId.current = window.requestAnimationFrame(loop);
      }
    };

    isRetrying.current = true;
    animationId.current = window.requestAnimationFrame(loop);

    return () => {
      stopRetrying();
    };
  }, [appOpenedAtLoginArg]);

  const useEmbeddedDatabase = async () => {
    // ! Without it the retry loop would keep running and a later success would persist the external
    // mode back, undoing the switch the user just made.
    stopRetrying();
    setIsConnecting(true);
    const error = await connect({ ...databaseSettings, mode: 'embedded' });
    if (error) {
      setIsConnecting(false);
    }
  };

  return (
    <div className="m-auto flex flex-col">
      <div className="m-auto flex w-[400px] flex-col">
        <div>
          <p>
            <Trans>CS Demo Manager requires a PostgreSQL database.</Trans>
          </p>
          <HelpLink />
        </div>
        <div className="mt-12 flex flex-col gap-12">
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
            <ConnectDatabaseButton isLoading={isConnecting} onClick={connectDatabaseManually} />
            {secondsBeforeNextTry > 0 && (
              <div className="flex items-center gap-x-8">
                <p>
                  <Plural value={secondsBeforeNextTry} one="Retrying in # second…" other="Retrying in # seconds…" />
                </p>
                <CancelButton onClick={stopRetrying} />
              </div>
            )}
          </div>
          <div>
            <Button onClick={useEmbeddedDatabase} isDisabled={isConnecting}>
              <Trans>Use the built-in database</Trans>
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
