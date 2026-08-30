import { addIgnoredSteamAccount } from 'csdm/node/database/steam-accounts/add-ignored-steam-account';
import { server } from 'csdm/server/server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { handleError } from '../../handle-error';

export async function addIgnoredSteamAccountHandler(steamIdentifier: string) {
  try {
    const ignoredAccount = await addIgnoredSteamAccount(steamIdentifier);

    server.sendPushMessage({
      name: ServerPushMessageName.IgnoredSteamAccountsChanged,
    });

    return ignoredAccount;
  } catch (error) {
    handleError(error, `Error while adding Steam account to ignored accounts with identifier ${steamIdentifier}`);
  }
}
