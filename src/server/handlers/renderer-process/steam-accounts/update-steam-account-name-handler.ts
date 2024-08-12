import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { updateSteamAccountName } from 'csdm/node/database/steam-accounts/update-steam-account-name';

export type UpdateSteamAccountNamePayload = {
  steamId: string;
  name: string;
};

export async function updateSteamAccountNameHandler({ steamId, name }: UpdateSteamAccountNamePayload) {
  try {
    return await updateSteamAccountName(steamId, name);
  } catch (error) {
    logger.error('Error while updating steam account name');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
