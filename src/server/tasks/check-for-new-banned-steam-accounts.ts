import { syncSteamAccountsWithPlayers } from 'csdm/node/database/steam-accounts/sync-steam-accounts-with-players';
import { updateSteamAccountsFromSteam } from 'csdm/node/database/steam-accounts/update-steam-accounts-from-steam';
import { isTimestampExpired } from 'csdm/node/database/timestamps/is-timestamp-expired';
import { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';
import { updateTimestamp } from 'csdm/node/database/timestamps/update-timestamp';
import { NetworkError } from 'csdm/node/errors/network-error';
import { getErrorCodeFromError } from '../get-error-code-from-error';
import { server } from '../server';
import { SharedServerMessageName } from '../shared-server-message-name';

let errorHasBeenNotified = false;

export async function checkForNewBannedSteamAccounts() {
  try {
    const shouldCheck = await isTimestampExpired(TimestampName.SyncWithSteam);
    if (!shouldCheck) {
      return;
    }

    const syncedSteamIds = await syncSteamAccountsWithPlayers();
    const newBannedSteamIds = await updateSteamAccountsFromSteam(syncedSteamIds);

    if (newBannedSteamIds.length > 0) {
      server.broadcast({
        name: SharedServerMessageName.NewBannedAccounts,
        payload: newBannedSteamIds,
      });
    }
    errorHasBeenNotified = false;
  } catch (error) {
    logger.error('Error while checking for new banned Steam accounts');
    logger.error(error);
    if (errorHasBeenNotified) {
      return;
    }

    if (!(error instanceof NetworkError)) {
      const errorCode = getErrorCodeFromError(error);
      server.broadcast({
        name: SharedServerMessageName.NewBannedAccountsError,
        payload: errorCode,
      });
      errorHasBeenNotified = true;
    }
  } finally {
    await updateTimestamp(TimestampName.SyncWithSteam);
  }
}
