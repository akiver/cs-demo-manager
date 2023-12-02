import type { Expression, SqlBool } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';

export async function searchMapNames({ name, ignoredNames }: MapNamesFilter) {
  const query = db
    .selectFrom('matches')
    .select(['matches.map_name'])
    .distinctOn(['matches.map_name'])
    .where(({ eb, or, and }) => {
      const filters: Expression<SqlBool>[] = [or([eb('matches.map_name', 'ilike', `%${name}%`)])];

      if (ignoredNames.length > 0) {
        filters.push(eb('matches.map_name', 'not in', ignoredNames));
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
