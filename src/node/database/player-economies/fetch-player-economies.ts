import { db } from 'csdm/node/database/database';
import type { PlayerEconomy } from 'csdm/common/types/player-economy';
import { playerEconomyRowToPlayerEconomy } from './player-economy-row-to-player-economy';

export async function fetchPlayersEconomies(checksum: string) {
  const query = db
    .selectFrom('player_economies')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .orderBy('round_number', 'asc');

  const rows = await query.execute();

  const playersEconomy: PlayerEconomy[] = rows.map((row) => {
    return playerEconomyRowToPlayerEconomy(row);
  });

  return playersEconomy;
}
