import { db } from 'csdm/node/database/database';

type Filters = {
  checksums?: string[];
  steamIds?: string[];
};

type PlayerEnemiesFlashedCount = {
  steamId: string;
  enemiesFlashedCount: number;
};

export async function fetchPlayersEnemiesFlashedCount(filters: Filters): Promise<PlayerEnemiesFlashedCount[]> {
  const { count } = db.fn;
  let query = db
    .selectFrom('player_blinds')
    .select('flasher_steam_id as steamId')
    .select(count<number>('player_blinds.id').as('enemiesFlashedCount'))
    .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
    .where('player_blinds.is_flasher_controlling_bot', '=', false)
    .groupBy('flasher_steam_id');

  const checksums = filters.checksums ?? [];
  if (checksums.length > 0) {
    query = query.where('player_blinds.match_checksum', 'in', checksums);
  }

  const steamIds = filters.steamIds ?? [];
  if (steamIds.length > 0) {
    query = query.where('player_blinds.flasher_steam_id', 'in', steamIds);
  }

  const rows = await query.execute();

  return rows.map((row) => {
    return {
      steamId: row.steamId,
      enemiesFlashedCount: Number(row.enemiesFlashedCount),
    };
  });
}
