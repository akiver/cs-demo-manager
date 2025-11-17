import { db } from 'csdm/node/database/database';
import { cameraRowToCamera } from './camera-row-to-camera';
import type { Game } from 'csdm/common/types/counter-strike';

export async function fetchCameras(game?: Game) {
  const query = db.selectFrom('cameras').selectAll().orderBy('name');
  if (game) {
    query.where('game', '=', game);
  }
  const rows = await query.execute();
  const cameras = await Promise.all(rows.map(cameraRowToCamera));

  return cameras;
}
