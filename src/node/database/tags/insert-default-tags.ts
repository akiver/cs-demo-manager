import type { Kysely } from 'kysely';
import type { InsertableTag } from './tag-table';
import type { Database } from '../schema';

export async function insertDefaultTags(db: Kysely<Database>) {
  const defaultTags: InsertableTag[] = [
    {
      name: 'To watch',
      color: '#f29423',
    },
    {
      name: 'Watched',
      color: '#33ab84',
    },
  ];

  await db
    .insertInto('tags')
    .values(defaultTags)
    .onConflict((oc) => oc.column('name').doNothing())
    .execute();
}
