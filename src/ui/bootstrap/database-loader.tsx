import React, { useEffect } from 'react';
import { type ReactElement } from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDatabaseStatus } from './use-database-status';
import { ConnectDatabase } from './connect-database/connect-database';
import { StartingDatabase } from './starting-database';
import { DatabaseStatus } from './database-status';
import { connectDatabaseStarted, connectDatabaseSuccess, connectDatabaseError } from './bootstrap-actions';
import { useLingui } from '@lingui/react/macro';
import { buildUiDatabaseOperationError } from 'csdm/ui/shared/format-error';

type Props = {
  children: ReactElement;
};

export function DatabaseLoader({ children }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const databaseStatus = useDatabaseStatus();
  const { t } = useLingui();

  useEffect(() => {
    if (databaseStatus !== DatabaseStatus.Idle) {
      return;
    }

    const connectDatabase = async () => {
      dispatch(connectDatabaseStarted());
      try {
        const result = await client.send({
          name: RendererClientMessageName.ConnectDatabase,
          payload: undefined,
        });
        if (result.error) {
          dispatch(connectDatabaseError({ error: result.error }));
        } else {
          dispatch(connectDatabaseSuccess());
        }
      } catch (error) {
        dispatch(connectDatabaseError({ error: buildUiDatabaseOperationError(error, t`Unknown error`) }));
      }
    };

    void connectDatabase();
  }, [databaseStatus, client, dispatch, t]);

  if (databaseStatus === DatabaseStatus.Idle || databaseStatus === DatabaseStatus.Connecting) {
    return <StartingDatabase />;
  }

  if (databaseStatus === DatabaseStatus.Error || databaseStatus === DatabaseStatus.Disconnected) {
    return <ConnectDatabase />;
  }

  return children;
}
