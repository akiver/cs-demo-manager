import { deleteIgnoredSteamAccount } from 'csdm/node/database/steam-accounts/delete-ignored-steam-account';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';
import { handleError } from '../../handle-error';

export async function deleteIgnoredSteamAccountHandler(steamId: string) {
  try {
    await deleteIgnoredSteamAccount(steamId);

    server.sendPushMessage({
      name: ServerPushMessageName.IgnoredSteamAccountsChanged,
    });
  } catch (error) {
    handleError(error, `Error while deleting ignored Steam account with Steam id ${steamId}`);
  }
}
