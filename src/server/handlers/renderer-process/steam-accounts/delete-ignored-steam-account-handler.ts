import { deleteIgnoredSteamAccount } from 'csdm/node/database/steam-accounts/delete-ignored-steam-account';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { handleError } from '../../handle-error';

export async function deleteIgnoredSteamAccountHandler(steamId: string) {
  try {
    await deleteIgnoredSteamAccount(steamId);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.IgnoredSteamAccountsChanged,
    });
  } catch (error) {
    handleError(error, `Error while deleting ignored Steam account with Steam id ${steamId}`);
  }
}
