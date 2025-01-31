import { updateSteamAccountName } from 'csdm/node/database/steam-accounts/update-steam-account-name';
import { handleError } from '../../handle-error';

export type UpdateSteamAccountNamePayload = {
  steamId: string;
  name: string;
};

export async function updateSteamAccountNameHandler({ steamId, name }: UpdateSteamAccountNamePayload) {
  try {
    return await updateSteamAccountName(steamId, name);
  } catch (error) {
    handleError(error, 'Error while updating steam account name');
  }
}
