import { server } from 'csdm/server/server';
import { resetTablesState } from 'csdm/node/settings/table/reset-tables-state';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { handleError } from 'csdm/server/handlers/handle-error';

export async function resetTablesStateHandler() {
  try {
    await resetTablesState();
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.ResetTablesStateSuccess,
    });
  } catch (error) {
    handleError(error, 'Error while resetting tables state');
  }
}
