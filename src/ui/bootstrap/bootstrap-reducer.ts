import { createReducer } from '@reduxjs/toolkit';
import { connectDatabaseError, connectDatabaseSuccess, disconnectDatabaseSuccess } from './bootstrap-actions';
import { DatabaseStatus } from './database-status';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';

export type BootstrapState = {
  readonly databaseStatus: DatabaseStatus;
  readonly error: ConnectDatabaseError | undefined;
};

const initialState: BootstrapState = {
  databaseStatus: DatabaseStatus.Idle,
  error: undefined,
};

export const bootstrapReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(connectDatabaseSuccess, (state) => {
      state.databaseStatus = DatabaseStatus.Connected;
      state.error = undefined;
    })
    .addCase(connectDatabaseError, (state, action) => {
      state.databaseStatus = DatabaseStatus.Error;
      state.error = action.payload.error;
    })
    .addCase(disconnectDatabaseSuccess, (state) => {
      state.databaseStatus = DatabaseStatus.Disconnected;
      state.error = undefined;
    });
});
