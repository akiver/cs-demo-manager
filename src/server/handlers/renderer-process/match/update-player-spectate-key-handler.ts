import { updatePlayerSpectateKey } from 'csdm/node/database/match-players/update-player-spectate-key';
import { handleError } from 'csdm/server/handlers/handle-error';

export type UpdatePlayerSpectateKeyPayload = {
  playerId: string;
  key: number;
};

export async function updatePlayerSpectateKeyHandler({ playerId, key }: UpdatePlayerSpectateKeyPayload) {
  try {
    await updatePlayerSpectateKey(playerId, key);
  } catch (error) {
    handleError(error, 'Error while updating player spectate key');
  }
}
