import React, { useEffect } from 'react';
import { type ReactElement } from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Loading } from './loading';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDatabaseStatus } from './use-database-status';
import { ConnectDatabase } from './connect-database/connect-database';
import { DatabaseStatus } from './database-status';
import { connectDatabaseSuccess, connectDatabaseError } from './bootstrap-actions';

type Props = {
  children: ReactElement;
};

export function DatabaseLoader({ children }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const databaseStatus = useDatabaseStatus();

  useEffect(() => {
    if (databaseStatus !== DatabaseStatus.Idle) {
      return;
    }

    const connectDatabase = async () => {
      const error = await client.send({
        name: RendererClientMessageName.ConnectDatabase,
        payload: undefined,
      });
      if (error) {
        dispatch(connectDatabaseError({ error }));
      } else {
        dispatch(connectDatabaseSuccess());
      }
    };

    connectDatabase();
  }, [databaseStatus, client, dispatch]);

  if (databaseStatus === DatabaseStatus.Idle) {
    return <Loading />;
  }

  if (databaseStatus === DatabaseStatus.Error || databaseStatus === DatabaseStatus.Disconnected) {
    return <ConnectDatabase />;
  }

  return children;
}
