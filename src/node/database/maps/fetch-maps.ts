import { db } from 'csdm/node/database/database';
import { mapRowToMap } from './map-row-to-map';

export async function fetchMaps() {
  const rows = await db.selectFrom('maps').selectAll().orderBy('name').execute();
  const maps = await Promise.all(rows.map(mapRowToMap));

  return maps;
}
