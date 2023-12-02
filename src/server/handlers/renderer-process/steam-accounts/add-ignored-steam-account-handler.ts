import { addIgnoredSteamAccount } from 'csdm/node/database/steam-accounts/add-ignored-steam-account';
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { handleError } from '../../handle-error';

export async function addIgnoredSteamAccountHandler(steamIdentifier: string) {
  try {
    const ignoredAccount = await addIgnoredSteamAccount(steamIdentifier);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.IgnoredSteamAccountsChanged,
    });

    return ignoredAccount;
  } catch (error) {
    handleError(error, `Error while adding Steam account to ignored accounts with identifier ${steamIdentifier}`);
  }
}
