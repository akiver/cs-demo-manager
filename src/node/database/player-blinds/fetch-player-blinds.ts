import { db } from 'csdm/node/database/database';
import { playerBlindRowToPlayerBlind } from './player-blind-row-to-player-blind';
import type { PlayerBlind } from 'csdm/common/types/player-blind';

export async function fetchPlayerBlinds(checksum: string) {
  const rows = await db.selectFrom('player_blinds').selectAll().where('match_checksum', '=', checksum).execute();
  const playerBlinds: PlayerBlind[] = rows.map((row) => {
    return playerBlindRowToPlayerBlind(row);
  });

  return playerBlinds;
}
