import { Game } from 'csdm/common/types/counter-strike';
import { readMapBombDamage } from 'csdm/node/filesystem/maps/read-map-bomb-damage';
import { isDefuseMapFromName } from 'csdm/common/counter-strike/is-defuse-map-from-name';
import { handleError } from '../../handle-error';

export type FetchMapBombDamagePayload = {
  mapName: string;
  game: Game;
  networkProtocol: number;
};

export async function fetchMapBombDamageHandler({ mapName, game, networkProtocol }: FetchMapBombDamagePayload) {
  try {
    if (game !== Game.CS2 || !isDefuseMapFromName(mapName)) {
      return null;
    }

    const data = await readMapBombDamage(mapName, game);
    // The demo has been recorded before the map got baked data, its explosions used the legacy radial model.
    if (data === null || networkProtocol < data.minNetworkProtocol) {
      return null;
    }

    return data;
  } catch (error) {
    handleError(error, 'Error while fetching map bomb damage');
  }
}
