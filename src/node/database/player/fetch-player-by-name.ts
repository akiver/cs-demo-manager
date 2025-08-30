import { fetchPlayersTable } from 'csdm/node/database/players/fetch-players-table';
import { PlayerNotFound } from 'csdm/node/errors/player-not-found';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import type { PlayerTable } from 'csdm/common/types/player-table';

export async function fetchPlayerByName(name: string): Promise<PlayerTable> {
  const players = await fetchPlayersTable({
    name,
    sources: [],
    origins: [],
    tagIds: [],
    bans: [],
  });

  if (players.length === 0) {
    throw new PlayerNotFound(`Player with name ${name} not found`);
  }

  if (players.length > 1) {
    throw new InvalidArgument(
      `Multiple players found with name ${name}. Please use the --focus-player option with a Steam ID.`,
    );
  }

  return players[0];
}
