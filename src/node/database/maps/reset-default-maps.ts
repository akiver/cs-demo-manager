import type { Game } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { getDefaultMaps } from 'csdm/node/database/maps/default-maps';
import { deleteMapImageFiles } from 'csdm/node/filesystem/maps/delete-map-image-files';

export async function resetDefaultMaps(game: Game) {
  const defaultMaps = getDefaultMaps(game);

  await db
    .insertInto('maps')
    .values(defaultMaps)
    .onConflict((oc) => {
      return oc.constraint('maps_name_game_unique').doUpdateSet({
        position_x: (b) => b.ref('excluded.position_x'),
        position_y: (b) => b.ref('excluded.position_y'),
        scale: (b) => b.ref('excluded.scale'),
        name: (b) => b.ref('excluded.name'),
      });
    })
    .execute();

  for (const map of defaultMaps) {
    await deleteMapImageFiles(map);
  }
}
