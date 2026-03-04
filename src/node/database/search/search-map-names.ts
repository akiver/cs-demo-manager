import type { Expression, SqlBool } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';

export async function searchMapNames({ name, ignoredNames }: MapNamesFilter) {
  const query = db
    .selectFrom('demos')
    .innerJoin('matches', 'matches.checksum', 'demos.checksum')
    .select(['demos.map_name'])
    .distinctOn(['demos.map_name'])
    .where(({ eb, or, and }) => {
      const filters: Expression<SqlBool>[] = [or([eb('demos.map_name', 'ilike', `%${name}%`)])];

      if (ignoredNames.length > 0) {
        filters.push(eb('demos.map_name', 'not in', ignoredNames));
      }

      return and(filters);
    })
    .limit(20);

  const rows = await query.execute();

  const maps = rows.map((row) => {
    return row.map_name;
  });

  return maps;
}
