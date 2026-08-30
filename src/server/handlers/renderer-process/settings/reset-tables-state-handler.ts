import { server } from 'csdm/server/server';
import { resetTablesState } from 'csdm/node/settings/table/reset-tables-state';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { handleError } from 'csdm/server/handlers/handle-error';

export async function resetTablesStateHandler() {
  try {
    await resetTablesState();
    server.sendPushMessage({
      name: ServerPushMessageName.ResetTablesStateSuccess,
    });
  } catch (error) {
    handleError(error, 'Error while resetting tables state');
  }
}
