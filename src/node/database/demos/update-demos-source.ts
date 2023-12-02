import type { DemoSource } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';

export async function updateDemosSource(checksums: string[], source: DemoSource) {
  await db
    .updateTable('demos')
    .set({
      source,
    })
    .where('checksum', 'in', checksums)
    .execute();
}
