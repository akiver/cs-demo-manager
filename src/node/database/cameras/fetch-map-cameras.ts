import { db } from 'csdm/node/database/database';
import type { Game } from 'csdm/common/types/counter-strike';

export async function fetchMapCameras(game: Game, mapName: string) {
  const rows = await db
    .selectFrom('cameras')
    .select(['name', 'x', 'y', 'z', 'pitch', 'yaw', 'color'])
    .where('game', '=', game)
    .where('map_name', '=', mapName)
    .orderBy('name')
    .execute();

  return rows;
}
