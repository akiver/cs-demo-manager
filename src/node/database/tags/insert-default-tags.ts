import { db } from '../database';
import type { InsertableTag } from './tag-table';

export async function insertDefaultTags() {
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
