import type { DemoType } from 'csdm/common/types/counter-strike';
import { db } from '../database';

export async function updateDemosType(checksums: string[], type: DemoType) {
  await db
    .updateTable('demos')
    .set({
      type,
    })
    .where('checksum', 'in', checksums)
    .execute();
}
