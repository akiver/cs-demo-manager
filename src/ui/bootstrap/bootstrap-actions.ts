import { createAction } from '@reduxjs/toolkit';
import type { InitializeApplicationSuccessPayload } from '../../server/handlers/renderer-process/initialize-application-handler';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';

export const initializeAppSuccess = createAction<InitializeApplicationSuccessPayload>(
  'bootstrap/initializationSuccess',
);
export const connectDatabaseSuccess = createAction('bootstrap/connectDatabaseSuccess');
export const connectDatabaseError = createAction<{ error: ConnectDatabaseError | undefined }>(
  'bootstrap/connectDatabaseError',
);
export const disconnectDatabaseSuccess = createAction('bootstrap/disconnectDatabaseSuccess');
