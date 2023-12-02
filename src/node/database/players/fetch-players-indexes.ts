import type { PlayerIndex } from 'csdm/common/types/player-index';
import { db } from '../database';

export async function fetchPlayersIndexes(checksum: string): Promise<PlayerIndex> {
  const rows = await db
    .selectFrom('players')
    .select(['players.steam_id', 'players.index'])
    .where('players.match_checksum', '=', checksum)
    .execute();

  const playersIndexes: PlayerIndex = {};
  for (const row of rows) {
    playersIndexes[row.steam_id] = row.index;
  }

  return playersIndexes;
}
