import { getUsersSummary } from 'csdm/node/steam-web-api/get-users-summary';
import { SteamApiError } from 'csdm/node/steam-web-api/steamapi-error';
import type { ValvePlayer } from 'csdm/common/types/valve-match';

export async function updateValvePlayersFromSteam(players: ValvePlayer[]) {
  try {
    const steamIds: string[] = players.map((player) => player.steamId);
    const playersSummaries = await getUsersSummary(steamIds);
    for (const player of players) {
      // ! When a Steam account has been deleted the API returns an empty object, make sure it really exists.
      const playerSummary = playersSummaries.find((summary) => {
        return summary.steamid === player.steamId;
      });
      if (playerSummary) {
        player.name = playerSummary.personaname;
        player.avatar = playerSummary.avatar;
      } else {
        player.name = 'Deleted account';
      }
    }
  } catch (error) {
    logger.error('Error while updating match info players from Steam');
    logger.error(error);
    if (!(error instanceof SteamApiError)) {
      throw error;
    }
  }
}
