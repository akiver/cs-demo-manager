import type { PlayerSlot } from 'csdm/common/types/player-slot';
import { db } from '../database';

export async function fetchMatchPlayersSlots(checksum: string): Promise<PlayerSlot> {
  const rows = await db
    .selectFrom('players')
    .select(['players.steam_id', 'players.index as slot'])
    .where('players.match_checksum', '=', checksum)
    .execute();

  const slots: PlayerSlot = {};
  for (const row of rows) {
    slots[row.steam_id] = row.slot;
  }

  return slots;
}
