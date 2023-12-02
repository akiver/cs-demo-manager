import type { DemoType } from 'csdm/common/types/counter-strike';
import { db } from '../database';

export async function updateMatchesType(checksums: string[], type: DemoType) {
  await db
    .updateTable('matches')
    .set({
      type,
    })
    .where('checksum', 'in', checksums)
    .execute();
}
